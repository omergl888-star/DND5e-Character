param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$ReferenceRoot = "C:\Users\omerg\OneDrive\Documents\Projects\DND-5e-last"
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$classRacePath = Join-Path $ReferenceRoot "data-classes-races.js"
$spellPath = Join-Path $ReferenceRoot "data-spells.js"
$rulesPath = Join-Path $ReferenceRoot "data-rules.js"
$librariesPath = Join-Path $ReferenceRoot "data-libraries.js"

if (-not (Test-Path -LiteralPath $classRacePath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $spellPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $rulesPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $librariesPath -PathType Leaf)) {
    throw "The supplied coverage reference files could not be found."
}

function ConvertTo-CoverageId([string]$Value) {
    return (($Value.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim('-'))
}

function ConvertFrom-JsQuoted([string]$Value) {
    $trimmed = $Value.Trim()
    if ($trimmed.Length -ge 2) { $trimmed = $trimmed.Substring(1, $trimmed.Length - 2) }
    return ($trimmed -replace "\\'", "'" -replace '\\"', '"' -replace '\\\\', '\')
}

$classRaceText = [IO.File]::ReadAllText($classRacePath)
$spellText = [IO.File]::ReadAllText($spellPath)
$rulesText = [IO.File]::ReadAllText($rulesPath)
$librariesText = [IO.File]::ReadAllText($librariesPath)

$raceBlock = [regex]::Match($classRaceText, '(?s)const RACES\s*=\s*\{(?<body>.*?)\n\};')
if (-not $raceBlock.Success) { throw "Could not locate the RACES coverage block." }
$raceMatches = [regex]::Matches($raceBlock.Groups['body'].Value, '(?m)^  (?<id>[a-z0-9]+):\{name:''(?<name>[^'']+)''')
$races = @($raceMatches | ForEach-Object {
    [ordered]@{
        id = ConvertTo-CoverageId $_.Groups['name'].Value
        referenceId = $_.Groups['id'].Value
        name = $_.Groups['name'].Value
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "complete normalized mechanics", "builder validation")
    }
})

$classBlock = [regex]::Match($classRaceText, '(?s)const CLASSES\s*=\s*\{(?<body>.*?)\n\};')
if (-not $classBlock.Success) { throw "Could not locate the CLASSES coverage block." }
$classMatches = [regex]::Matches($classBlock.Groups['body'].Value, '(?m)^  (?<id>[a-z]+):\s*\{name:''(?<name>[^'']+)''')
$classes = @($classMatches | ForEach-Object {
    [ordered]@{
        id = $_.Groups['id'].Value
        name = $_.Groups['name'].Value
        edition = "2014"
        source = [ordered]@{ name = "SRD 5.1 (Creative Commons)"; url = "https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf" }
        status = "enabled"
        missing = @()
    }
})

$spellRaw = [regex]::Match($spellText, '(?s)const SPELL_RAW=`(?<body>.*?)`;')
if (-not $spellRaw.Success) { throw "Could not locate the spell coverage index." }
$spells = @($spellRaw.Groups['body'].Value -split "`r?`n" | Where-Object { $_.Trim() } | ForEach-Object {
    $parts = $_ -split '\|'
    [ordered]@{
        id = ConvertTo-CoverageId $parts[0]
        name = $parts[0]
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "class spell lists", "complete casting and upcasting rules")
    }
})

$libraryEntryPattern = [regex]@'
\{n:(?<name>'(?:\\'|[^'])*'|"(?:\\"|[^"])*"),g:(?<group>'(?:\\'|[^'])*'|"(?:\\"|[^"])*")
'@
$featureBlock = [regex]::Match($librariesText, '(?s)const FEATURE_LIB=\[(?<body>.*?)\n\];')
$raceTraitBlock = [regex]::Match($librariesText, '(?s)const RACE_LIB=\[(?<body>.*?)\n\];')
if (-not $featureBlock.Success -or -not $raceTraitBlock.Success) { throw "Could not locate feature coverage blocks." }

$features = @($libraryEntryPattern.Matches($featureBlock.Groups['body'].Value) | ForEach-Object {
    $name = ConvertFrom-JsQuoted $_.Groups['name'].Value
    [ordered]@{
        id = ConvertTo-CoverageId $name
        name = $name
        group = ConvertFrom-JsQuoted $_.Groups['group'].Value
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "normalized mechanics", "level and dependency validation")
    }
})

$racialTraits = @($libraryEntryPattern.Matches($raceTraitBlock.Groups['body'].Value) | ForEach-Object {
    $name = ConvertFrom-JsQuoted $_.Groups['name'].Value
    [ordered]@{
        id = ConvertTo-CoverageId ((ConvertFrom-JsQuoted $_.Groups['group'].Value) + "-" + $name)
        name = $name
        group = ConvertFrom-JsQuoted $_.Groups['group'].Value
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "normalized mechanics", "race dependency validation")
    }
})

$featBlock = [regex]::Match($librariesText, '(?s)const FEATS=\[(?<body>.*?)\];')
$featMatches = [regex]::Matches($featBlock.Groups['body'].Value, "'(?:\\'|[^'])*'")
$feats = @($featMatches | ForEach-Object {
    $name = ConvertFrom-JsQuoted $_.Value
    [ordered]@{
        id = ConvertTo-CoverageId $name
        name = $name
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "prerequisites", "complete mechanics")
    }
})

$languageBlock = [regex]::Match($librariesText, '(?s)const LANGUAGES=\[(?<body>.*?)\];')
$languages = @($libraryEntryPattern.Matches($languageBlock.Groups['body'].Value) | ForEach-Object {
    $name = ConvertFrom-JsQuoted $_.Groups['name'].Value
    [ordered]@{
        id = ConvertTo-CoverageId $name
        name = $name
        group = ConvertFrom-JsQuoted $_.Groups['group'].Value
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("source and edition verification")
    }
})

$rulesBlock = [regex]::Match($rulesText, '(?s)const RULES_DB=\[(?<body>.*?)\n\];')
$ruleMatches = [regex]::Matches($rulesBlock.Groups['body'].Value, '(?m)^\["(?<name>(?:\\"|[^"])*)",')
$rulesCoverage = @($ruleMatches | ForEach-Object {
    $name = $_.Groups['name'].Value -replace '\\"', '"'
    [ordered]@{
        id = ConvertTo-CoverageId $name
        name = $name
        edition = "mixed"
        source = [ordered]@{ name = "Provided coverage inventory"; url = $null }
        status = "coverage"
        missing = @("official source verification", "edition-specific rule text")
    }
})

if ($races.Count -ne 46) { throw "Expected 46 races, found $($races.Count)." }
if ($classes.Count -ne 12) { throw "Expected 12 classes, found $($classes.Count)." }
if ($spells.Count -ne 522) { throw "Expected 522 spells, found $($spells.Count)." }
if ($features.Count -ne 146) { throw "Expected 146 feature records, found $($features.Count)." }
if ($racialTraits.Count -ne 168) { throw "Expected 168 racial trait records, found $($racialTraits.Count)." }
if ($feats.Count -ne 77) { throw "Expected 77 feat records, found $($feats.Count)." }
if ($rulesCoverage.Count -ne 39) { throw "Expected 39 rules records, found $($rulesCoverage.Count)." }
if ($languages.Count -ne 18) { throw "Expected 18 language records, found $($languages.Count)." }

$coverage = [ordered]@{
    version = 1
    generatedFrom = @("data-classes-races.js", "data-rules.js", "data-spells.js", "data-libraries.js")
    policy = "Names and identifiers only. Coverage records are never displayed in the Character Builder."
    races = $races
    classes = $classes
    spells = $spells
    features = $features
    racialTraits = $racialTraits
    feats = $feats
    rules = $rulesCoverage
    languages = $languages
}

$targetDirectory = Join-Path $ProjectRoot "data\coverage"
[IO.Directory]::CreateDirectory($targetDirectory) | Out-Null
$json = $coverage | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path $targetDirectory "catalog-coverage.json"), $json + "`r`n", $utf8NoBom)
Write-Output "Imported coverage only: $($races.Count) races, $($classes.Count) classes, $($spells.Count) spells, $($features.Count) features, $($racialTraits.Count) racial traits, $($feats.Count) feats, $($rulesCoverage.Count) rules, and $($languages.Count) languages."
