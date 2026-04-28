$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$componentsJson = Join-Path $repoRoot "components.json"

if (-not (Test-Path -LiteralPath $componentsJson)) {
  throw "components.json is missing. This project should keep the remocn/shadcn registry config at the repository root."
}

$componentArgs = @($args)
if ($componentArgs.Count -eq 0 -or $componentArgs[0] -eq "-h" -or $componentArgs[0] -eq "--help") {
  Write-Output "Usage: npm run remocn:add -- <component-name>"
  Write-Output "Example: npm run remocn:add -- blur-reveal"
  Write-Output "Example: npm run remocn:add -- @remocn/terminal-simulator"
  & npx -y shadcn@latest add --help
  exit $LASTEXITCODE
}

$normalizedArgs = @()
foreach ($arg in $componentArgs) {
  if ($arg.StartsWith("-")) {
    $normalizedArgs += $arg
  } elseif ($arg.StartsWith("@remocn/")) {
    $normalizedArgs += $arg
  } else {
    $normalizedArgs += "@remocn/$arg"
  }
}

& npx -y shadcn@latest add @normalizedArgs
exit $LASTEXITCODE
