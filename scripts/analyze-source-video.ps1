param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string] $Source,

  [Parameter(Position = 1)]
  [string] $Slug,

  [ValidateSet("auto", "douyin", "bilibili", "local", "url")]
  [string] $Platform = "auto",

  [switch] $Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$analysisDir = Join-Path $repoRoot "docs\video-analysis\raw"
$douyinDir = Join-Path $repoRoot "out\downloads\douyin"
$bilibiliDir = Join-Path $repoRoot "out\downloads\bilibili"

New-Item -ItemType Directory -Force -Path $analysisDir | Out-Null
New-Item -ItemType Directory -Force -Path $douyinDir | Out-Null
New-Item -ItemType Directory -Force -Path $bilibiliDir | Out-Null

function Test-LocalFile {
  param([string] $Path)

  $resolved = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
  return $null -ne $resolved -and (Test-Path -LiteralPath $resolved.Path -PathType Leaf)
}

function Normalize-Slug {
  param([string] $Value)

  $normalized = ($Value -replace "[^A-Za-z0-9_-]", "-").Trim("-")
  $normalized = $normalized -replace "-+", "-"
  if ($normalized) {
    return $normalized
  }

  return "video-" + (Get-Date -Format "yyyyMMdd-HHmmss")
}

function Get-SourcePlatform {
  param([string] $Value)

  if (Test-LocalFile $Value) {
    return "local"
  }

  if ($Value -match "douyin\.com|v\.douyin\.com|[?&]modal_id=\d+|^\d{10,}$") {
    return "douyin"
  }

  if ($Value -match "bilibili\.com|b23\.tv|^BV[A-Za-z0-9]+$|^av\d+$|^ep\d+$") {
    return "bilibili"
  }

  return "url"
}

function Get-DefaultSlug {
  param(
    [string] $Value,
    [string] $DetectedPlatform
  )

  if ($DetectedPlatform -eq "local") {
    $resolved = Resolve-Path -LiteralPath $Value
    return Normalize-Slug ([System.IO.Path]::GetFileNameWithoutExtension($resolved.Path))
  }

  if ($DetectedPlatform -eq "douyin") {
    if ($Value -match "[?&]modal_id=(\d+)") {
      return Normalize-Slug $Matches[1]
    }
    if ($Value -match "douyin\.com/video/(\d+)") {
      return Normalize-Slug $Matches[1]
    }
    if ($Value -match "^\d{10,}$") {
      return Normalize-Slug $Value
    }
  }

  if ($DetectedPlatform -eq "bilibili") {
    if ($Value -match "(BV[A-Za-z0-9]+)") {
      return Normalize-Slug $Matches[1]
    }
    if ($Value -match "(av\d+)") {
      return Normalize-Slug $Matches[1]
    }
    if ($Value -match "(ep\d+)") {
      return Normalize-Slug $Matches[1]
    }
  }

  return "video-" + (Get-Date -Format "yyyyMMdd-HHmmss")
}

function Get-RecentBilibiliMp4 {
  param([datetime] $Since)

  $candidates = Get-ChildItem -Recurse -File -LiteralPath $bilibiliDir -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -ieq ".mp4" -and $_.LastWriteTime -ge $Since.AddSeconds(-2) } |
    Sort-Object LastWriteTime -Descending

  if (-not $candidates) {
    throw "No new mp4 file was found after the Bilibili download. Check yutto output or auth status."
  }

  return $candidates[0].FullName
}

if ($Platform -eq "auto") {
  $detectedPlatform = Get-SourcePlatform $Source
} else {
  $detectedPlatform = $Platform
}

if ($Slug) {
  $baseSlug = Normalize-Slug $Slug
} else {
  $baseSlug = Get-DefaultSlug $Source $detectedPlatform
}
$analysisSlug = Normalize-Slug ("{0}-{1}" -f $detectedPlatform, $baseSlug)
$analysisPath = Join-Path $analysisDir ("{0}-style-analysis.json" -f $analysisSlug)

if ((Test-Path -LiteralPath $analysisPath) -and -not $Force) {
  Write-Output "Analysis already exists, skipping Gemini call: $analysisPath"
  exit 0
}

$videoPath = $null

switch ($detectedPlatform) {
  "local" {
    $videoPath = (Resolve-Path -LiteralPath $Source).Path
  }
  "douyin" {
    $douyinScript = Join-Path $PSScriptRoot "douyin-video.ps1"
    $downloadJson = & $douyinScript --link $Source --action download --json
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }

    $downloadInfo = $downloadJson | ConvertFrom-Json
    if (-not $Slug -and $downloadInfo.video_id) {
      $analysisSlug = Normalize-Slug ("douyin-{0}" -f $downloadInfo.video_id)
      $analysisPath = Join-Path $analysisDir ("{0}-style-analysis.json" -f $analysisSlug)
      if ((Test-Path -LiteralPath $analysisPath) -and -not $Force) {
        Write-Output "Analysis already exists, skipping Gemini call: $analysisPath"
        exit 0
      }
    }

    $videoPath = $downloadInfo.video_path
  }
  "bilibili" {
    $downloadStart = Get-Date
    $bilibiliScript = Join-Path $PSScriptRoot "bilibili-yutto.ps1"
    $bilibiliArgs = @(
      $Source,
      "--output-format", "mp4",
      "--no-danmaku",
      "--no-subtitle",
      "--no-cover"
    )

    & $bilibiliScript @bilibiliArgs
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }

    $videoPath = Get-RecentBilibiliMp4 $downloadStart
  }
  "url" {
    $videoPath = $Source
  }
  default {
    throw "Unsupported platform: $detectedPlatform"
  }
}

if (-not $videoPath) {
  throw "No video path resolved for source: $Source"
}

$analyzeScript = Join-Path $PSScriptRoot "analyze-style-video.ps1"
& $analyzeScript $videoPath $analysisSlug -Output $analysisPath -CookiesFromBrowser ""
exit $LASTEXITCODE
