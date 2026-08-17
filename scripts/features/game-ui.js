/* Character Hub v9.11 — approved complete visual rebuild */
(() => {
  const PORTRAIT_FALLBACK = "assets/art/portrait-fallback.png";
  const ART = Object.freeze({
    home:"assets/art/home.png", longsword:"assets/art/longsword.png", greatsword:"assets/art/greatsword.png", handaxe:"assets/art/handaxe.png",
    healingPotion:"assets/art/healing-potion.png", greaterHealingPotion:"assets/art/greater-healing-potion.png", torch:"assets/art/torch.png",
    chainMail:"assets/art/chain-mail.png", backpack:"assets/art/backpack.png", secondWind:"assets/art/second-wind.png",
    actionSurge:"assets/art/action-surge.png", indomitable:"assets/art/indomitable.png", passiveBook:"assets/art/passive-book.png",
    hitDice:"assets/art/hit-dice.png", campfire:"assets/art/campfire.png", campaignMap:"assets/art/campaign-map.png",
    strength:"assets/art/strength.png", dexterity:"assets/art/dexterity.png", constitution:"assets/art/constitution.png",
    intelligence:"assets/art/intelligence.png", wisdom:"assets/art/wisdom.png", charisma:"assets/art/charisma.png",
    radiantSlash:"assets/art/radiant-slash.png"
  });
  const abilityArt = {STR:"strength",DEX:"dexterity",CON:"constitution",INT:"intelligence",WIS:"wisdom",CHA:"charisma"};
  function art(key, className="", alt=""){
    const file=ART[key]||ART.backpack;
    const src=String(file);
    return `<img class="v911-art ${className}" src="${src}" alt="${attr(alt)}" loading="eager" draggable="false">`;
  }
  function itemArtKey(item){
    const name=String(item?.name||"").toLowerCase();
    const category=item?itemCategory(item):"";
    if(name.includes("greater healing"))return "greaterHealingPotion";
    if(name.includes("healing potion")||name.includes("potion of healing"))return "healingPotion";
    if(name.includes("longsword"))return "longsword";
    if(name.includes("greatsword"))return "greatsword";
    if(name.includes("handaxe")||name.includes("hand axe"))return "handaxe";
    if(name.includes("torch"))return "torch";
    if(name.includes("chain mail")||name.includes("chainmail"))return "chainMail";
    if(name.includes("shield"))return "constitution";
    if(category==="Weapon")return "longsword";
    if(category==="Armor")return "chainMail";
    if(category==="Consumable")return "healingPotion";
    return "backpack";
  }
  function resourceArtKey(resource){
    const key=String(resource?.systemKey||"").toLowerCase();
    const name=String(resource?.name||"").toLowerCase();
    if(key.includes("secondwind")||name.includes("second wind"))return "secondWind";
    if(key.includes("actionsurge")||name.includes("action surge"))return "actionSurge";
    if(key.includes("indomitable")||name.includes("indomitable"))return "indomitable";
    if(name.includes("radiant"))return "radiantSlash";
    return "passiveBook";
  }
  function traitArtKey(trait){
    const name=String(trait?.name||"").toLowerCase();
    if(name.includes("second wind"))return "secondWind";
    if(name.includes("action surge"))return "actionSurge";
    if(name.includes("indomitable"))return "indomitable";
    if(name.includes("weapon")||name.includes("sentinel")||trait?.category==="Feat")return "actionSurge";
    return "passiveBook";
  }
  const pageNames = {home:"Home",combat:"Combat",inventory:"Inventory",skills:"Skills & Abilities",feats:"Feats & Features",more:"More"};
  const navItems = [
    ["home","⌂","Home"],["combat","⚔","Combat"],["inventory","▣","Inventory"],
    ["skills","▤","Skills"],["feats","✦","Feats"],["more","•••","More"]
  ];
  const abilityIcons = {STR:"✊",DEX:"➶",CON:"⬡",INT:"▤",WIS:"☀",CHA:"◈"};
  const abilityClasses = {STR:"str",DEX:"dex",CON:"con",INT:"int",WIS:"wis",CHA:"cha"};
  const skillIcons = {athletics:"♞",acrobatics:"⚝",sleightOfHand:"✋",stealth:"◉",arcana:"✥",history:"▤",investigation:"⌕",nature:"❧",religion:"♜",animalHandling:"♣",insight:"◉",medicine:"⚕",perception:"◉",survival:"♣",deception:"◈",intimidation:"♞",performance:"♪",persuasion:"◇"};
  const coinColors = {CP:"cp",SP:"sp",EP:"ep",GP:"gp",PP:"pp"};
  const itemValues = {"Longsword +1":750,"Greatsword":50,"Handaxe":5,"Shield":10,"Chain Mail":75,"Healing Potion":50,"Greater Healing Potion":100,"Potion of Greater Healing":100,"Potion of Heroism":180,"Antitoxin":50,"Rations":.5,"Torch":.01};
  const featureText = {
    "Fighting Style: Great Weapon Fighting":"Reroll 1s and 2s on eligible melee weapon damage.",
    "Second Wind":"Regain 1d10 + fighter level HP.",
    "Action Surge":"Gain one additional action this turn.",
    "Extra Attack":"Attack twice when taking the Attack action.",
    "Indomitable":"Reroll a failed saving throw.",
    "Great Weapon Master":"On a critical hit or kill with a heavy melee weapon, gain the campaign's listed benefit.",
    "Sentinel":"Control enemy movement and improve Opportunity Attacks.",
    "Human Determination":"Draw on human resolve when the campaign feature allows it."
  };

  let currentPage = localStorage.getItem("characterHubV911Page") || "home";
  let inventoryFilter = "All";
  let inventorySearch = "";
  let abilityFilter = "All";
  let featFilter = "All";
  let featSearch = "";
  let passiveOpen = false;
  let moreTab = "Character Details";
  let modalKind = "";

  function ensureV911State(){
    const defaults = {
      inspiration:false,xpCurrent:23450,xpNext:28000,
      background:"Soldier",alignment:"Neutral Good",age:"29",height:"6 ft. 1 in.",eyes:"Hazel",hair:"Dark Brown",
      ideals:"Protect the innocent and uphold honor, even when no one is watching.",
      bonds:"I owe my life to Sergeant Lysa, and I will not abandon those who fight beside me.",
      campaign:{name:"The Ashen Crown",player:"Omer",dm:"Kfir",location:"Redgate",session:"14",lastPlayed:"August 10, 2026"},
      notes:[
        {id:"note_emerald",text:"Emerald for the potion.",date:"Today"},
        {id:"note_silver",text:"Ask the smith about silvering.",date:"Session 14"},
        {id:"note_watchtower",text:"Ruined watchtower — return after level 8.",date:"Session 14"}
      ],
      journal:[
        {id:"journal_watchtower",title:"The Ruined Watchtower",session:"Session 14",date:"Today",body:"We found the old watchtower beyond Redgate. Something is still moving beneath it."},
        {id:"journal_redgate",title:"A Deal in Redgate",session:"Session 13",date:"Aug 3",body:"The smith agreed to help if we recover the missing caravan."},
        {id:"journal_crown",title:"The Ashen Crown",session:"Session 12",date:"Jul 27",body:"The first fragment points north, toward the ruined road."}
      ],
      pinnedSkills:["athletics","perception","intimidation"],
      pinnedFeats:["Great Weapon Master","Sentinel"],tools:["Smith's Tools"],languages:["Common","Dwarvish"]
    };
    state.v911 = {...defaults,...(state.v911||{})};
    state.v911.campaign = {...defaults.campaign,...(state.v911.campaign||{})};
    state.v911.notes = Array.isArray(state.v911.notes)?state.v911.notes:defaults.notes;
    state.v911.journal = Array.isArray(state.v911.journal)?state.v911.journal:defaults.journal;
    state.v911.pinnedSkills = Array.isArray(state.v911.pinnedSkills)?state.v911.pinnedSkills:defaults.pinnedSkills;
    state.v911.pinnedFeats = Array.isArray(state.v911.pinnedFeats)?state.v911.pinnedFeats:defaults.pinnedFeats;
  }

  function portraitSrc(){ return state.portraitImage || PORTRAIT_FALLBACK; }
  function e(value){ return escapeHtml(String(value??"")); }
  function attr(value){ return e(value); }
  function pct(value,max){ return max>0?Math.max(0,Math.min(100,(Number(value)||0)/(Number(max)||1)*100)):0; }
  function navHtml(){
    return navItems.map(([key,icon,label])=>`<button class="v911-nav-button ${currentPage===key?"active":""}" data-v911-page="${key}"><span class="v911-nav-icon">${icon}</span><span>${label}</span></button>`).join("");
  }
  function sidebarHtml(){
    return `<aside class="v911-sidebar">
      <div class="v911-brand"><div class="v911-brand-crest">CH</div><h1>Character Hub</h1><div class="v911-version">V9.11</div></div>
      <div class="v911-character">
        <button class="v911-side-portrait" data-action="edit-character" aria-label="Edit character portrait"><img src="${attr(portraitSrc())}" alt="${attr(state.name)} portrait"><span class="v911-level-badge">${state.level}</span></button>
        <h2>${e(state.name)}</h2><p>${e(state.race)} ${e(state.className)} · Level ${state.level}</p>
      </div>
      <nav class="v911-nav" aria-label="Primary navigation">${navHtml()}</nav>
      <div class="v911-sidebar-foot">ENGLISH ONLY · DESKTOP WORKSPACE</div>
    </aside>`;
  }
  function pageHead(title,action=""){
    const dark=document.documentElement.dataset.theme==="dark";
    return `<header class="v911-page-head"><h1 class="v911-page-title">${e(title)}</h1><div class="v911-page-actions"><span class="v911-saved">Saved</span><button class="v911-header-theme" data-action="toggle-theme" aria-label="Switch to ${dark?"light":"dark"} mode"><span>${dark?"☀":"☾"}</span>${dark?"Light Mode":"Dark Mode"}</button>${action}</div></header>`;
  }
  function coinHtml(code,value){ return `<div class="v911-coin"><span class="v911-coin-icon coin-${coinColors[code]}">${code[0]}</span><span>${code}</span><b>${value}</b></div>`; }

  function homeHtml(){
    const hitDice = resourceByKey("hitDice") || {current:0,max:state.level};
    const tracked = state.resources.filter(resource=>resource.systemKey!=="hitDice");
    const activeCurrent = tracked.reduce((sum,r)=>sum+Number(r.current||0),0);
    const activeMax = tracked.reduce((sum,r)=>sum+Number(r.max||0),0);
    const armor = state.inventory.find(item=>itemCategory(item)==="Armor"&&!item.destroyed)?.name || "None";
    const xpP = pct(state.v911.xpCurrent,state.v911.xpNext);
    return `${pageHead("Home")}
      <section class="v911-card v911-home-hero">
        <div class="v911-home-identity">
          <div class="v911-home-portrait"><img src="${attr(portraitSrc())}" alt="${attr(state.name)}"></div>
          <div><h2 class="v911-home-name">${e(state.name)}</h2><div class="v911-home-meta">${e(state.race)} ${e(state.className)} · Level ${state.level}</div>
            <div class="v911-xp"><span><b>XP</b>&nbsp;&nbsp; ${Number(state.v911.xpCurrent).toLocaleString()} / ${Number(state.v911.xpNext).toLocaleString()}</span><div class="v911-progress"><span style="width:${xpP}%"></span></div></div>
          </div>
          <div class="v911-home-actions"><button class="v911-btn" data-action="edit-character">✎ &nbsp; Edit Character</button><button class="v911-btn primary" data-action="level-up">▲ &nbsp; Level Up</button></div>
        </div>
        <div class="v911-stat-strip">
          ${homeStat("♥","HP",`${state.hpCurrent}/${state.hpMax}`,"hp","")}
          ${homeStat("⬡","Temp HP",state.tempHp,"temp","blue")}
          ${homeStat("◈","AC",state.ac,"ac","")}
          ${homeStat("♞","Initiative",signed(state.initiative),"initiative","good")}
          ${homeStat("➟","Speed",`${state.speed} ft.`,"speed","")}
          ${homeStat("✥","Proficiency",signed(state.proficiency),"proficiency","good")}
        </div>
      </section>
      <section class="v911-card v911-coins"><h3 class="v911-card-title">Coins</h3>${Object.entries(state.coins).map(([c,v])=>coinHtml(c,v)).join("")}<button class="v911-btn small" data-action="edit-coins">✎ Edit</button></section>
      <div class="v911-home-lower">
        <section class="v911-card v911-glance"><div class="v911-section-heading"><h3>At a Glance</h3></div>
          <div class="v911-list-row"><span class="v911-row-icon" style="color:#2e7448">⬡</span><span>No active conditions</span><span></span></div>
          <div class="v911-list-row clickable" data-action="toggle-inspiration"><span class="v911-row-icon" style="color:#a87913">☀</span><span>Inspiration</span><span>${state.v911.inspiration?"●":"○"}</span></div>
          <div class="v911-list-row"><span class="v911-row-icon" style="color:#8a2829">◇</span><span>Hit Dice</span><b>${hitDice.current}/${hitDice.max}</b></div>
          <div class="v911-list-row"><span class="v911-row-icon" style="color:#326b85">♨</span><span>Active Resources</span><b>${activeCurrent}/${activeMax}</b></div>
          <div class="v911-list-row"><span class="v911-row-icon">♜</span><span>Armor Equipped</span><b>${e(armor)}</b></div>
        </section>
        <section class="v911-card v911-journal"><div class="v911-section-heading"><h3>✒ Journal</h3></div>
          ${state.v911.journal.slice(0,3).map(entry=>`<div class="v911-list-row clickable" data-action="view-journal" data-id="${attr(entry.id)}"><span class="v911-row-icon">▤</span><span><b>${e(entry.title)}</b></span><span class="v911-row-meta">${e(entry.session)} · ${e(entry.date)} &nbsp;›</span></div>`).join("")}
          <div class="v911-journal-actions"><button class="v911-btn primary" data-action="new-journal">＋ New Journal Entry</button><button class="v911-btn" data-action="view-journal">View Full Journal ›</button></div>
        </section>
      </div>`;
  }
  function homeStat(icon,label,value,key,cls){ return `<button class="v911-stat" data-info-key="${key}"><span class="v911-stat-icon">${icon}</span><span><span class="v911-stat-label">${label}</span><span class="v911-stat-value ${cls}">${value}</span></span></button>`; }

  function combatHtml(){
    const hitDice = resourceByKey("hitDice") || {current:0,max:state.level};
    const weapons = getCombatWeapons();
    const consumables = state.inventory.map((item,index)=>({item,index})).filter(({item})=>itemCategory(item)==="Consumable"&&!item.destroyed&&item.qty>0).slice(0,3);
    const resources = combatResourcesForFilter();
    const passives = state.traits.map((trait,index)=>({trait,index})).filter(({trait})=>trait.showInCombat&&trait.activation==="Passive"&&!trait.resourceId);
    const restLocked = state.combatActive||state.hpCurrent===0;
    return `${pageHead("Combat")}
      <section class="v911-card v911-combat-status">
        <div class="v911-mode ${state.combatActive?"active":""}"><span class="v911-mode-dot"></span><span>${state.combatActive?"Combat Active":"Exploration"}<br><span class="v911-badge ${state.combatActive?"red":""}">${state.hpCurrent===0?"Downed":state.combatActive?"Active":"Ready"}</span></span></div>
        <div class="v911-combat-stats">${combatStat("HP",`${state.hpCurrent}/${state.hpMax}`,true)}${combatStat("Temp HP",state.tempHp)}${combatStat("AC",state.ac)}${combatStat("Initiative",signed(state.initiative))}${combatStat("Speed",`${state.speed} ft.`)}</div>
        <button class="v911-btn" data-action="hp-conditions">HP & Conditions</button><button class="v911-btn primary" data-action="toggle-combat">${state.combatActive?"End Combat":"Start Combat"}</button>
      </section>
      <div class="v911-combat-grid">
        <section class="v911-card v911-combat-panel"><div class="v911-combat-panel-head">⚔ <span>1. Attacks</span></div>
          <div class="v911-table-head"><span>Weapon</span><span>To Hit</span><span>Damage</span><span>Range</span><span>Details</span></div>
          ${weapons.length?weapons.map(({item,index})=>weaponRow(item,index)).join(""):`<div class="v911-empty">No weapons are available.</div>`}
        </section>
        <section class="v911-card v911-combat-panel"><div class="v911-combat-panel-head">✹ <span>2. Abilities</span></div>
          <div class="v911-filter-row">${["All","Action","Bonus","Reaction","Passive"].map(x=>`<button class="v911-filter ${abilityFilter===x?"active":""}" data-ability-filter="${x}">${x}</button>`).join("")}</div>
          ${resources.map(({resource,index,trait})=>abilityRow(resource,index,trait)).join("")}
          ${(abilityFilter==="All"||abilityFilter==="Passive")?`<div class="v911-passive-expand" data-action="passive-toggle"><span class="v911-ability-orb">▤</span><b>Passive Features</b><span>${passives.length} ${passiveOpen?"⌃":"⌄"}</span></div>${passiveOpen?`<div class="v911-passive-list">${passives.map(({trait,index})=>`<div class="v911-passive-item"><span>${e(trait.name)}</span><button class="v911-btn small" data-action="feat-details" data-index="${index}">Details</button></div>`).join("")}</div>`:""}`:""}
        </section>
        <section class="v911-card v911-combat-panel"><div class="v911-combat-panel-head">◇ <span>3. Quick Items</span></div>
          ${consumables.length?consumables.map(({item,index})=>quickItemRow(item,index)).join(""):`<div class="v911-empty">No quick items are available.</div>`}
        </section>
        <section class="v911-card v911-combat-panel"><div class="v911-combat-panel-head">♥ <span>4. Recovery</span></div>
          <div class="v911-recovery-body"><div class="v911-rest-mini"><small>HIT DICE</small><strong>${hitDice.current}/${hitDice.max}</strong><span>${e(state.hitDieType||"d10")}</span></div>
          <button class="v911-short-rest" data-action="short-rest" ${restLocked?"disabled":""}><span class="v911-short-rest-icon">♨</span><span><b>OPEN SHORT REST</b><br><small>Spend Hit Dice to heal and regain resources.</small></span></button>
          <button class="v911-btn primary v911-long-rest" data-action="long-rest" ${restLocked?"disabled":""}>▰ &nbsp; TAKE LONG REST</button><div class="v911-rest-note">${restLocked?"Rests are unavailable during active combat or at 0 HP.":"A long rest restores HP, Hit Dice and configured resources."}</div></div>
        </section>
      </div>`;
  }
  function combatStat(label,value,hp=false){ return `<div class="v911-combat-stat"><small>${label}</small><b>${value}</b>${hp?`<div class="v911-progress"><span style="width:${pct(state.hpCurrent,state.hpMax)}%"></span></div>`:""}</div>`; }
  function weaponRow(item,index){
    const magical = Boolean(item.isMagical||activePowers(item).length);
    return `<div class="v911-weapon-row ${magical?"magical":""}"><span class="v911-weapon-name"><span>⚔</span><span><b>${e(item.name)}</b>${magical?`<small>Magical</small>`:""}</span></span><b>${e(signed(weaponAttackBonus(item)))}</b><b>${e(weaponDamageDisplay(item))}</b><b>${e(item.weapon?.range||"—")}</b><button class="v911-icon-btn" data-action="item-details" data-index="${index}">•••</button></div>`;
  }
  function combatResourcesForFilter(){
    return state.resources.map((resource,index)=>({resource,index,trait:linkedCombatTrait(resource)})).filter(({resource,trait})=>resource.systemKey!=="hitDice"&&(resource.showInCombat||trait)).filter(({resource,trait})=>{
      if(abilityFilter==="All")return true;
      const action=String(trait?.activation||resource.action||"Special").toLowerCase();
      if(abilityFilter==="Bonus")return action.includes("bonus");
      if(abilityFilter==="Reaction")return action.includes("reaction");
      if(abilityFilter==="Passive")return action.includes("passive");
      return !action.includes("bonus")&&!action.includes("reaction")&&!action.includes("passive");
    });
  }
  function abilityRow(resource,index,trait){
    const canUse=resource.current>=resource.useCost&&state.hpCurrent>0;
    return `<div class="v911-ability-row"><span class="v911-ability-orb">${resource.systemKey==="secondWind"?"✚":resource.systemKey==="actionSurge"?"⚔":"⬡"}</span><span><b>${e(trait?.name||resource.name)}</b></span><b>${resource.current}/${resource.max}</b><button class="v911-btn small ${canUse?"primary":""}" data-action="resource-use" data-index="${index}" ${canUse?"":"disabled"}>Use</button></div>`;
  }
  function quickItemRow(item,index){
    const c=item.consumable||{}; const effect=[c.formula,c.effect||item.desc].filter(Boolean).join(" · ");
    return `<div class="v911-item-row"><span class="v911-potion">${c.effectType==="Healing"?"⚗":"◆"}</span><span><b>${e(item.name)}</b><p>${e(c.activation||"Action")}</p></span><span class="v911-qty">×${item.qty}</span><span>${e(effect||"Utility item")}</span><button class="v911-btn small" data-action="item-use" data-index="${index}" ${state.hpCurrent===0?"disabled":""}>Use</button></div>`;
  }

  function inventoryHtml(){
    const live = state.inventory.map((item,index)=>({item,index})).filter(({item})=>!item.destroyed);
    const visible = live.filter(({item})=>inventoryMatches(item));
    const totalWeight=live.reduce((sum,{item})=>sum+(Number(item.weight)||0)*(Number(item.qty)||0),0);
    const carry=Math.max(1,(state.abilities.STR?.[0]||10)*15);
    const attuned=live.filter(({item})=>item.isMagical).slice(0,2).length;
    const weapons=live.filter(({item})=>itemCategory(item)==="Weapon");
    const armor=live.find(({item})=>itemCategory(item)==="Armor");
    const mainHand=weapons[0]?.item;
    const coinTotal=Number(state.coins.GP||0)+Number(state.coins.PP||0)*10+Number(state.coins.EP||0)*.5+Number(state.coins.SP||0)*.1+Number(state.coins.CP||0)*.01;
    return `${pageHead("Inventory",`<button class="v911-btn primary" data-action="add-item">＋ New Item</button>`)}
      <section class="v911-card v911-summary-strip">
        ${summaryStat("◉","Coins",`${coinTotal.toFixed(1)} GP`)}${summaryStat("▰","Carry Weight",`${formatWeight(totalWeight)} / ${carry} lb`,pct(totalWeight,carry))}${summaryStat("◇","Attunement",`${attuned} / 3`)}${summaryStat("⬡","Equipped",`${[mainHand,armor?.item].filter(Boolean).length}`)}
        <button class="v911-btn primary" data-action="add-item">＋ New Item</button>
      </section>
      <div class="v911-inventory-tools"><input class="v911-search" id="v911InventorySearch" value="${attr(inventorySearch)}" placeholder="⌕  Search inventory..."><div class="v911-filter-row">${["All","Weapons","Armor","Consumables","Magic","Gear"].map(x=>`<button class="v911-filter ${inventoryFilter===x?"active":""}" data-inventory-filter="${x}">${x}</button>`).join("")}</div></div>
      <section class="v911-card v911-loadout"><div class="v911-loadout-title">Equipped Loadout</div><div class="v911-loadout-grid">
        ${loadoutSlot("⚔","Main Hand",mainHand?.name||"Empty")}${loadoutSlot("◈","Off Hand","Empty")}${loadoutSlot("♜","Armor",armor?.item?.name||"None")}${loadoutSlot("◇","Attuned",`${attuned} / 3`)}
      </div></section>
      <div class="v911-inventory-layout"><section class="v911-card v911-inventory-table"><div class="v911-inventory-head"><span>Item</span><span>Category</span><span>Qty</span><span>Weight</span><span>Value</span><span>Status</span><span></span></div>
        ${visible.length?visible.map(({item,index})=>inventoryRow(item,index,mainHand?.id,armor?.item?.id)).join(""):`<div class="v911-empty">No items match this view.</div>`}
      </section><aside class="v911-side-stack">
        <section class="v911-card v911-side-card"><h3>Inventory Notes</h3>${state.v911.notes.slice(0,2).map(note=>`<div class="v911-note-row">▤ &nbsp; ${e(note.text)}<small>${e(note.date)}</small></div>`).join("")}<button class="v911-btn small" style="margin-top:10px" data-action="new-note">＋ Note</button></section>
        <section class="v911-card v911-side-card"><h3>Currency</h3>${Object.entries(state.coins).map(([code,value])=>`<div class="v911-currency-row"><span class="v911-currency-name"><span class="v911-coin-icon coin-${coinColors[code]}" style="width:23px;height:23px;font-size:11px">${code[0]}</span>${code}</span><b>${value}</b></div>`).join("")}</section>
      </aside></div>`;
  }
  function summaryStat(icon,label,value,bar=null){return `<div class="v911-summary-stat"><span class="v911-summary-icon">${icon}</span><span><small>${label}</small><b>${value}</b>${bar!==null?`<div class="v911-progress" style="width:145px;height:6px"><span style="width:${bar}%"></span></div>`:""}</span></div>`;}
  function loadoutSlot(icon,label,value){return `<div class="v911-loadout-slot"><span style="font-size:29px;text-align:center">${icon}</span><span><small>${label}</small><b>${e(value)}</b></span></div>`;}
  function inventoryMatches(item){
    const search=inventorySearch.trim().toLowerCase(); if(search&&!`${item.name} ${item.desc}`.toLowerCase().includes(search))return false;
    const category=itemCategory(item);
    if(inventoryFilter==="All")return true;if(inventoryFilter==="Weapons")return category==="Weapon";if(inventoryFilter==="Armor")return category==="Armor";if(inventoryFilter==="Consumables")return category==="Consumable";if(inventoryFilter==="Magic")return Boolean(item.isMagical||activePowers(item).length);return !["Weapon","Armor","Consumable"].includes(category);
  }
  function inventoryRow(item,index,mainId,armorId){
    const category=itemCategory(item);const equipped=item.id===mainId||item.id===armorId;const quick=category==="Consumable";
    return `<div class="v911-inventory-row"><span class="v911-inventory-item ${item.isMagical?"magical":""}"><span style="font-size:23px">${category==="Weapon"?"⚔":category==="Armor"?"♜":category==="Consumable"?"⚗":"▣"}</span><b>${e(item.name)}</b></span><span>${e(category)}</span><b>${item.qty}</b><span>${formatWeight((Number(item.weight)||0)*(Number(item.qty)||0))} lb</span><span>${itemValues[item.name]??"—"}${itemValues[item.name]!=null?" GP":""}</span><span class="${quick?"v911-badge green":equipped?"v911-badge purple":""}">${quick?"Quick Item":equipped?"Equipped":"—"}</span><button class="v911-icon-btn" data-action="edit-item" data-index="${index}">⋮</button></div>`;
  }

  function skillsHtml(){
    const order=["STR","DEX","CON","INT","WIS","CHA"];
    return `${pageHead("Skills & Abilities",`<button class="v911-btn primary" data-action="edit-character">✎ Edit Scores</button>`)}
      <section class="v911-card v911-saves"><div class="v911-saves-title">SAVING<br>THROWS</div>${order.map(code=>{const def=saveDefs.find(x=>x.ability===code);const proficient=Boolean(state.saveProficiencies?.[code]);return `<button class="v911-save" data-action="skill-details" data-type="save" data-key="${def.key}"><span>${abilityIcons[code]}</span><span>${abilityNames[code]} ${signed(saveTotal(def))}</span><i class="v911-prof-dot ${proficient?"on":""}"></i></button>`}).join("")}<div class="v911-prof-bonus">Proficiency Bonus<b>${signed(state.proficiency)}</b></div></section>
      <div class="v911-ability-grid">${order.map(code=>abilityGroup(code)).join("")}</div>
      <section class="v911-card v911-passive-strip">${passiveStat("◉","Passive Perception",10+skillTotal(skillDefs.find(x=>x.key==="perception")))}${passiveStat("◉","Passive Insight",10+skillTotal(skillDefs.find(x=>x.key==="insight")))}${passiveStat("⌕","Passive Investigation",10+skillTotal(skillDefs.find(x=>x.key==="investigation")))}${passiveStat("⚒","Tools",state.v911.tools.join(", "))}</section>`;
  }
  function abilityGroup(code){
    const [score,mod]=state.abilities[code];const defs=skillDefs.filter(def=>def.ability===code);const cls=abilityClasses[code];
    return `<section class="v911-card v911-ability-group ability-${cls}"><div class="v911-ability-head"><span class="v911-ability-symbol">${abilityIcons[code]}</span><span><h3>${e(abilityNames[code])}</h3><b>${code}</b></span><span><span class="v911-ability-score">${score}</span><span class="v911-ability-mod">(${signed(mod)})</span></span></div>
      ${defs.length?defs.map(def=>skillRow(def)).join(""):`<div class="v911-ability-empty">Used for HP and Constitution saves.</div>`}</section>`;
  }
  function skillRow(def){const status=state.skillProficiencies?.[def.key]||"none";const proficient=status!=="none";const pinned=state.v911.pinnedSkills.includes(def.key);return `<div class="v911-skill-row" data-action="skill-details" data-type="skill" data-key="${def.key}"><span>${skillIcons[def.key]||"◇"}</span><span>${e(def.name)} ${proficient?`<small class="v911-skill-prof">● ${status==="expertise"?"Expertise":"Proficient"}</small>`:""}</span><b>${signed(skillTotal(def))}</b><button class="v911-pin ${pinned?"on":""}" data-action="pin-skill" data-key="${def.key}">${pinned?"★":"☆"}</button></div>`;}
  function passiveStat(icon,label,value){return `<div class="v911-passive-stat"><span style="font-size:24px">${icon}</span><span>${label}<b>${e(value)}</b></span></div>`;}

  function featsHtml(){
    const traits=filteredTraits();const groups=["Class Feature","Subclass Feature","Racial Trait","Background Feature","Feat","Homebrew","Other"];
    const resources=state.resources.map((resource,index)=>({resource,index})).filter(({resource})=>resource.systemKey!=="hitDice"&&resource.max>0);
    const counts={class:state.traits.filter(t=>t.category==="Class Feature").length,feats:state.traits.filter(t=>t.category==="Feat").length,race:state.traits.filter(t=>t.category==="Racial Trait").length,active:resources.length};
    return `${pageHead("Feats & Features",`<button class="v911-btn primary" data-action="add-feature">＋ Add Feature</button>`)}
      <section class="v911-card v911-feat-summary">${featSummary("⬡","Class Features",counts.class)}${featSummary("⚔","Feats",counts.feats)}${featSummary("◉","Racial Traits",counts.race)}${featSummary("✹","Active Resources",counts.active)}</section>
      <div class="v911-feats-tools"><input class="v911-search" id="v911FeatSearch" value="${attr(featSearch)}" placeholder="⌕  Search features..."><div class="v911-filter-row">${["All","Action","Bonus","Reaction","Passive","Limited Use"].map(x=>`<button class="v911-filter ${featFilter===x?"active":""}" data-feat-filter="${x}">${x}</button>`).join("")}</div></div>
      <div class="v911-feats-layout"><main class="v911-feats-main">${groups.map(category=>featureGroup(category,traits.filter(entry=>entry.trait.category===category))).filter(Boolean).join("")||`<div class="v911-card v911-empty">No features match this view.</div>`}</main>
      <aside class="v911-side-stack"><section class="v911-card v911-side-card"><h3>⌛ Available Now</h3>${resources.map(({resource,index})=>`<div class="v911-available-row"><span class="v911-ability-orb">${resource.systemKey==="secondWind"?"✚":resource.systemKey==="actionSurge"?"⌛":"⬡"}</span><span><b>${e(resource.name)}</b></span><span><span class="v911-badge green">${resource.current}/${resource.max}</span><br><button class="v911-btn small" style="margin-top:5px" data-action="resource-use" data-index="${index}" ${resource.current<resource.useCost?"disabled":""}>Use</button></span></div>`).join("")}<div class="v911-rest-legend"><span>✚ Short Rest</span><span>⬡ Long Rest</span><span>✹ Long Rest or Special</span></div></section>
      <section class="v911-card v911-side-card"><h3>⚑ Pinned</h3>${state.v911.pinnedFeats.map(name=>`<div class="v911-note-row"><b>${e(name)}</b></div>`).join("")}</section></aside></div>`;
  }
  function featSummary(icon,label,value){return `<div class="v911-feat-summary-item"><span style="font-size:27px">${icon}</span><span>${label}<b>${value}</b></span></div>`;}
  function filteredTraits(){return state.traits.map((trait,index)=>({trait,index})).filter(({trait})=>{const text=`${trait.name} ${trait.shortDesc} ${trait.description}`.toLowerCase();if(featSearch&&!text.includes(featSearch.toLowerCase()))return false;const linked=traitLinkedResource(trait);const a=String(trait.activation||"").toLowerCase();if(featFilter==="All")return true;if(featFilter==="Limited Use")return Boolean(linked);if(featFilter==="Bonus")return a.includes("bonus");return a.includes(featFilter.toLowerCase());});}
  function featureGroup(category,entries){if(!entries.length)return "";const label=category==="Class Feature"?"Class Features":category==="Racial Trait"?"Racial Traits":category+"s";return `<section class="v911-card v911-feature-group"><div class="v911-feature-group-head"><span>${label} (${entries.length})</span><span>⌃</span></div>${entries.map(({trait,index})=>featureRow(trait,index)).join("")}</section>`;}
  function featureRow(trait,index){const linked=traitLinkedResource(trait);const source=[trait.sourceName||trait.sourceType,trait.activation].filter(Boolean).join(" · ");const description=featureText[trait.name]||trait.shortDesc||trait.description||"Feature details are available.";const resourceIndex=linked?state.resources.indexOf(linked):-1;return `<div class="v911-feature-row"><span class="v911-ability-orb">${trait.category==="Feat"?"⚔":"⬡"}</span><b class="v911-feature-name">${e(trait.name)}</b><span>${e(source)}</span><span class="v911-feature-desc">${e(description)}</span><span class="v911-feature-actions">${linked?`<span class="v911-badge green">${linked.current}/${linked.max}</span><button class="v911-btn small" data-action="resource-use" data-index="${resourceIndex}" ${linked.current<linked.useCost?"disabled":""}>Use</button>`:""}</span><button class="v911-icon-btn" data-action="feat-details" data-index="${index}">›</button></div>`;}

  function moreHtml(){
    const v=state.v911,c=v.campaign;
    return `${pageHead("More")}<div class="v911-more-tabs">${["Character Details","Notes","Campaign","Data & Settings"].map(tab=>`<button class="v911-more-tab ${moreTab===tab?"active":""}" data-more-tab="${tab}">${tab}</button>`).join("")}</div>
      <div class="v911-more-grid"><div class="v911-more-column">
        <section class="v911-card v911-more-card" id="v911-more-character"><h3>Character Details</h3><div class="v911-profile-block"><img src="${attr(portraitSrc())}" alt="${attr(state.name)}"><div><dl class="v911-details"><dt>Name</dt><dd>${e(state.name)}</dd><dt>Race</dt><dd>${e(state.race)}</dd><dt>Class</dt><dd>${e(state.className)}</dd><dt>Level</dt><dd>${state.level}</dd><dt>Background</dt><dd>${e(v.background)}</dd><dt>Alignment</dt><dd>${e(v.alignment)}</dd></dl><button class="v911-btn primary" style="margin-top:12px" data-action="edit-character">✎ Edit Character</button></div></div></section>
        <section class="v911-card v911-more-card"><h3>Appearance & Story</h3><div class="v911-story-grid"><dl class="v911-details" style="grid-template-columns:65px 1fr"><dt>Age</dt><dd>${e(v.age)}</dd><dt>Height</dt><dd>${e(v.height)}</dd><dt>Eyes</dt><dd>${e(v.eyes)}</dd><dt>Hair</dt><dd>${e(v.hair)}</dd></dl><div class="v911-story-copy"><p><b>Ideals:</b><br>${e(v.ideals)}</p><p><b>Bonds:</b><br>${e(v.bonds)}</p></div></div><button class="v911-btn" data-action="edit-profile">▤ Open Full Biography ›</button></section>
      </div><div class="v911-more-column">
        <section class="v911-card v911-more-card" id="v911-more-campaign"><h3>Campaign</h3><div class="v911-campaign-block"><div class="v911-campaign-icon">🗺</div><div><dl class="v911-details"><dt>Campaign</dt><dd>${e(c.name)}</dd><dt>Player</dt><dd>${e(c.player)}</dd><dt>Dungeon Master</dt><dd>${e(c.dm)}</dd><dt>Current Location</dt><dd>${e(c.location)}</dd><dt>Session</dt><dd>${e(c.session)}</dd><dt>Last Played</dt><dd>${e(c.lastPlayed)}</dd></dl><button class="v911-btn" style="margin-top:10px" data-action="edit-campaign">▤ Open Campaign Notes ›</button></div></div></section>
        <section class="v911-card v911-more-card" id="v911-more-notes"><h3>Character Notes</h3>${v.notes.map(note=>`<div class="v911-list-row"><span class="v911-row-icon">▤</span><span>${e(note.text)}</span><button class="v911-icon-btn" data-action="delete-note" data-id="${attr(note.id)}">⋮</button></div>`).join("")}<button class="v911-btn primary" style="margin-top:11px" data-action="new-note">＋ New Note</button></section>
        <section class="v911-card v911-more-card" id="v911-more-data"><h3>Data & Settings</h3><div class="v911-data-actions"><button class="v911-btn" data-action="save-now">▣ Save Now</button><button class="v911-btn" data-action="export">⇧ Export Character</button><button class="v911-btn" data-action="import">⇩ Import Character</button><button class="v911-btn" data-action="backup">◉ Backup Data</button></div><div class="v911-settings-row"><button class="v911-btn danger" data-action="reset">▣ Reset Character Data</button><span>◎ English Only</span><span>▣ Desktop Layout</span><span class="v911-status-pill">● Auto-fit On</span></div></section>
      </div></div><div class="v911-footer">Character Hub v9.11 · Local data stored in this browser.</div>`;
  }

  /* v10.0.1 illustrated UI layer. The gameplay handlers remain unchanged; only the visual renderers are replaced. */
  navHtml = function(){
    const icons={home:"home",combat:"actionSurge",inventory:"backpack",skills:"intelligence",feats:"wisdom",more:"campaignMap"};
    return navItems.map(([key,,label])=>`<button class="v911-nav-button ${currentPage===key?"active":""}" data-v911-page="${key}">${art(icons[key],"v911-nav-art","")}<span>${label}</span></button>`).join("");
  };
  sidebarHtml = function(){
    return `<aside class="v911-sidebar">
      <div class="v911-brand"><div class="v911-brand-crest">CH</div><h1>Character Hub</h1><div class="v911-version">V10.0.1</div></div>
      <div class="v911-character">
        <button class="v911-side-portrait" data-action="edit-character" aria-label="Edit character portrait"><img src="${attr(portraitSrc())}" alt="${attr(state.name)} portrait"><span class="v911-level-badge">${state.level}</span></button>
        <h2>${e(state.name)}</h2><p>${e(state.race)} ${e(state.className)} &middot; Level ${state.level}</p>
      </div>
      <nav class="v911-nav" aria-label="Primary navigation">${navHtml()}</nav>
      <div class="v911-sidebar-foot">ENGLISH ONLY &middot; DESKTOP WORKSPACE</div>
    </aside>`;
  };
  homeStat = function(key,label,value,infoKey,cls){
    return `<button class="v911-stat" data-info-key="${infoKey}">${art(key,"v911-stat-art","")}<span><span class="v911-stat-label">${label}</span><span class="v911-stat-value ${cls}">${value}</span></span></button>`;
  };
  homeHtml = function(){
    const hitDice=resourceByKey("hitDice")||{current:0,max:state.level};
    const tracked=state.resources.filter(resource=>resource.systemKey!=="hitDice");
    const activeCurrent=tracked.reduce((sum,r)=>sum+Number(r.current||0),0);
    const activeMax=tracked.reduce((sum,r)=>sum+Number(r.max||0),0);
    const armor=state.inventory.find(item=>itemCategory(item)==="Armor"&&!item.destroyed)?.name||"None";
    const xpP=pct(state.v911.xpCurrent,state.v911.xpNext);
    const glanceRow=(key,label,value="")=>`<div class="v911-list-row">${art(key,"v911-row-art","")}<span>${label}</span><b>${value}</b></div>`;
    return `${pageHead("Home")}
      <section class="v911-card v911-home-hero">
        <div class="v911-home-identity">
          <div class="v911-home-portrait"><img src="${attr(portraitSrc())}" alt="${attr(state.name)}"></div>
          <div><h2 class="v911-home-name">${e(state.name)}</h2><div class="v911-home-meta">${e(state.race)} ${e(state.className)} &middot; Level ${state.level}</div>
            <div class="v911-xp"><span><b>XP</b>&nbsp;&nbsp; ${Number(state.v911.xpCurrent).toLocaleString()} / ${Number(state.v911.xpNext).toLocaleString()}</span><div class="v911-progress"><span style="width:${xpP}%"></span></div></div>
          </div>
          <div class="v911-home-actions"><button class="v911-btn" data-action="edit-character">Edit Character</button><button class="v911-btn primary" data-action="level-up">Level Up</button></div>
        </div>
        <div class="v911-stat-strip">
          ${homeStat("secondWind","HP",`${state.hpCurrent}/${state.hpMax}`,"hp","")}
          ${homeStat("constitution","Temp HP",state.tempHp,"temp","blue")}
          ${homeStat("indomitable","AC",state.ac,"ac","")}
          ${homeStat("dexterity","Initiative",signed(state.initiative),"initiative","good")}
          ${homeStat("dexterity","Speed",`${state.speed} ft.`,"speed","")}
          ${homeStat("wisdom","Proficiency",signed(state.proficiency),"proficiency","good")}
        </div>
      </section>
      <section class="v911-card v911-coins"><h3 class="v911-card-title">Coins</h3>${Object.entries(state.coins).map(([c,v])=>coinHtml(c,v)).join("")}<button class="v911-btn small" data-action="edit-coins">Edit</button></section>
      <div class="v911-home-lower">
        <section class="v911-card v911-glance"><div class="v911-section-heading"><h3>At a Glance</h3></div>
          ${glanceRow("constitution","No active conditions")}
          <div class="v911-list-row clickable" data-action="toggle-inspiration">${art("wisdom","v911-row-art","")}<span>Inspiration</span><b>${state.v911.inspiration?"Active":"Not active"}</b></div>
          ${glanceRow("hitDice","Hit Dice",`${hitDice.current}/${hitDice.max}`)}
          ${glanceRow("actionSurge","Active Resources",`${activeCurrent}/${activeMax}`)}
          ${glanceRow("chainMail","Armor Equipped",e(armor))}
        </section>
        <section class="v911-card v911-journal"><div class="v911-section-heading"><h3>${art("passiveBook","v911-heading-art","")} Journal</h3></div>
          ${state.v911.journal.slice(0,3).map(entry=>`<div class="v911-list-row clickable" data-action="view-journal" data-id="${attr(entry.id)}">${art("passiveBook","v911-row-art","")}<span><b>${e(entry.title)}</b></span><span class="v911-row-meta">${e(entry.session)} &middot; ${e(entry.date)} &nbsp;&rsaquo;</span></div>`).join("")}
          <div class="v911-journal-actions"><button class="v911-btn primary" data-action="new-journal">New Journal Entry</button><button class="v911-btn" data-action="view-journal">View Full Journal &rsaquo;</button></div>
        </section>
      </div>`;
  };
  combatHtml = function(){
    const hitDice=resourceByKey("hitDice")||{current:0,max:state.level};
    const weapons=getCombatWeapons();
    const consumables=state.inventory.map((item,index)=>({item,index})).filter(({item})=>itemCategory(item)==="Consumable"&&!item.destroyed&&item.qty>0).slice(0,3);
    const resources=combatResourcesForFilter();
    const passives=state.traits.map((trait,index)=>({trait,index})).filter(({trait})=>trait.showInCombat&&trait.activation==="Passive"&&!trait.resourceId);
    const restLocked=state.combatActive||state.hpCurrent===0;
    const panelHead=(key,number,label)=>`<div class="v911-combat-panel-head">${art(key,"v911-panel-art","")}<span>${number}. ${label}</span></div>`;
    return `${pageHead("Combat")}
      <section class="v911-card v911-combat-status">
        <div class="v911-mode ${state.combatActive?"active":""}"><span class="v911-mode-dot"></span><span>${state.combatActive?"Combat Active":"Exploration"}<br><span class="v911-badge ${state.combatActive?"red":""}">${state.hpCurrent===0?"Downed":state.combatActive?"Active":"Ready"}</span></span></div>
        <div class="v911-combat-stats">${combatStat("HP",`${state.hpCurrent}/${state.hpMax}`,true)}${combatStat("Temp HP",state.tempHp)}${combatStat("AC",state.ac)}${combatStat("Initiative",signed(state.initiative))}${combatStat("Speed",`${state.speed} ft.`)}</div>
        <button class="v911-btn" data-action="hp-conditions">HP & Conditions</button><button class="v911-btn primary" data-action="toggle-combat">${state.combatActive?"End Combat":"Start Combat"}</button>
      </section>
      <div class="v911-combat-grid">
        <section class="v911-card v911-combat-panel">${panelHead("longsword",1,"Attacks")}<div class="v911-table-head"><span>Weapon</span><span>To Hit</span><span>Damage</span><span>Range</span><span>Details</span></div>${weapons.length?weapons.map(({item,index})=>weaponRow(item,index)).join(""):`<div class="v911-empty">No weapons are available.</div>`}</section>
        <section class="v911-card v911-combat-panel">${panelHead("actionSurge",2,"Abilities")}<div class="v911-filter-row">${["All","Action","Bonus","Reaction","Passive"].map(x=>`<button class="v911-filter ${abilityFilter===x?"active":""}" data-ability-filter="${x}">${x}</button>`).join("")}</div>${resources.map(({resource,index,trait})=>abilityRow(resource,index,trait)).join("")}${(abilityFilter==="All"||abilityFilter==="Passive")?`<div class="v911-passive-expand" data-action="passive-toggle">${art("passiveBook","v911-orb-art","")}<b>Passive Features</b><span>${passives.length} ${passiveOpen?"less":"more"}</span></div>${passiveOpen?`<div class="v911-passive-list">${passives.map(({trait,index})=>`<div class="v911-passive-item"><span>${e(trait.name)}</span><button class="v911-btn small" data-action="feat-details" data-index="${index}">Details</button></div>`).join("")}</div>`:""}`:""}</section>
        <section class="v911-card v911-combat-panel">${panelHead("healingPotion",3,"Quick Items")}${consumables.length?consumables.map(({item,index})=>quickItemRow(item,index)).join(""):`<div class="v911-empty">No quick items are available.</div>`}</section>
        <section class="v911-card v911-combat-panel">${panelHead("campfire",4,"Recovery")}<div class="v911-recovery-body"><div class="v911-rest-mini">${art("hitDice","v911-rest-art","Hit Dice")}<small>HIT DICE</small><strong>${hitDice.current}/${hitDice.max}</strong><span>${e(state.hitDieType||"d10")}</span></div><button class="v911-short-rest" data-action="short-rest" ${restLocked?"disabled":""}>${art("campfire","v911-short-rest-art","")}<span><b>OPEN SHORT REST</b><br><small>Spend Hit Dice to heal and regain resources.</small></span></button><button class="v911-btn primary v911-long-rest" data-action="long-rest" ${restLocked?"disabled":""}>TAKE LONG REST</button><div class="v911-rest-note">${restLocked?"Rests are unavailable during active combat or at 0 HP.":"A long rest restores HP, Hit Dice and configured resources."}</div></div></section>
      </div>`;
  };
  weaponRow = function(item,index){
    const magical=Boolean(item.isMagical||activePowers(item).length);
    return `<div class="v911-weapon-row ${magical?"magical":""}"><span class="v911-weapon-name">${art(itemArtKey(item),"v911-item-art",item.name)}<span><b>${e(item.name)}</b>${magical?`<small class="v911-magical-label">${art("radiantSlash","v911-inline-art","")} Magical</small>`:""}</span></span><b>${e(signed(weaponAttackBonus(item)))}</b><b>${e(weaponDamageDisplay(item))}</b><b>${e(item.weapon?.range||"—")}</b><button class="v911-icon-btn" data-action="item-details" data-index="${index}" aria-label="View ${attr(item.name)} details">•••</button></div>`;
  };
  abilityRow = function(resource,index,trait){
    const canUse=resource.current>=resource.useCost&&state.hpCurrent>0;
    return `<div class="v911-ability-row">${art(resourceArtKey(resource),"v911-orb-art",trait?.name||resource.name)}<span><b>${e(trait?.name||resource.name)}</b></span><b>${resource.current}/${resource.max}</b><button class="v911-btn small ${canUse?"primary":""}" data-action="resource-use" data-index="${index}" ${canUse?"":"disabled"}>Use</button></div>`;
  };
  quickItemRow = function(item,index){
    const c=item.consumable||{};const effect=[c.formula,c.effect||item.desc].filter(Boolean).join(" · ");
    return `<div class="v911-item-row">${art(itemArtKey(item),"v911-quick-art",item.name)}<span><b>${e(item.name)}</b><p>${e(c.activation||"Action")}</p></span><span class="v911-qty">×${item.qty}</span><span>${e(effect||"Utility item")}</span><button class="v911-btn small" data-action="item-use" data-index="${index}" ${state.hpCurrent===0?"disabled":""}>Use</button></div>`;
  };
  summaryStat = function(key,label,value,bar=null){
    const icon=key==="coins"?`<span class="v911-coin-icon coin-gp v911-summary-coin">G</span>`:art(key,"v911-summary-art","");
    return `<div class="v911-summary-stat">${icon}<span><small>${label}</small><b>${value}</b>${bar!==null?`<div class="v911-progress" style="width:145px;height:6px"><span style="width:${bar}%"></span></div>`:""}</span></div>`;
  };
  loadoutSlot = function(key,label,value){return `<div class="v911-loadout-slot">${art(key,"v911-loadout-art","")}<span><small>${label}</small><b>${e(value)}</b></span></div>`;};
  inventoryHtml = function(){
    const live=state.inventory.map((item,index)=>({item,index})).filter(({item})=>!item.destroyed);const visible=live.filter(({item})=>inventoryMatches(item));
    const totalWeight=live.reduce((sum,{item})=>sum+(Number(item.weight)||0)*(Number(item.qty)||0),0);const carry=Math.max(1,(state.abilities.STR?.[0]||10)*15);
    const attuned=live.filter(({item})=>item.isMagical).slice(0,2).length;const weapons=live.filter(({item})=>itemCategory(item)==="Weapon");const armor=live.find(({item})=>itemCategory(item)==="Armor");const mainHand=weapons[0]?.item;
    return `${pageHead("Inventory",`<button class="v911-btn primary" data-action="add-item">+ New Item</button>`)}
      <section class="v911-card v911-summary-strip">${summaryStat("backpack","Carry Weight",`${formatWeight(totalWeight)} / ${carry} lb`,pct(totalWeight,carry))}${summaryStat("radiantSlash","Attunement",`${attuned} / 3`)}${summaryStat("chainMail","Equipped",`${[mainHand,armor?.item].filter(Boolean).length}`)}<button class="v911-btn primary" data-action="add-item">+ New Item</button></section>
      <div class="v911-inventory-tools"><input class="v911-search" id="v911InventorySearch" value="${attr(inventorySearch)}" placeholder="Search inventory..."><div class="v911-filter-row">${["All","Weapons","Armor","Consumables","Magic","Gear"].map(x=>`<button class="v911-filter ${inventoryFilter===x?"active":""}" data-inventory-filter="${x}">${x}</button>`).join("")}</div></div>
      <section class="v911-card v911-loadout"><div class="v911-loadout-title">Equipped Loadout</div><div class="v911-loadout-grid">${loadoutSlot(mainHand?itemArtKey(mainHand):"longsword","Main Hand",mainHand?.name||"Empty")}${loadoutSlot("constitution","Off Hand","Empty")}${loadoutSlot("chainMail","Armor",armor?.item?.name||"None")}${loadoutSlot("radiantSlash","Attuned",`${attuned} / 3`)}</div></section>
      <div class="v911-inventory-layout"><section class="v911-card v911-inventory-table"><div class="v911-inventory-head"><span>Item</span><span>Category</span><span>Qty</span><span>Weight</span><span>Value</span><span>Status</span><span></span></div>${visible.length?visible.map(({item,index})=>inventoryRow(item,index,mainHand?.id,armor?.item?.id)).join(""):`<div class="v911-empty">No items match this view.</div>`}</section><aside class="v911-side-stack"><section class="v911-card v911-side-card"><h3>Inventory Notes</h3>${state.v911.notes.slice(0,2).map(note=>`<div class="v911-note-row">${art("passiveBook","v911-note-art","")}<span>${e(note.text)}<small>${e(note.date)}</small></span></div>`).join("")}<button class="v911-btn small" style="margin-top:10px" data-action="new-note">+ Note</button></section></aside></div>`;
  };
  inventoryRow = function(item,index,mainId,armorId){
    const category=itemCategory(item);const equipped=item.id===mainId||item.id===armorId;const quick=category==="Consumable";
    return `<div class="v911-inventory-row"><span class="v911-inventory-item ${item.isMagical?"magical":""}">${art(itemArtKey(item),"v911-inventory-art",item.name)}<b>${e(item.name)}</b></span><span>${e(category)}</span><b>${item.qty}</b><span>${formatWeight((Number(item.weight)||0)*(Number(item.qty)||0))} lb</span><span>${itemValues[item.name]??"—"}${itemValues[item.name]!=null?" GP":""}</span><span class="${quick?"v911-badge green":equipped?"v911-badge purple":""}">${quick?"Quick Item":equipped?"Equipped":"—"}</span><button class="v911-icon-btn" data-action="edit-item" data-index="${index}" aria-label="Edit ${attr(item.name)}">⋮</button></div>`;
  };
  skillsHtml = function(){
    const order=["STR","DEX","CON","INT","WIS","CHA"];
    return `${pageHead("Skills & Abilities",`<button class="v911-btn primary" data-action="edit-character">Edit Scores</button>`)}<section class="v911-card v911-saves"><div class="v911-saves-title">SAVING<br>THROWS</div>${order.map(code=>{const def=saveDefs.find(x=>x.ability===code);const proficient=Boolean(state.saveProficiencies?.[code]);return `<button class="v911-save" data-action="skill-details" data-type="save" data-key="${def.key}">${art(abilityArt[code],"v911-save-art","")}<span>${abilityNames[code]} ${signed(saveTotal(def))}</span><i class="v911-prof-dot ${proficient?"on":""}"></i></button>`}).join("")}<div class="v911-prof-bonus">Proficiency Bonus<b>${signed(state.proficiency)}</b></div></section><div class="v911-ability-grid">${order.map(code=>abilityGroup(code)).join("")}</div><section class="v911-card v911-passive-strip">${passiveStat("wisdom","Passive Perception",10+skillTotal(skillDefs.find(x=>x.key==="perception")))}${passiveStat("wisdom","Passive Insight",10+skillTotal(skillDefs.find(x=>x.key==="insight")))}${passiveStat("intelligence","Passive Investigation",10+skillTotal(skillDefs.find(x=>x.key==="investigation")))}${passiveStat("passiveBook","Tools",state.v911.tools.join(", "))}</section>`;
  };
  abilityGroup = function(code){
    const [score,mod]=state.abilities[code];const defs=skillDefs.filter(def=>def.ability===code);const cls=abilityClasses[code];
    return `<section class="v911-card v911-ability-group ability-${cls}"><div class="v911-ability-head">${art(abilityArt[code],"v911-ability-art",abilityNames[code])}<span><h3>${e(abilityNames[code])}</h3><b>${code}</b></span><span><span class="v911-ability-score">${score}</span><span class="v911-ability-mod">(${signed(mod)})</span></span></div>${defs.length?defs.map(def=>skillRow(def)).join(""):`<div class="v911-ability-empty">Used for HP and Constitution saves.</div>`}</section>`;
  };
  skillRow = function(def){
    const status=state.skillProficiencies?.[def.key]||"none";const proficient=status!=="none";const pinned=state.v911.pinnedSkills.includes(def.key);
    return `<div class="v911-skill-row" data-action="skill-details" data-type="skill" data-key="${def.key}">${art(abilityArt[def.ability],"v911-skill-art","")}<span>${e(def.name)} ${proficient?`<small class="v911-skill-prof">${status==="expertise"?"Expertise":"Proficient"}</small>`:""}</span><b>${signed(skillTotal(def))}</b><button class="v911-pin ${pinned?"on":""}" data-action="pin-skill" data-key="${def.key}" aria-label="${pinned?"Unpin":"Pin"} ${attr(def.name)}">${pinned?"●":"○"}</button></div>`;
  };
  passiveStat = function(key,label,value){return `<div class="v911-passive-stat">${art(key,"v911-passive-art","")}<span>${label}<b>${e(value)}</b></span></div>`;};
  featSummary = function(key,label,value){return `<div class="v911-feat-summary-item">${art(key,"v911-feat-summary-art","")}<span>${label}<b>${value}</b></span></div>`;};
  featsHtml = function(){
    const traits=filteredTraits();const groups=["Class Feature","Feat","Racial Trait","Subclass Feature","Homebrew","Other"];
    const resources=state.resources.map((resource,index)=>({resource,index})).filter(({resource})=>resource.systemKey!=="hitDice"&&resource.max>0);
    const counts={class:state.traits.filter(t=>t.category==="Class Feature").length,feats:state.traits.filter(t=>t.category==="Feat").length,race:state.traits.filter(t=>t.category==="Racial Trait").length,active:resources.length};
    return `${pageHead("Feats & Features",`<button class="v911-btn primary" data-action="add-feature">+ Add Feature</button>`)}<section class="v911-card v911-feat-summary">${featSummary("passiveBook","Class Features",counts.class)}${featSummary("actionSurge","Feats",counts.feats)}${featSummary("charisma","Racial Traits",counts.race)}${featSummary("radiantSlash","Active Resources",counts.active)}</section><div class="v911-feats-tools"><input class="v911-search" id="v911FeatSearch" value="${attr(featSearch)}" placeholder="Search features..."><div class="v911-filter-row">${["All","Action","Bonus","Reaction","Passive","Limited Use"].map(x=>`<button class="v911-filter ${featFilter===x?"active":""}" data-feat-filter="${x}">${x}</button>`).join("")}</div></div><div class="v911-feats-layout"><main class="v911-feats-main">${groups.map(category=>featureGroup(category,traits.filter(entry=>entry.trait.category===category))).filter(Boolean).join("")||`<div class="v911-card v911-empty">No features match this view.</div>`}</main><aside class="v911-side-stack"><section class="v911-card v911-side-card"><h3>Available Now</h3>${resources.map(({resource,index})=>`<div class="v911-available-row">${art(resourceArtKey(resource),"v911-orb-art",resource.name)}<span><b>${e(resource.name)}</b></span><span><span class="v911-badge green">${resource.current}/${resource.max}</span><br><button class="v911-btn small" style="margin-top:5px" data-action="resource-use" data-index="${index}" ${resource.current<resource.useCost?"disabled":""}>Use</button></span></div>`).join("")}<div class="v911-rest-legend"><span>Short Rest</span><span>Long Rest</span><span>Long Rest or Special</span></div></section><section class="v911-card v911-side-card"><h3>Pinned</h3>${state.v911.pinnedFeats.map(name=>`<div class="v911-note-row">${art("wisdom","v911-note-art","")}<b>${e(name)}</b></div>`).join("")}</section></aside></div>`;
  };
  featureRow = function(trait,index){
    const linked=traitLinkedResource(trait);const source=[trait.sourceName||trait.sourceType,trait.activation].filter(Boolean).join(" · ");const description=featureText[trait.name]||trait.shortDesc||trait.description||"Feature details are available.";const resourceIndex=linked?state.resources.indexOf(linked):-1;
    return `<div class="v911-feature-row">${art(traitArtKey(trait),"v911-feature-art",trait.name)}<b class="v911-feature-name">${e(trait.name)}</b><span>${e(source)}</span><span class="v911-feature-desc">${e(description)}</span><span class="v911-feature-actions">${linked?`<span class="v911-badge green">${linked.current}/${linked.max}</span><button class="v911-btn small" data-action="resource-use" data-index="${resourceIndex}" ${linked.current<linked.useCost?"disabled":""}>Use</button>`:""}</span><button class="v911-icon-btn" data-action="feat-details" data-index="${index}" aria-label="View ${attr(trait.name)} details">›</button></div>`;
  };
  function levelHistoryHtml(){
    const entries=state.progression?.levelHistory||[];
    const source=entry=>(entry.sources||[]).map(item=>item?.url?`<a class="v111-source ${item.type==="community-reference"?"community":"official"}" href="${attr(item.url)}" target="_blank" rel="noopener noreferrer">${item.type==="community-reference"?"Community Reference":"Official Source"} ↗</a>`:"").join("");
    const content=entries.length?entries.map(entry=>`<details class="v111-history-entry"><summary><span><b>Level ${entry.toLevel}</b><small>${e(new Date(entry.createdAt).toLocaleString("en"))}</small></span><strong>HP +${entry.hpGain}</strong></summary><div class="v111-history-body"><div><h4>Automatic updates</h4>${(entry.automaticChanges||[]).map(change=>`<p><span>${e(change.label)}</span><b>${e(change.before)} → ${e(change.after)}</b></p>`).join("")||"<p>No numerical changes.</p>"}</div><div><h4>Features and choices</h4>${[...(entry.grants||[]).map(item=>({label:item.name,value:item.kind})),...(entry.choices||[])].map(item=>`<p><span>${e(item.label)}</span><b>${e(item.value)}</b></p>`).join("")||"<p>No additional choices.</p>"}</div><div class="v111-history-sources">${source(entry)}</div></div></details>`).join(""):`<div class="v911-empty">No level-ups have been applied yet. Each completed Level Up will appear here automatically.</div>`;
    return `<section class="v911-card v911-more-card v111-history-card" id="v911-more-level-history"><div class="v111-history-heading"><div><small>AUTOMATIC RECORD</small><h3>Level History</h3><p>This rules log is kept separate from Character Notes.</p></div><span>${entries.length} ${entries.length===1?"entry":"entries"}</span></div>${content}</section>`;
  }
  moreHtml = function(){
    const v=state.v911,c=v.campaign;
    return `${pageHead("More")}<div class="v911-more-tabs">${["Character Details","Notes","Campaign","Data & Settings"].map(tab=>`<button class="v911-more-tab ${moreTab===tab?"active":""}" data-more-tab="${tab}">${tab}</button>`).join("")}</div><div class="v911-more-grid"><div class="v911-more-column"><section class="v911-card v911-more-card" id="v911-more-character"><h3>Character Details</h3><div class="v911-profile-block"><img src="${attr(portraitSrc())}" alt="${attr(state.name)}"><div><dl class="v911-details"><dt>Name</dt><dd>${e(state.name)}</dd><dt>Race</dt><dd>${e(state.race)}</dd><dt>Class</dt><dd>${e(state.className)}</dd><dt>Level</dt><dd>${state.level}</dd><dt>Background</dt><dd>${e(v.background)}</dd><dt>Alignment</dt><dd>${e(v.alignment)}</dd></dl><button class="v911-btn primary" style="margin-top:12px" data-action="edit-character">Edit Character</button></div></div></section><section class="v911-card v911-more-card"><h3>Appearance & Story</h3><div class="v911-story-grid"><dl class="v911-details" style="grid-template-columns:65px 1fr"><dt>Age</dt><dd>${e(v.age)}</dd><dt>Height</dt><dd>${e(v.height)}</dd><dt>Eyes</dt><dd>${e(v.eyes)}</dd><dt>Hair</dt><dd>${e(v.hair)}</dd></dl><div class="v911-story-copy"><p><b>Ideals:</b><br>${e(v.ideals)}</p><p><b>Bonds:</b><br>${e(v.bonds)}</p></div></div><button class="v911-btn" data-action="edit-profile">Open Full Biography &rsaquo;</button></section></div><div class="v911-more-column"><section class="v911-card v911-more-card" id="v911-more-campaign"><h3>Campaign</h3><div class="v911-campaign-block">${art("campaignMap","v911-campaign-art","Campaign map")}<div><dl class="v911-details"><dt>Campaign</dt><dd>${e(c.name)}</dd><dt>Player</dt><dd>${e(c.player)}</dd><dt>Dungeon Master</dt><dd>${e(c.dm)}</dd><dt>Current Location</dt><dd>${e(c.location)}</dd><dt>Session</dt><dd>${e(c.session)}</dd><dt>Last Played</dt><dd>${e(c.lastPlayed)}</dd></dl><button class="v911-btn" style="margin-top:10px" data-action="edit-campaign">Open Campaign Notes &rsaquo;</button></div></div></section><section class="v911-card v911-more-card" id="v911-more-notes"><h3>Character Notes</h3>${v.notes.map(note=>`<div class="v911-list-row">${art("passiveBook","v911-row-art","")}<span>${e(note.text)}</span><button class="v911-icon-btn" data-action="delete-note" data-id="${attr(note.id)}">⋮</button></div>`).join("")}<button class="v911-btn primary" style="margin-top:11px" data-action="new-note">+ New Note</button></section><section class="v911-card v911-more-card" id="v911-more-data"><h3>Data & Settings</h3><div class="v911-data-actions"><button class="v911-btn" data-action="save-now">Save Now</button><button class="v911-btn" data-action="export">Export Character</button><button class="v911-btn" data-action="import">Import Character</button><button class="v911-btn" data-action="backup">Backup Data</button></div><div class="v911-settings-row"><button class="v911-btn danger" data-action="reset">Reset Character Data</button><span>English Only</span><span>Desktop Layout</span><span class="v911-status-pill">Auto-fit On</span></div></section></div></div><div class="v911-footer">Character Hub v10.0.1 &middot; Local data stored in this browser.</div>`;
  };

  const moreHtmlBeforeLevelHistory=moreHtml;
  moreHtml=function(){
    return moreHtmlBeforeLevelHistory()
      .replace(/(<button class="v911-more-tab [^"]*" data-more-tab="Campaign">)/,`<button class="v911-more-tab ${moreTab==="Level History"?"active":""}" data-more-tab="Level History">Level History</button>$1`)
      .replace('<section class="v911-card v911-more-card" id="v911-more-data">',`${levelHistoryHtml()}<section class="v911-card v911-more-card" id="v911-more-data">`)
      .replace("Character Hub v10.0.1","Character Hub v12.0.0");
  };
  function pageHtml(){if(currentPage==="home")return homeHtml();if(currentPage==="combat")return combatHtml();if(currentPage==="inventory")return inventoryHtml();if(currentPage==="skills")return skillsHtml();if(currentPage==="feats")return featsHtml();return moreHtml();}
  function deathEmergencyActive(){const d=state.deathSaves||{};return state.hpCurrent===0&&!d.dead&&!d.stabilized;}
  function renderV911(){
    ensureV911State();
    const app=document.getElementById("v911App");if(!app)return;
    const deathEmergency=deathEmergencyActive();
    if(deathEmergency&&currentPage!=="combat"){currentPage="combat";localStorage.setItem("characterHubV911Page","combat");}
    const active=document.activeElement;const activeId=active?.id;const selection=active&&"selectionStart" in active?[active.selectionStart,active.selectionEnd]:null;
    app.innerHTML=`${sidebarHtml()}<main class="v911-main"><div class="v911-canvas">${pageHtml()}</div></main><div class="v911-overlay" id="v911Overlay"><section class="v911-dialog"><header class="v911-dialog-head"><h2 id="v911DialogTitle"></h2><button class="v911-dialog-close" data-action="modal-close">×</button></header><div class="v911-dialog-body" id="v911DialogBody"></div></section></div>`;
    document.title=`${pageNames[currentPage]} · Character Hub v9.11`;
    document.title=`${pageNames[currentPage]} · Character Hub v12.0.0`;
    if(deathEmergency)openDeathEmergency();
    else if(activeId){const next=document.getElementById(activeId);if(next){next.focus();if(selection&&next.setSelectionRange)next.setSelectionRange(selection[0],selection[1]);}}
  }

  function setPage(page){if(!pageNames[page])page="home";currentPage=page;localStorage.setItem("characterHubV911Page",page);renderV911();document.querySelector(".v911-main")?.scrollTo({top:0,behavior:"instant"});}
  function openDialog(title,body,kind){modalKind=kind;const overlay=document.getElementById("v911Overlay");document.getElementById("v911DialogTitle").textContent=title;document.getElementById("v911DialogBody").innerHTML=body;overlay.classList.toggle("death-lock",kind==="death-emergency");overlay.classList.add("open");}
  function closeDialog(){if(modalKind==="death-emergency"&&deathEmergencyActive())return toast("Resolve the Death Saving Throws first");document.getElementById("v911Overlay")?.classList.remove("open","death-lock");modalKind="";}
  function openJournal(id=""){
    if(id){const entry=state.v911.journal.find(x=>x.id===id);if(entry)return openDialog(entry.title,`<div class="v911-journal-entry"><small>${e(entry.session)} · ${e(entry.date)}</small><p>${e(entry.body)}</p></div><div class="v911-dialog-actions"><button class="v911-btn danger" data-action="delete-journal" data-id="${attr(entry.id)}">Delete</button><button class="v911-btn" data-action="modal-close">Close</button></div>`,"journal-view");}
    openDialog("Journal",`${state.v911.journal.map(entry=>`<article class="v911-journal-entry"><h4>${e(entry.title)}</h4><small>${e(entry.session)} · ${e(entry.date)}</small><p>${e(entry.body)}</p><button class="v911-btn small danger" data-action="delete-journal" data-id="${attr(entry.id)}">Delete</button></article>`).join("")}<button class="v911-btn primary" data-action="new-journal">＋ New Journal Entry</button>`,"journal-list");
  }
  function openJournalEditor(){openDialog("New Journal Entry",`<div class="v911-form-grid"><div class="v911-form-group full"><label>Title</label><input id="v911JournalTitle" placeholder="Entry title"></div><div class="v911-form-group"><label>Session</label><input id="v911JournalSession" value="Session ${e(state.v911.campaign.session)}"></div><div class="v911-form-group"><label>Date</label><input id="v911JournalDate" value="Today"></div><div class="v911-form-group full"><label>Entry</label><textarea id="v911JournalBody" placeholder="What happened?"></textarea></div></div><div class="v911-dialog-actions"><button class="v911-btn" data-action="modal-close">Cancel</button><button class="v911-btn primary" data-action="save-journal">Save Entry</button></div>`,"journal-edit");}
  function openNoteEditor(){openDialog("New Character Note",`<div class="v911-form-group"><label>Note</label><textarea id="v911NoteText" placeholder="Write a short reminder..."></textarea></div><div class="v911-form-group" style="margin-top:10px"><label>Reference</label><input id="v911NoteDate" value="Session ${e(state.v911.campaign.session)}"></div><div class="v911-dialog-actions"><button class="v911-btn" data-action="modal-close">Cancel</button><button class="v911-btn primary" data-action="save-note">Save Note</button></div>`,"note-edit");}
  function openProfileEditor(){const v=state.v911;openDialog("Appearance & Story",`<div class="v911-form-grid">${field("Age","v911Age",v.age)}${field("Height","v911Height",v.height)}${field("Eyes","v911Eyes",v.eyes)}${field("Hair","v911Hair",v.hair)}${field("Background","v911Background",v.background)}${field("Alignment","v911Alignment",v.alignment)}<div class="v911-form-group full"><label>Ideals</label><textarea id="v911Ideals">${e(v.ideals)}</textarea></div><div class="v911-form-group full"><label>Bonds</label><textarea id="v911Bonds">${e(v.bonds)}</textarea></div></div><div class="v911-dialog-actions"><button class="v911-btn" data-action="modal-close">Cancel</button><button class="v911-btn primary" data-action="save-profile">Save Details</button></div>`,"profile-edit");}
  function openCampaignEditor(){const c=state.v911.campaign;openDialog("Campaign",`<div class="v911-form-grid">${field("Campaign","v911CampaignName",c.name)}${field("Player","v911Player",c.player)}${field("Dungeon Master","v911Dm",c.dm)}${field("Current Location","v911Location",c.location)}${field("Session","v911Session",c.session)}${field("Last Played","v911LastPlayed",c.lastPlayed)}</div><div class="v911-dialog-actions"><button class="v911-btn" data-action="modal-close">Cancel</button><button class="v911-btn primary" data-action="save-campaign">Save Campaign</button></div>`,"campaign-edit");}
  function field(label,id,value){return `<div class="v911-form-group"><label>${label}</label><input id="${id}" value="${attr(value)}"></div>`;}
  function openHpDialog(){const d=state.deathSaves||{successes:0,failures:0};openDialog("HP & Conditions",`<div class="v911-hp-controls"><div class="v911-form-group"><label>Amount</label><input id="v911HpAmount" type="number" min="0" value="1"></div><button class="v911-btn danger" data-action="hp-damage">Apply Damage</button><button class="v911-btn primary" data-action="hp-heal">Apply Healing</button></div><div class="v911-settings-row"><span>HP <b>${state.hpCurrent}/${state.hpMax}</b></span><span>Temporary HP <b>${state.tempHp}</b></span><button class="v911-btn small" data-action="edit-temp">Edit Temp HP</button></div><h3 class="v911-card-title" style="margin-top:18px">Conditions</h3><div class="v911-empty" style="text-align:left">No active conditions</div>${state.hpCurrent===0?`<h3 class="v911-card-title">Death Saving Throws</h3><div class="v911-death-grid">${deathTrack("Successes",d.successes,"success")}${deathTrack("Failures",d.failures,"failure")}</div><div class="v911-dialog-actions" style="justify-content:flex-start;flex-wrap:wrap"><button class="v911-btn" data-death-action="success">＋ Success</button><button class="v911-btn danger" data-death-action="failure">＋ Failure</button><button class="v911-btn" data-death-action="nat20">Natural 20</button><button class="v911-btn" data-death-action="nat1">Natural 1</button><button class="v911-btn" data-death-action="stable">Stabilized</button></div>`:""}`,"hp");}
  function deathTrack(label,count,type){return `<div class="v911-death-track"><b>${label}</b><div class="v911-death-dots">${[0,1,2].map(i=>`<span class="v911-death-dot ${i<count?`on ${type}`:""}"></span>`).join("")}</div></div>`;}
  function openDeathEmergency(){
    const d=state.deathSaves||{successes:0,failures:0};
    openDialog("Death Saving Throws",`<div class="v911-death-alert">${art("hitDice","v911-death-alert-art","")}<div><strong>${e(state.name)} is at 0 HP</strong><p>Resolve the Death Saving Throws before continuing. The rest of Character Hub is temporarily locked.</p></div></div><div class="v911-death-grid">${deathTrack("Successes",d.successes,"success")}${deathTrack("Failures",d.failures,"failure")}</div><p class="v911-death-help">Roll the d20 physically, then record the result below. Three successes stabilize the character. Three failures mark the character as dead.</p><div class="v911-death-actions"><button class="v911-btn death-success" data-death-action="success">Record Success</button><button class="v911-btn danger" data-death-action="failure">Record Failure</button><button class="v911-btn" data-death-action="nat20">Natural 20 — 1 HP</button><button class="v911-btn danger" data-death-action="nat1">Natural 1 — 2 Failures</button><button class="v911-btn" data-death-action="stable">Mark Stabilized</button></div><div class="v911-emergency-healing"><div><b>Received Healing?</b><small>Any healing above 0 HP ends the emergency.</small></div><div class="v911-form-group"><label for="v911HpAmount">HP restored</label><input id="v911HpAmount" type="number" min="1" value="1"></div><button class="v911-btn primary" data-action="hp-heal">Apply Healing</button></div>`,"death-emergency");
    document.querySelector(".v911-sidebar")?.setAttribute("inert","");
    document.querySelector(".v911-main")?.setAttribute("inert","");
    document.querySelector('[data-death-action="success"]')?.focus();
  }
  function processDeathSave(action){handleDeathSaveAction(action);if(state.deathSaves?.dead)toast("Three failures — the character is dead");else if(state.deathSaves?.stabilized)toast("The character is stabilized");}

  function downloadState(prefix){const data=JSON.stringify(englishOnlySnapshot(state),null,2);const blob=new Blob([data],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${prefix}-${String(state.name).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
  function importState(){const input=document.createElement("input");input.type="file";input.accept="application/json,.json";input.onchange=async()=>{try{const parsed=JSON.parse(await input.files[0].text());localStorage.setItem("characterHubState",JSON.stringify(parsed));location.reload();}catch(error){toast("The selected character file could not be imported");}};input.click();}
  function persistV911(message="Saved"){save();renderV911();toast(message);}

  function handleAction(button,action){
    const index=Number(button.dataset.index);const id=button.dataset.id;
    if(action==="toggle-theme"){const next=document.documentElement.dataset.theme==="dark"?"light":"dark";applyTheme(next,{persist:true});renderV911();return toast(`${next==="dark"?"Dark":"Light"} mode enabled`);}
    if(deathEmergencyActive()&&action!=="hp-heal")return toast("Resolve the Death Saving Throws first");
    if(action==="edit-character")return openEdit();if(action==="level-up")return openLevel();if(action==="edit-coins")return document.getElementById("editCoinsBtn")?.click();
    if(action==="toggle-inspiration"){state.v911.inspiration=!state.v911.inspiration;return persistV911("Inspiration updated");}
    if(action==="new-journal")return openJournalEditor();if(action==="view-journal")return openJournal(id||"");if(action==="delete-journal"){state.v911.journal=state.v911.journal.filter(x=>x.id!==id);persistV911("Journal entry removed");return closeDialog();}
    if(action==="save-journal"){const title=document.getElementById("v911JournalTitle").value.trim();if(!title)return toast("Enter a journal title");state.v911.journal.unshift({id:makeId("journal"),title,session:document.getElementById("v911JournalSession").value.trim(),date:document.getElementById("v911JournalDate").value.trim(),body:document.getElementById("v911JournalBody").value.trim()});persistV911("Journal entry saved");return closeDialog();}
    if(action==="toggle-combat")return toggleCombat();if(action==="hp-conditions")return openHpDialog();if(action==="item-details")return showItemDetails(index);if(action==="resource-use")return useResource(index);if(action==="passive-toggle"){passiveOpen=!passiveOpen;return renderV911();}if(action==="item-use")return openConsumable(index);if(action==="short-rest")return openShortRest();if(action==="long-rest")return performLongRest();
    if(action==="add-item")return openItemEditor();if(action==="edit-item")return openItemEditor(index);if(action==="skill-details")return showCheckDetail(button.dataset.type,button.dataset.key);if(action==="pin-skill"){const key=button.dataset.key;state.v911.pinnedSkills=state.v911.pinnedSkills.includes(key)?state.v911.pinnedSkills.filter(x=>x!==key):[...state.v911.pinnedSkills,key];return persistV911("Pinned checks updated");}
    if(action==="add-feature")return openTraitEditor(-1);if(action==="feat-details")return showTrait(index);if(action==="manage-traits")return openTraitManager();
    if(action==="edit-profile")return openProfileEditor();if(action==="edit-campaign")return openCampaignEditor();if(action==="new-note")return openNoteEditor();if(action==="delete-note"){state.v911.notes=state.v911.notes.filter(x=>x.id!==id);return persistV911("Note removed");}
    if(action==="save-note"){const text=document.getElementById("v911NoteText").value.trim();if(!text)return toast("Enter a note");state.v911.notes.unshift({id:makeId("note"),text,date:document.getElementById("v911NoteDate").value.trim()});persistV911("Note saved");return closeDialog();}
    if(action==="save-profile"){Object.assign(state.v911,{age:val("v911Age"),height:val("v911Height"),eyes:val("v911Eyes"),hair:val("v911Hair"),background:val("v911Background"),alignment:val("v911Alignment"),ideals:val("v911Ideals"),bonds:val("v911Bonds")});persistV911("Character details saved");return closeDialog();}
    if(action==="save-campaign"){Object.assign(state.v911.campaign,{name:val("v911CampaignName"),player:val("v911Player"),dm:val("v911Dm"),location:val("v911Location"),session:val("v911Session"),lastPlayed:val("v911LastPlayed")});persistV911("Campaign saved");return closeDialog();}
    if(action==="save-now")return persistV911("Character saved");if(action==="export")return downloadState("character-hub-export");if(action==="backup")return downloadState("character-hub-backup");if(action==="import")return importState();if(action==="reset"){if(confirm("Reset all character data? This cannot be undone."))document.getElementById("resetBtn")?.click();return;}
    if(action==="modal-close")return closeDialog();if(action==="hp-damage"||action==="hp-heal"){const amount=Math.max(0,Number(document.getElementById("v911HpAmount")?.value)||0);document.getElementById("hpChangeAmount").value=amount;document.getElementById(action==="hp-damage"?"damageBtn":"healBtn")?.click();return;}if(action==="edit-temp")return document.getElementById("editTempHpBtn")?.click();
  }
  function val(id){return document.getElementById(id)?.value.trim()||"";}

  const app=document.createElement("div");app.id="v911App";document.querySelector(".app-shell")?.appendChild(app);
  app.addEventListener("click",event=>{
    const pageButton=event.target.closest("[data-v911-page]");if(pageButton)return setPage(pageButton.dataset.v911Page);
    const info=event.target.closest("[data-info-key]");if(info)return showInfo(info.dataset.infoKey);
    const ability=event.target.closest("[data-ability-filter]");if(ability){abilityFilter=ability.dataset.abilityFilter;return renderV911();}
    const inventory=event.target.closest("[data-inventory-filter]");if(inventory){inventoryFilter=inventory.dataset.inventoryFilter;return renderV911();}
    const feat=event.target.closest("[data-feat-filter]");if(feat){featFilter=feat.dataset.featFilter;return renderV911();}
    const tab=event.target.closest("[data-more-tab]");if(tab){moreTab=tab.dataset.moreTab;renderV911();const id={"Character Details":"v911-more-character",Notes:"v911-more-notes",Campaign:"v911-more-campaign","Data & Settings":"v911-more-data"}[moreTab];return document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});}
    const death=event.target.closest("[data-death-action]");if(death)return processDeathSave(death.dataset.deathAction);
    const button=event.target.closest("[data-action]");if(button){event.preventDefault();event.stopPropagation();return handleAction(button,button.dataset.action);}
  });
  app.addEventListener("input",event=>{if(event.target.id==="v911InventorySearch"){inventorySearch=event.target.value;renderV911();}if(event.target.id==="v911FeatSearch"){featSearch=event.target.value;renderV911();}});
  app.addEventListener("click",event=>{if(event.target.id==="v911Overlay")closeDialog();});
  app.addEventListener("click",event=>{if(event.target.closest('[data-more-tab="Level History"]'))setTimeout(()=>document.getElementById("v911-more-level-history")?.scrollIntoView({behavior:"smooth",block:"start"}),0);});
  globalThis.addEventListener("characterhub:open-level-history",()=>{moreTab="Level History";currentPage="more";localStorage.setItem("characterHubV911Page","more");renderV911();setTimeout(()=>document.getElementById("v911-more-level-history")?.scrollIntoView({behavior:"smooth",block:"start"}),0);});

  ensureV911State();
  try{applyTheme(typeof themePreference!=="undefined"?themePreference:"system",{persist:false});applyLanguage("en",{persist:true,rerender:false});}catch(error){}
  document.documentElement.lang="en";document.documentElement.dir="ltr";
  const legacyRender=render;
  render=function(){legacyRender();ensureV911State();renderV911();};
  const legacyNavigate=navigateToPage;
  navigateToPage=function(page){legacyNavigate(page);if(pageNames[page])setPage(page);};
  renderV911();
})();
