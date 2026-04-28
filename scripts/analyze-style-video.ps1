param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string] $Url,

  [Parameter(Position = 1)]
  [string] $Slug,

  [string] $Output,

  [string] $CookiesFromBrowser = "edge"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")

if (-not $Slug) {
  if ($Url -match "(?:v=|youtu\.be/|shorts/)([A-Za-z0-9_-]{6,})") {
    $Slug = $Matches[1]
  } else {
    $Slug = "video-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  }
}

$Slug = ($Slug -replace "[^A-Za-z0-9_-]", "-").Trim("-")
if (-not $Slug) {
  $Slug = "video-" + (Get-Date -Format "yyyyMMdd-HHmmss")
}

if (-not $Output) {
  $Output = Join-Path $repoRoot ("docs\video-analysis\raw\{0}-style-analysis.json" -f $Slug)
}

$outputDirectory = Split-Path -Parent $Output
if ($outputDirectory) {
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$questionBytes = [System.Convert]::FromBase64String("6K+35oC757uT6L+Z5Liq6KeG6aKR55qE5ryU56S65rWB56iL77yM5bm25o+Q5Y+W5Y+v5aSN55So55qE6KeG6aKR6aOO5qC85qih5p2/77yM5YyF5ous6ZWc5aS06IqC5aWP44CB5a2X5bmV5pa55byP44CB6L2s5Zy644CBVUnmvJTnpLrmraXpqqTlkozpgILlkIjkvb/nlKjnmoRSZW1vdGlvbue7hOS7tuexu+Wei+OAgg==")
$question = [System.Text.Encoding]::UTF8.GetString($questionBytes)

$analyzeScript = Join-Path $PSScriptRoot "analyze-video.ps1"
$skillArgs = @($Url, "-q", $question, "-o", $Output)
if ($CookiesFromBrowser) {
  $skillArgs += @("--cookies-from-browser", $CookiesFromBrowser)
}

& $analyzeScript @skillArgs
exit $LASTEXITCODE
