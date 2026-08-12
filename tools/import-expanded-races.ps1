param(
  [string]$LegacyRoot = "C:\Users\omerg\OneDrive\Documents\Projects\DND-5e-last"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$coverage = Get-Content -Raw (Join-Path $projectRoot "data\coverage\catalog-coverage.json") | ConvertFrom-Json
$raceSource = Get-Content -Raw (Join-Path $LegacyRoot "data-classes-races.js")
$featureSource = Get-Content -Raw (Join-Path $LegacyRoot "data-libraries.js")

function Slug([string]$value) {
  ($value.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
}

function Unescape-Js([string]$value) {
  $value.Replace("\'", "'").Replace("\\", "\")
}

$skillIds = [ordered]@{
  "Acrobatics"="acrobatics"; "Animal Handling"="animalHandling"; "Arcana"="arcana"; "Athletics"="athletics";
  "Deception"="deception"; "History"="history"; "Insight"="insight"; "Intimidation"="intimidation";
  "Investigation"="investigation"; "Medicine"="medicine"; "Nature"="nature"; "Perception"="perception";
  "Performance"="performance"; "Persuasion"="persuasion"; "Religion"="religion"; "Sleight of Hand"="sleightOfHand";
  "Stealth"="stealth"; "Survival"="survival"
}

$featuresByGroup = @{}
$featurePattern = "(?m)^\s*\{n:'(?<name>(?:\\'|[^'])*)',g:'(?<group>(?:\\'|[^'])*)'(?:,l:(?<level>\d+))?,d:'(?<description>(?:\\'|[^'])*)'(?<tail>[^}]*)\}"
foreach ($match in [regex]::Matches($featureSource, $featurePattern)) {
  $group = Unescape-Js $match.Groups["group"].Value
  if (-not $featuresByGroup.ContainsKey($group)) { $featuresByGroup[$group] = @() }
  $tail = $match.Groups["tail"].Value
  $mechanics = [ordered]@{}
  $uses = [regex]::Match($tail, "usesMax:(\d+)")
  $recharge = [regex]::Match($tail, "usesPer:'([^']+)'")
  if ($uses.Success) {
    $mechanics.resource = [pscustomobject]@{
      max = [int]$uses.Groups[1].Value
      recharge = if ($recharge.Success -and $recharge.Groups[1].Value -eq "short") { "Short Rest" } else { "Long Rest" }
      action = "Special"
    }
  }
  $featuresByGroup[$group] += [pscustomobject]@{
    id = Slug (Unescape-Js $match.Groups["name"].Value)
    name = Unescape-Js $match.Groups["name"].Value
    summary = Unescape-Js $match.Groups["description"].Value
    mechanics = [pscustomobject]$mechanics
  }
}

$idByName = @{}
foreach ($race in $coverage.races) { $idByName[$race.name] = $race.id }
$baseIds = @("dwarf","elf","halfling","human","dragonborn","gnome","half-elf","half-orc","tiefling")
$sourceBooks = @{
  "fairy"="The Wild Beyond the Witchlight"; "harengon"="The Wild Beyond the Witchlight"; "locathah"="Locathah Rising";
  "owlin"="Strixhaven: A Curriculum of Chaos"; "verdan"="Acquisitions Incorporated"; "grung"="One Grung Above"
}
$smallRaces = @("deep-gnome","fairy","goblin","grung","kobold")
$languageMap = @{
  "locathah"=@("Common","Aquan"); "grung"=@("Grung"); "verdan"=@("Common","Goblin")
}

$raceLines = [regex]::Matches($raceSource, "(?m)^\s{2}(?<legacy>[a-z0-9]+):\{name:'(?<name>(?:\\'|[^'])+)'(?<body>[^\r\n]*)")
$expanded = @()
foreach ($line in $raceLines) {
  $name = Unescape-Js $line.Groups["name"].Value
  if (-not $idByName.ContainsKey($name)) { continue }
  $id = $idByName[$name]
  if ($baseIds -contains $id) { continue }
  $body = $line.Groups["body"].Value
  $speedMatch = [regex]::Match($body, "speed:(\d+)")
  $darkMatch = [regex]::Match($body, "dark:(\d+)")
  $moveMatch = [regex]::Match($body, "move:'([^']+)'")
  $bonusMatch = [regex]::Match($body, "bonus:\{([^}]*)\}")
  $motm = $body -match "motm:true"
  $fixedBonuses = [ordered]@{}
  if ($bonusMatch.Success) {
    foreach ($bonus in [regex]::Matches($bonusMatch.Groups[1].Value, "(str|dex|con|int|wis|cha):(\d+)")) {
      $fixedBonuses[$bonus.Groups[1].Value.ToUpperInvariant()] = [int]$bonus.Groups[2].Value
    }
  }
  $traits = @($featuresByGroup[$name])
  if (-not $traits.Count) {
    $traits = @([pscustomobject]@{ id="lineage-traits"; name="$name Traits"; summary="Use the linked 2014 source for this lineage's traits."; mechanics=[pscustomobject]@{} })
  }
  $fixedSkills = @()
  $skillChoices = @()
  foreach ($trait in $traits) {
    foreach ($skillName in $skillIds.Keys) {
      if ($trait.summary -match "(?i)proficien(?:cy|t)\s+(?:in|with)\s+(?:the\s+)?$([regex]::Escape($skillName))\b") {
        $fixedSkills += $skillIds[$skillName]
      }
    }
    if ($trait.summary -match "(?i)proficiency in (?:any )?two skills|two skills of your choice") {
      $skillChoices += [pscustomobject]@{ id="racial-skill-choice"; label="Racial skill proficiencies"; type="skill"; count=2; options="all"; distinct=$true }
    } elseif ($trait.summary -match "(?i)proficiency in (?:any )?one skill|one skill of your choice") {
      $skillChoices += [pscustomobject]@{ id="racial-skill-choice"; label="Racial skill proficiency"; type="skill"; count=1; options="all"; distinct=$true }
    }
  }
  $abilityChoices = @()
  $abilityPatterns = @()
  if ($motm) {
    $abilityPatterns = @(
      [pscustomobject]@{ id="plus-two-plus-one"; label="One +2 and a different +1"; allocations=@([pscustomobject]@{ id="flex-plus-two"; amount=2; count=1 },[pscustomobject]@{ id="flex-plus-one"; amount=1; count=1 }) },
      [pscustomobject]@{ id="three-ones"; label="Three different +1 increases"; allocations=@([pscustomobject]@{ id="flex-three-ones"; amount=1; count=3 }) }
    )
  }
  $move = if ($moveMatch.Success) { $moveMatch.Groups[1].Value } else { "" }
  $movement = [ordered]@{}
  if ($move -match "fly") { $movement.fly = if ($move -match "(\d+)") { [int]$matches[1] } else { "walk" } }
  if ($move -match "swim\s+(\d+)") { $movement.swim = [int]$matches[1] }
  if ($move -match "climb\s+(\d+)") { $movement.climb = [int]$matches[1] }
  $book = if ($sourceBooks.ContainsKey($id)) { $sourceBooks[$id] } else { "Mordenkainen Presents: Monsters of the Multiverse" }
  $languages = if ($languageMap.ContainsKey($id)) { @($languageMap[$id]) } else { @("Common") }
  $languageChoices = if ($languageMap.ContainsKey($id)) { @() } else { @([pscustomobject]@{ id="bonus-languages"; label="Additional language"; type="language"; count=1; distinct=$true }) }
  $expanded += [pscustomobject]@{
    id=$id; name=$name; group=if ($body -match "group:'([^']+)'" ) { $matches[1] } else { "Expanded" }
    description="An official expanded lineage compatible with the 2014 rules."
    abilityBonuses=[pscustomobject]@{ fixed=[pscustomobject]$fixedBonuses; choices=$abilityChoices; patterns=$abilityPatterns }
    size=[pscustomobject]@{ value=if ($smallRaces -contains $id) { "Small" } else { "Medium" } }
    speed=[pscustomobject]([ordered]@{ walk=if ($speedMatch.Success) { [int]$speedMatch.Groups[1].Value } else { 30 } } + $movement)
    senses=[pscustomobject]@{ darkvision=if ($darkMatch.Success) { [int]$darkMatch.Groups[1].Value } else { 0 } }
    languages=[pscustomobject]@{ fixed=$languages; choices=$languageChoices }
    proficiencies=[pscustomobject]@{ skills=[pscustomobject]@{ fixed=@($fixedSkills | Select-Object -Unique); choices=$skillChoices }; armor=@(); weapons=@(); tools=[pscustomobject]@{ fixed=@(); choices=@() } }
    traits=$traits; subraces=@(); choices=@(); edition="2014"
    source=[pscustomobject]@{ name="$book (2014 rules)"; book=$book; url="https://dnd5e.wikidot.com/lineage:$id"; type="community-reference" }
    links=[pscustomobject]@{ community="https://dnd5e.wikidot.com/lineage:$id" }
    status="enabled"
  }
}

$json = $expanded | ConvertTo-Json -Depth 25 -Compress
$output = @"
(function loadGeneratedExpandedRaces(global) {
  "use strict";
  const hub = global.CharacterHub = global.CharacterHub || {};
  hub.rules = hub.rules || {};
  hub.rules.generated2014 = hub.rules.generated2014 || {};
  hub.rules.generated2014.expandedRaces = $json;
})(window);
"@
[IO.File]::WriteAllText((Join-Path $projectRoot "scripts\rules\2014\expanded-races-data.js"), $output, $utf8)
Write-Host "Generated $($expanded.Count) expanded race definitions."
