$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$downloadDir = Join-Path $repoRoot "out\downloads\bilibili"
$configDir = Join-Path $repoRoot ".cache\yutto"
$tmpDir = Join-Path $repoRoot "out\tmp\yutto"

New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

$yuttoArgs = @($args)
if ($yuttoArgs.Count -eq 0) {
  $yuttoArgs = @("-h")
}

$downloadMount = "$((Resolve-Path -LiteralPath $downloadDir).Path):/app"
$configMount = "$((Resolve-Path -LiteralPath $configDir).Path):/root/.config/yutto"
$tmpMount = "$((Resolve-Path -LiteralPath $tmpDir).Path):/tmp/yutto"

$dockerArgs = @(
  "run",
  "--rm",
  "-v", $downloadMount,
  "-v", $configMount,
  "-v", $tmpMount
)

if ($yuttoArgs.Count -gt 0 -and $yuttoArgs[0] -eq "auth") {
  $dockerArgs += @("--entrypoint", "/opt/venv/bin/yutto")
}

$dockerArgs += @("siguremo/yutto")
$dockerArgs += $yuttoArgs

& docker @dockerArgs
exit $LASTEXITCODE
