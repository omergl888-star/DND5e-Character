param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$indexPath = Join-Path $ProjectRoot "index.html"
if (-not $OutputPath) { $OutputPath = Join-Path $ProjectRoot "dist\index.html" }

if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
    throw "index.html was not found at $indexPath"
}

$html = [IO.File]::ReadAllText($indexPath)
$bundleState = @{ Styles = 0; Scripts = 0 }

$stylePattern = [regex]'<link\s+rel="stylesheet"\s+href="(?<path>[^"]+)"\s+data-bundle\s*>'
$html = $stylePattern.Replace($html, {
    param($match)
    $referencePath = $match.Groups['path'].Value
    $relativePath = ($referencePath -split '\?', 2)[0]
    $sourcePath = Join-Path $ProjectRoot ($relativePath -replace '/', '\')
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing style sheet: $referencePath" }
    $content = [IO.File]::ReadAllText($sourcePath)
    $bundleState.Styles++
    return "<style data-source=`"$referencePath`">`r`n$content`r`n</style>"
})

$scriptPattern = [regex]'<script\s+src="(?<path>[^"]+)"\s+data-bundle\s*>\s*</script>'
$html = $scriptPattern.Replace($html, {
    param($match)
    $referencePath = $match.Groups['path'].Value
    $relativePath = ($referencePath -split '\?', 2)[0]
    $sourcePath = Join-Path $ProjectRoot ($relativePath -replace '/', '\')
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing script: $referencePath" }
    $content = [IO.File]::ReadAllText($sourcePath) -replace '(?i)</script', '<\/script'
    $bundleState.Scripts++
    return "<script data-source=`"$referencePath`">`r`n$content`r`n</script>"
})

$assetPattern = [regex]'(?<![A-Za-z0-9_-])(?:\./)?assets/(?<path>[A-Za-z0-9_./-]+\.(?<extension>png|jpg|jpeg|webp|gif))'
$assetCache = @{}
$html = $assetPattern.Replace($html, {
    param($match)
    $relativePath = "assets/" + $match.Groups['path'].Value
    if (-not $assetCache.ContainsKey($relativePath)) {
      $sourcePath = Join-Path $ProjectRoot ($relativePath -replace '/', '\')
      if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing asset: $relativePath" }
      $extension = $match.Groups['extension'].Value.ToLowerInvariant()
      $mime = switch ($extension) { "jpg" { "image/jpeg" } "jpeg" { "image/jpeg" } default { "image/$extension" } }
      $assetCache[$relativePath] = "data:$mime;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes($sourcePath))
    }
    return $assetCache[$relativePath]
})

if ($html -match 'data-bundle') { throw "The bundle still contains unresolved data-bundle tags." }
if ($html -match '(?:\./)?assets/[A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|webp|gif)') { throw "The bundle still contains unresolved image paths." }

$outputDirectory = Split-Path -Parent $OutputPath
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
[IO.File]::WriteAllText($OutputPath, $html, $utf8NoBom)
Write-Output "Built standalone HTML: $OutputPath"
Write-Output "Inlined styles: $($bundleState.Styles); scripts: $($bundleState.Scripts); images: $($assetCache.Count)."
