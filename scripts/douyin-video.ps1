$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$defaultOutput = Join-Path $repoRoot "out\downloads\douyin"
$env:PYTHONIOENCODING = "utf-8"

$hasOutput = $false
for ($index = 0; $index -lt $args.Count; $index++) {
  if ($args[$index] -eq "-o" -or $args[$index] -eq "--output") {
    $hasOutput = $true
    break
  }
}

$douyinArgs = @($args)
if (-not $hasOutput) {
  New-Item -ItemType Directory -Force -Path $defaultOutput | Out-Null
  $douyinArgs += @("-o", $defaultOutput)
}

$ffmpegPath = (& node -e "process.stdout.write(require('ffmpeg-static') || '')").Trim()
if ($ffmpegPath -and (Test-Path -LiteralPath $ffmpegPath)) {
  $ffmpegDirectory = Split-Path -Parent $ffmpegPath
  $env:Path = "$ffmpegDirectory;$env:Path"
}

$scriptPath = Join-Path $repoRoot ".agents\skills\douyin-video\scripts\douyin_downloader.py"
& python $scriptPath @douyinArgs
exit $LASTEXITCODE
