param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [string]$OutputPath = "",

    [string]$Model = "isnet-anime",

    [switch]$AlphaMatting
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$cacheDir = Join-Path $projectRoot ".cache\rembg-models"

function Resolve-ProjectPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue,

        [Parameter(Mandatory = $true)]
        [string]$Root
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $Root $PathValue))
}

function Convert-ToContainerPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$HostPath,

        [Parameter(Mandatory = $true)]
        [string]$Root
    )

    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\')
    $pathFull = [System.IO.Path]::GetFullPath($HostPath)

    if (-not $pathFull.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Path must be inside project root: $pathFull"
    }

    $relative = $pathFull.Substring($rootFull.Length).TrimStart('\')
    return "/data/" + ($relative -replace "\\", "/")
}

$inputFull = Resolve-ProjectPath -PathValue $InputPath -Root $projectRoot
if (-not (Test-Path -LiteralPath $inputFull)) {
    throw "Input image does not exist: $inputFull"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $inputDir = Split-Path -Parent $inputFull
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($inputFull)
    $safeModel = $Model -replace "[^A-Za-z0-9_.-]", "-"
    $OutputPath = Join-Path $inputDir "$stem-rembg-$safeModel.png"
}

$outputFull = Resolve-ProjectPath -PathValue $OutputPath -Root $projectRoot
$outputDir = Split-Path -Parent $outputFull
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$inputContainer = Convert-ToContainerPath -HostPath $inputFull -Root $projectRoot
$outputContainer = Convert-ToContainerPath -HostPath $outputFull -Root $projectRoot

$rembgArgs = @("i", "-m", $Model)
if ($AlphaMatting) {
    $rembgArgs += "-a"
}
$rembgArgs += @($inputContainer, $outputContainer)

$dockerArgs = @(
    "run",
    "--rm",
    "-v",
    "${projectRoot}:/data",
    "-v",
    "${cacheDir}:/root/.u2net",
    "danielgatis/rembg"
) + $rembgArgs

& docker @dockerArgs
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Wrote $outputFull"
