param(
  [string]$LegacyRoot = "C:\Users\omerg\OneDrive\Documents\Projects\DND-5e-last"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$rulesRoot = Join-Path $projectRoot "scripts\rules\2014"
$utf8 = New-Object System.Text.UTF8Encoding($false)
$baseUrl = "https://dnd5e.wikidot.com"

function Get-Page([string]$url) {
  (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 30).Content
}

function Plain([string]$html) {
  if ($null -eq $html) { return "" }
  $value = [regex]::Replace($html, "(?is)<script.*?</script>|<style.*?</style>", " ")
  $value = [regex]::Replace($value, "(?i)<br\s*/?>|</(?:p|li|td|th|h[1-6])>", " ")
  $value = [regex]::Replace($value, "<[^>]+>", " ")
  $value = [System.Net.WebUtility]::HtmlDecode($value)
  $badApostrophe = -join @([char]0x05D2, [char]0x20AC, [char]0x2122)
  $value = $value.Replace($badApostrophe, "'")
  [regex]::Replace($value, "\s+", " ").Trim()
}

function Slug([string]$value) {
  $slug = $value.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
  $slug.Trim("-")
}

function Write-JsData([string]$path, [string]$property, $value) {
  $json = $value | ConvertTo-Json -Depth 30 -Compress
  $content = @"
(function loadGenerated2014Data(global) {
  "use strict";
  const hub = global.CharacterHub = global.CharacterHub || {};
  hub.rules = hub.rules || {};
  hub.rules.generated2014 = hub.rules.generated2014 || {};
  hub.rules.generated2014.$property = $json;
})(window);
"@
  [IO.File]::WriteAllText($path, $content, $utf8)
}

function Parse-Table([string]$tableHtml) {
  $rows = @()
  foreach ($rowMatch in [regex]::Matches($tableHtml, "(?is)<tr[^>]*>(.*?)</tr>")) {
    $cells = @()
    foreach ($cellMatch in [regex]::Matches($rowMatch.Groups[1].Value, "(?is)<t[hd][^>]*>(.*?)</t[hd]>")) {
      $cells += Plain $cellMatch.Groups[1].Value
    }
    if ($cells.Count) { $rows += ,$cells }
  }
  $rows
}

function Parse-Progressions([string]$frontPage) {
  $classNames = [ordered]@{
    artificer = "Artificer"; barbarian = "Barbarian"; bard = "Bard"; cleric = "Cleric";
    druid = "Druid"; fighter = "Fighter"; monk = "Monk"; paladin = "Paladin";
    ranger = "Ranger"; rogue = "Rogue"; sorcerer = "Sorcerer"; warlock = "Warlock"; wizard = "Wizard"
  }
  $progressions = [ordered]@{}
  $subclasses = @()
  $selectionLevels = @{ artificer=3; barbarian=3; bard=3; cleric=1; druid=2; fighter=3; monk=3; paladin=3; ranger=3; rogue=3; sorcerer=1; warlock=1; wizard=2 }

  foreach ($classId in $classNames.Keys) {
    Write-Host "Reading $($classNames[$classId]) progression"
    $url = "$baseUrl/$classId"
    $html = Get-Page $url
    $contentStart = $html.IndexOf('<div id="page-content">')
    $content = if ($contentStart -ge 0) { $html.Substring($contentStart) } else { $html }
    $tableMatch = [regex]::Match($content, "(?is)<table[^>]*wiki-content-table[^>]*>(.*?)</table>")
    $rows = if ($tableMatch.Success) { @(Parse-Table $tableMatch.Value) } else { @() }
    $header = @()
    $levelRows = @()
    foreach ($row in $rows) {
      if ($row.Count -ge 3 -and $row[0] -eq "Level") { $header = $row; continue }
      if ($row.Count -ge 3 -and $row[0] -match "^(\d+)(?:st|nd|rd|th)$") {
        $featureColumn = [Array]::IndexOf($header, "Features")
        if ($featureColumn -lt 0) { $featureColumn = 2 }
        $record = [ordered]@{
          level = [int]$matches[1]
          proficiency = $row[1]
          features = @($row[$featureColumn] -split ",\s*" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
          trackers = [ordered]@{}
        }
        for ($index = 2; $index -lt [Math]::Min($header.Count, $row.Count); $index++) {
          if ($index -eq $featureColumn) { continue }
          $key = Slug $header[$index]
          if ($key) { $record.trackers[$key] = $row[$index] }
        }
        $levelRows += [pscustomobject]$record
      }
    }
    $progressions[$classId] = [pscustomobject]@{
      id = $classId
      name = $classNames[$classId]
      source = if ($classId -eq "artificer") { "Tasha's Cauldron of Everything" } else { "Player's Handbook" }
      communityUrl = $url
      levels = $levelRows
    }

    $classAnchorPattern = '(?is)<h1[^>]*>.*?<a href="/{0}"[^>]*>.*?</a>.*?</h1>' -f [regex]::Escape($classId)
    $classAnchor = [regex]::Match($frontPage, $classAnchorPattern)
    if (-not $classAnchor.Success) { continue }
    $sectionStart = $classAnchor.Index + $classAnchor.Length
    $nextClass = [regex]::Match($frontPage.Substring($sectionStart), '(?is)<h1[^>]*>.*?<a href="/(?:artificer|barbarian|bard|cleric|druid|fighter|monk|paladin|ranger|rogue|sorcerer|warlock|wizard)"[^>]*>')
    $sectionLength = if ($nextClass.Success) { $nextClass.Index } else { [Math]::Min(30000, $frontPage.Length - $sectionStart) }
    $section = $frontPage.Substring($sectionStart, $sectionLength)
    $publishedAt = $section.IndexOf("Published")
    if ($publishedAt -lt 0) { continue }
    $published = $section.Substring($publishedAt)
    $stop = [regex]::Match($published, "(?is)<h6[^>]*>.*?(?:Unearthed Arcana|Quick Links).*?</h6>")
    if ($stop.Success) { $published = $published.Substring(0, $stop.Index) }
    $linkPattern = '(?is)<a href="(/{0}:[^"#]+)[^"]*"[^>]*>(.*?)</a>' -f [regex]::Escape($classId)
    $links = [regex]::Matches($published, $linkPattern)
    foreach ($link in $links) {
      $relative = $link.Groups[1].Value
      $name = Plain $link.Groups[2].Value
      if (-not $name) { continue }
      $subUrl = "$baseUrl$relative"
      Write-Host "  Reading $name"
      try { $subHtml = Get-Page $subUrl } catch { Write-Warning "Skipped $subUrl"; continue }
      $sourceMatch = [regex]::Match($subHtml, "(?is)Source:\s*([^<]+)</p>")
      $sourceName = if ($sourceMatch.Success) { Plain $sourceMatch.Groups[1].Value } else { "Official 2014-compatible source" }
      $features = @()
      $headings = [regex]::Matches($subHtml, "(?is)<h3[^>]*>(.*?)</h3>")
      for ($featureIndex = 0; $featureIndex -lt $headings.Count; $featureIndex++) {
        $featureName = Plain $headings[$featureIndex].Groups[1].Value
        if (-not $featureName) { continue }
        $chunkStart = $headings[$featureIndex].Index + $headings[$featureIndex].Length
        $chunkEnd = if ($featureIndex + 1 -lt $headings.Count) { $headings[$featureIndex + 1].Index } else { [Math]::Min($subHtml.Length, $chunkStart + 5000) }
        $chunk = $subHtml.Substring($chunkStart, [Math]::Max(0, $chunkEnd - $chunkStart))
        $levelMatch = [regex]::Match((Plain $chunk), "(?i)(?:at|by|from|beginning at|starting at|reach)\s+(\d+)(?:st|nd|rd|th)?(?:\s|-)+level")
        if (-not $levelMatch.Success) { $levelMatch = [regex]::Match((Plain $chunk), "(?i)(\d+)(?:st|nd|rd|th)?(?:\s|-)+level") }
        $level = if ($levelMatch.Success) { [int]$levelMatch.Groups[1].Value } else { [int]$selectionLevels[$classId] }
        if ($featureName -match "(?i)^Restriction:") { continue }
        $features += [pscustomobject]@{ id = Slug $featureName; name = $featureName; level = $level }
      }
      $subclasses += [pscustomobject]@{
        id = "$classId-$(Slug $name)"
        classId = $classId
        name = $name
        source = $sourceName
        communityUrl = $subUrl
        features = $features
      }
    }
  }
  [pscustomobject]@{ progressions = $progressions; subclasses = $subclasses }
}

function Parse-Spells([string]$legacyPath, [string]$frontPage) {
  $rawFile = Get-Content -Raw $legacyPath
  $rawMatch = [regex]::Match($rawFile, "(?s)const SPELL_RAW=`(.*?)`;")
  if (-not $rawMatch.Success) { throw "SPELL_RAW was not found in $legacyPath" }
  $schools = @{ A="Abjuration"; C="Conjuration"; D="Divination"; E="Enchantment"; V="Evocation"; I="Illusion"; N="Necromancy"; T="Transmutation" }
  $times = @{ A="1 Action"; B="1 Bonus Action"; R="1 Reaction"; M1="1 Minute"; M10="10 Minutes"; H1="1 Hour"; H8="8 Hours"; H12="12 Hours"; H24="24 Hours"; S="Special"; Ar="1 Action or Ritual"; M1r="1 Minute or Ritual"; M10r="10 Minutes or Ritual"; H1r="1 Hour or Ritual" }
  $durations = @{ I="Instantaneous"; R1="1 round"; M1="1 minute"; M10="10 minutes"; H1="1 hour"; H6="6 hours"; H8="8 hours"; H24="24 hours"; D1="1 day"; D7="7 days"; D10="10 days"; D30="30 days"; UD="Until dispelled"; UT="Until dispelled or triggered"; SP="Special"; U1="Up to 1 minute"; U1h="Up to 1 hour"; U8h="Up to 8 hours"; I1h="Instantaneous or 1 hour"; C1="Concentration, up to 1 minute"; C10="Concentration, up to 10 minutes"; C1h="Concentration, up to 1 hour"; C2h="Concentration, up to 2 hours"; C8h="Concentration, up to 8 hours"; C24h="Concentration, up to 24 hours"; C1d="Concentration, up to 1 day"; C1r="Concentration, up to 1 round"; C6r="Concentration, up to 6 rounds" }
  $classMap = @{}
  foreach ($classId in @("artificer","bard","cleric","druid","paladin","ranger","sorcerer","warlock","wizard")) {
    Write-Host "Reading $classId spell list"
    try { $spellPage = Get-Page "$baseUrl/spells:$classId" } catch { continue }
    foreach ($match in [regex]::Matches($spellPage, '(?is)<a href="/spell:([^"#]+)[^"]*"[^>]*>(.*?)</a>')) {
      $key = $match.Groups[1].Value.ToLowerInvariant()
      if (-not $classMap.ContainsKey($key)) { $classMap[$key] = @() }
      if ($classMap[$key] -notcontains $classId) { $classMap[$key] += $classId }
    }
  }
  $spells = @()
  foreach ($line in ($rawMatch.Groups[1].Value -split "`r?`n")) {
    if (-not $line.Trim()) { continue }
    $parts = $line.Split("|")
    if ($parts.Count -lt 7) { continue }
    $name = $parts[0].Trim()
    $slug = Slug $name
    $spells += [pscustomobject]@{
      id = $slug; name = $name; level = [int]$parts[1]; school = $schools[$parts[2]]
      castingTime = if ($times.ContainsKey($parts[3])) { $times[$parts[3]] } else { $parts[3] }
      range = $parts[4]
      duration = if ($durations.ContainsKey($parts[5])) { $durations[$parts[5]] } else { $parts[5] }
      components = $parts[6]
      ritual = $parts[3].EndsWith("r")
      classes = @($classMap[$slug])
      communityUrl = "$baseUrl/spell:$slug"
    }
  }
  $spells
}

function Parse-Backgrounds([string]$frontPage) {
  $start = $frontPage.IndexOf("Common Backgrounds")
  $end = $frontPage.IndexOf("Heroic Chronicle", $start)
  if ($start -lt 0 -or $end -le $start) { return @() }
  $section = $frontPage.Substring($start, $end - $start)
  $section = [regex]::Replace($section, "(?is)<h6[^>]*>.*?(?:Unearthed Arcana|Homebrew).*?</h6>.*?(?=<h6|</div>)", "")
  $seen = @{}
  $backgrounds = @()
  $skillIds = [ordered]@{ "Acrobatics"="acrobatics"; "Animal Handling"="animalHandling"; "Arcana"="arcana"; "Athletics"="athletics"; "Deception"="deception"; "History"="history"; "Insight"="insight"; "Intimidation"="intimidation"; "Investigation"="investigation"; "Medicine"="medicine"; "Nature"="nature"; "Perception"="perception"; "Performance"="performance"; "Persuasion"="persuasion"; "Religion"="religion"; "Sleight of Hand"="sleightOfHand"; "Stealth"="stealth"; "Survival"="survival" }
  foreach ($link in [regex]::Matches($section, '(?is)<a href="(/background:[^"]+)"[^>]*>(.*?)</a>')) {
    $relative = $link.Groups[1].Value
    $name = Plain $link.Groups[2].Value
    $id = Slug $name
    if (-not $name -or $seen.ContainsKey($id) -or $name -eq "Optional Features") { continue }
    $seen[$id] = $true
    $url = "$baseUrl$relative"
    Write-Host "Reading background $name"
    try { $html = Get-Page ($url -replace "#.*$", "") } catch { Write-Warning "Skipped $url"; continue }
    $sourceMatch = [regex]::Match($html, "(?is)Source:\s*([^<]+)</p>")
    $sourceName = if ($sourceMatch.Success) { Plain $sourceMatch.Groups[1].Value } else { "Official 2014-compatible source" }
    $skillMatch = [regex]::Match($html, "(?is)<strong>Skill Proficiencies:</strong>\s*(.*?)(?:<br|</p>)")
    $skillText = if ($skillMatch.Success) { Plain $skillMatch.Groups[1].Value } else { "" }
    $skills = @($skillIds.Keys | Where-Object { $skillText -match "(?i)(^|,|\bor\b)\s*$([regex]::Escape($_))\s*(,|$|\bor\b)" } | ForEach-Object { $skillIds[$_] })
    if (-not $skills.Count) { $skills = @($skillIds.Keys | Where-Object { $skillText -match "(?i)\b$([regex]::Escape($_))\b" } | ForEach-Object { $skillIds[$_] }) }
    $skillChoices = @()
    if ($skillText -match "(?i)(?:any|choose)\s+(two|2)") { $skillChoices += [pscustomobject]@{ id="background-skills"; label="Background skills"; type="skill"; count=2; options="all"; distinct=$true } }
    elseif ($skillText -match "(?i)(?:any|choose)\s+(one|1)") { $skillChoices += [pscustomobject]@{ id="background-skills"; label="Background skill"; type="skill"; count=1; options="all"; distinct=$true } }
    $languageMatch = [regex]::Match($html, "(?is)<strong>Languages:</strong>\s*(.*?)(?:<br|</p>)")
    $languageText = if ($languageMatch.Success) { Plain $languageMatch.Groups[1].Value } else { "None" }
    $languageCount = if ($languageText -match "(?i)three|3") { 3 } elseif ($languageText -match "(?i)two|2") { 2 } elseif ($languageText -match "(?i)one|1") { 1 } else { 0 }
    $toolMatch = [regex]::Match($html, "(?is)<strong>Tool Proficiencies:</strong>\s*(.*?)(?:<br|</p>)")
    $equipmentMatch = [regex]::Match($html, "(?is)<strong>Equipment:</strong>\s*(.*?)</p>")
    $featureName = ""
    $featuresAt = $html.IndexOf(">Features<")
    if ($featuresAt -ge 0) {
      $featureMatch = [regex]::Match($html.Substring($featuresAt), "(?is)<h2[^>]*>(.*?)</h2>")
      if ($featureMatch.Success) { $featureName = Plain $featureMatch.Groups[1].Value }
    }
    $backgrounds += [pscustomobject]@{
      id=$id; name=$name; source=$sourceName; communityUrl=$url
      skills=[pscustomobject]@{ fixed=$skills; choices=$skillChoices }
      tools=if ($toolMatch.Success) { Plain $toolMatch.Groups[1].Value } else { "None" }
      languages=[pscustomobject]@{ fixed=@(); choices=if ($languageCount) { @([pscustomobject]@{ id="background-languages"; label="Background languages"; type="language"; count=$languageCount; distinct=$true }) } else { @() } }
      equipment=if ($equipmentMatch.Success) { Plain $equipmentMatch.Groups[1].Value } else { "" }
      feature=if ($featureName) { [pscustomobject]@{ id=Slug $featureName; name=$featureName } } else { $null }
      requiresFeat=([regex]::IsMatch($html, "(?is)<strong>Feat:</strong>|you gain the .*? feat"))
    }
  }
  $backgrounds
}

$frontPage = Get-Page "$baseUrl/"
$progressionData = Parse-Progressions $frontPage
$spells = Parse-Spells (Join-Path $LegacyRoot "data-spells.js") $frontPage
$backgrounds = Parse-Backgrounds $frontPage

Write-JsData (Join-Path $rulesRoot "progression-data.js") "progressionCatalog" $progressionData
Write-JsData (Join-Path $rulesRoot "spell-index.js") "spells" $spells
Write-JsData (Join-Path $rulesRoot "backgrounds-data.js") "backgrounds" $backgrounds

Write-Host "Generated $($progressionData.subclasses.Count) subclasses, $($spells.Count) spells, and $($backgrounds.Count) backgrounds."
