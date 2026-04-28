$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")

$directories = @(
  "out\renders\ep01",
  "out\stills\ep01",
  "out\previews\ep01",
  "out\diagnostics\character-cutout",
  "out\downloads\video-understanding",
  "out\downloads\douyin",
  "out\downloads\bilibili",
  "out\tmp",
  "docs\video-analysis\raw",
  "docs\video-style-templates",
  "public\generated\images",
  "public\generated\videos",
  "public\generated\audio",
  "public\generated\captions"
)

foreach ($directory in $directories) {
  $path = Join-Path $repoRoot $directory
  New-Item -ItemType Directory -Force -Path $path | Out-Null
}

Write-Output "Output and generated asset directories are ready."
