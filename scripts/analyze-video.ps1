$ErrorActionPreference = "Stop"

$VideoArgs = $args

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $repoRoot ".env"

if (Test-Path -LiteralPath $envPath) {
  Get-Content -LiteralPath $envPath | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $separator = $line.IndexOf("=")
    if ($separator -lt 1) {
      return
    }

    $name = $line.Substring(0, $separator).Trim().Trim([char]0xFEFF)
    $value = $line.Substring($separator + 1).Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    Set-Item -Path "Env:$name" -Value $value
  }
}

$userSite = (& python -c "import site; print(site.USER_SITE)").Trim()
$userScripts = Join-Path (Split-Path -Parent $userSite) "Scripts"

$pathEntries = @()
if (Test-Path -LiteralPath $userScripts) {
  $pathEntries += $userScripts
}

$ffmpegPath = (& node -e "process.stdout.write(require('ffmpeg-static') || '')").Trim()
if ($ffmpegPath -and (Test-Path -LiteralPath $ffmpegPath)) {
  $pathEntries += (Split-Path -Parent $ffmpegPath)
}

$pathEntries += ($env:Path -split ";")
$env:Path = ($pathEntries | Where-Object { $_ } | Select-Object -Unique) -join ";"

$usesExplicitModel = $false
foreach ($arg in $VideoArgs) {
  if ($arg -eq "-m" -or $arg -eq "--model") {
    $usesExplicitModel = $true
    break
  }
}

if (-not $usesExplicitModel) {
  $VideoArgs = @($VideoArgs + @("-m", "gemini-2.5-flash-lite"))
}

$outputPath = $null
for ($index = 0; $index -lt $VideoArgs.Count; $index++) {
  if (($VideoArgs[$index] -eq "-o" -or $VideoArgs[$index] -eq "--output") -and $index + 1 -lt $VideoArgs.Count) {
    $outputPath = $VideoArgs[$index + 1]
    break
  }
}

if ($outputPath) {
  $outputDirectory = Split-Path -Parent $outputPath
  if ($outputDirectory) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
  }
}

$uvExe = Join-Path $userScripts "uv.exe"
if (-not (Test-Path -LiteralPath $uvExe)) {
  $uvExe = "uv"
}

$skillScript = Join-Path $repoRoot ".agents\skills\video-understanding\scripts\analyze_video.py"
& $uvExe run $skillScript @VideoArgs
exit $LASTEXITCODE
