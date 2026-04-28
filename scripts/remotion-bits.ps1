$ErrorActionPreference = "Stop"

$bitArgs = @($args)
if ($bitArgs.Count -eq 0) {
  $bitArgs = @("--help")
}

& npx -y remotion-bits @bitArgs
exit $LASTEXITCODE
