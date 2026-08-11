const THEME_STORAGE_KEY="characterHubTheme";
const THEME_OPTIONS=["light","dark","system"];
const systemThemeMedia=window.matchMedia?.("(prefers-color-scheme: dark)")||{
  matches:false,
  addEventListener(){},
  removeEventListener(){}
};
let themePreference=normalizeThemePreference(
  (()=>{try{return localStorage.getItem(THEME_STORAGE_KEY)}catch(error){return "system"}})()
);

function normalizeThemePreference(value){
  return THEME_OPTIONS.includes(value)?value:"system";
}
function resolvedTheme(preference=themePreference){
  const normalized=normalizeThemePreference(preference);
  return normalized==="system"?(systemThemeMedia.matches?"dark":"light"):normalized;
}
function updateThemeControls(){
  const resolved=resolvedTheme();
  document.querySelectorAll("[data-theme-choice]").forEach(button=>{
    const selected=button.dataset.themeChoice===themePreference;
    button.classList.toggle("active",selected);
    button.setAttribute("aria-checked",String(selected));
  });
  const badge=document.getElementById("themeResolvedBadge");
  const status=document.getElementById("themeStatus");
  const resolvedLabel=resolved==="dark"?phrase("Dark"):phrase("Light");
  if(badge)badge.textContent=resolvedLabel;
  if(status){
    if(themePreference==="system"){
      status.innerHTML=appLanguage==="he"
        ?`מצב <b>מערכת</b> פעיל — כרגע מוצג מצב <b>${resolvedLabel}</b> בהתאם להגדרת המכשיר.`
        :`<b>System</b> mode is active — the app currently uses <b>${resolvedLabel}</b> based on the device setting.`;
    }else{
      status.innerHTML=appLanguage==="he"
        ?`מצב <b>${resolvedLabel}</b> פעיל.`
        :`<b>${resolvedLabel}</b> mode is active.`;
    }
  }
}
function applyTheme(preference=themePreference,{persist=true}={}){
  themePreference=normalizeThemePreference(preference);
  const resolved=resolvedTheme(themePreference);
  const root=document.documentElement;
  root.dataset.themePreference=themePreference;
  root.dataset.theme=resolved;
  root.style.colorScheme=resolved;
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta)themeMeta.setAttribute("content",resolved==="dark"?"#120e09":"#7a1818");
  if(persist){
    try{localStorage.setItem(THEME_STORAGE_KEY,themePreference)}catch(error){}
  }
  updateThemeControls();
  return resolved;
}
function chooseTheme(preference){
  const resolved=applyTheme(preference);
  const resolvedLabel=resolved==="dark"?phrase("Dark"):phrase("Light");
  const selectedLabel=themePreference==="system"
    ?`${phrase("System")} (${resolvedLabel})`
    :resolvedLabel;
  toast(appLanguage==="he"
    ?`ערכת הנושא הוחלפה למצב ${selectedLabel}`
    :`Theme changed to ${selectedLabel}`);
}
function handleSystemThemeChange(){
  if(themePreference==="system")applyTheme("system",{persist:false});
}
if(systemThemeMedia.addEventListener){
  systemThemeMedia.addEventListener("change",handleSystemThemeChange);
}else if(systemThemeMedia.addListener){
  systemThemeMedia.addListener(handleSystemThemeChange);
}


const LANGUAGE_STORAGE_KEY="characterHubLanguage";
const LANGUAGE_OPTIONS=["en"];
let appLanguage="en";

const UI_PHRASE_PAIRS=[{"en": "Home", "he": "בית"}, {"en": "Combat", "he": "קרב"}, {"en": "Inventory", "he": "מלאי"}, {"en": "Skills", "he": "מיומנויות"}, {"en": "Feats", "he": "Feats"}, {"en": "More", "he": "עוד"}, {"en": "Edit Character", "he": "עריכת דמות"}, {"en": "Level Up", "he": "עליית רמה"}, {"en": "Edit", "he": "עריכה"}, {"en": "Manage", "he": "ניהול"}, {"en": "Add", "he": "הוספה"}, {"en": "Save", "he": "שמירה"}, {"en": "Cancel", "he": "ביטול"}, {"en": "Delete", "he": "מחיקה"}, {"en": "Remove", "he": "הסר"}, {"en": "Open", "he": "פתח"}, {"en": "Close", "he": "סגור"}, {"en": "Details", "he": "פרטים"}, {"en": "Use", "he": "השתמש"}, {"en": "Appearance", "he": "מראה"}, {"en": "Theme", "he": "ערכת נושא"}, {"en": "Light", "he": "בהיר"}, {"en": "Dark", "he": "כהה"}, {"en": "System", "he": "מערכת"}, {"en": "Light parchment", "he": "קלף בהיר"}, {"en": "Dark parchment", "he": "קלף אפל"}, {"en": "Follow device", "he": "לפי המכשיר"}, {"en": "Language", "he": "שפה"}, {"en": "Hebrew", "he": "עברית"}, {"en": "English", "he": "English"}, {"en": "Full RTL interface", "he": "ממשק מימין לשמאל"}, {"en": "Full LTR interface", "he": "ממשק משמאל לימין"}, {"en": "Hit Points", "he": "נקודות פגיעה"}, {"en": "Temporary HP", "he": "נקודות פגיעה זמניות"}, {"en": "Armor Class", "he": "דרג שריון"}, {"en": "Initiative", "he": "יוזמה"}, {"en": "Speed", "he": "מהירות"}, {"en": "Proficiency Bonus", "he": "תוסף שליטה"}, {"en": "Coins", "he": "מטבעות"}, {"en": "Skills & Abilities", "he": "מיומנויות ותכונות"}, {"en": "Saving Throws", "he": "גלגולי הצלה"}, {"en": "Ability Scores & Skills", "he": "ערכי תכונה ומיומנויות"}, {"en": "Ability Scores", "he": "ערכי תכונה"}, {"en": "Ability", "he": "תכונה"}, {"en": "Skill", "he": "מיומנות"}, {"en": "Based On", "he": "מבוסס על"}, {"en": "Bonus", "he": "תוסף"}, {"en": "Exploration", "he": "חקירה"}, {"en": "Ready", "he": "מוכן"}, {"en": "Start Combat", "he": "התחל קרב"}, {"en": "End Combat", "he": "סיים קרב"}, {"en": "Combat Active", "he": "קרב פעיל"}, {"en": "Combat Status", "he": "מצב הקרב"}, {"en": "Damage", "he": "נזק"}, {"en": "Heal", "he": "ריפוי"}, {"en": "Edit Temporary HP", "he": "עריכת נקודות פגיעה זמניות", "aliases": ["עריכת נק״פ זמניות", "עריכת Temporary HP"]}, {"en": "Reset Temporary HP", "he": "איפוס נקודות פגיעה זמניות"}, {"en": "Conditions", "he": "מצבים"}, {"en": "No active conditions", "he": "אין מצבים פעילים"}, {"en": "Death Saving Throws", "he": "גלגולי הצלה ממוות"}, {"en": "Successes", "he": "הצלחות"}, {"en": "Failures", "he": "כישלונות"}, {"en": "Success", "he": "הצלחה"}, {"en": "Failure", "he": "כישלון"}, {"en": "Natural 20", "he": "20 טבעי"}, {"en": "Natural 1", "he": "1 טבעי"}, {"en": "Stabilized", "he": "מיוצב"}, {"en": "Received Healing", "he": "קיבל ריפוי"}, {"en": "Manual Reset", "he": "איפוס ידני"}, {"en": "Attacks", "he": "התקפות"}, {"en": "Weapons", "he": "נשקים"}, {"en": "Resources & Abilities", "he": "משאבים ויכולות"}, {"en": "Available", "he": "זמין"}, {"en": "End Turn", "he": "סיום התור"}, {"en": "Quick Items", "he": "חפצים מהירים"}, {"en": "Items", "he": "חפצים"}, {"en": "Core Rules Actions", "he": "פעולות חוקי בסיס"}, {"en": "Rules · Actions · Move", "he": "חוקים · פעולות · תנועה"}, {"en": "Recovery & Rests", "he": "התאוששות ומנוחות"}, {"en": "Hit Dice", "he": "קוביות פגיעה"}, {"en": "Short Rest", "he": "מנוחה קצרה"}, {"en": "Long Rest", "he": "מנוחה ארוכה"}, {"en": "Open Short Rest", "he": "פתח מנוחה קצרה", "aliases": ["פתח Short Rest"]}, {"en": "Take Long Rest", "he": "בצע מנוחה ארוכה", "aliases": ["בצע Long Rest"]}, {"en": "Add Item", "he": "הוספת חפץ"}, {"en": "Magical Only", "he": "קסומים בלבד"}, {"en": "Feats & Features", "he": "Feats & Features"}, {"en": "Add Feat / Feature", "he": "הוספת Feat / Feature", "aliases": ["הוספת Feat / Feature"]}, {"en": "Edit Existing Character", "he": "עריכת הדמות הקיימת"}, {"en": "Create New Character", "he": "יצירת דמות חדשה מאפס"}, {"en": "Manage Resources", "he": "ניהול משאבים", "aliases": ["ניהול Resources"]}, {"en": "Manage Feats & Features", "he": "ניהול Feats & Features", "aliases": ["ניהול Feats & Features"]}, {"en": "Reset Prototype", "he": "איפוס אב־הטיפוס"}, {"en": "Smart Adaptation", "he": "התאמה חכמה"}, {"en": "Checks Reference", "he": "מקרא בדיקות"}, {"en": "Basic Details", "he": "פרטים בסיסיים"}, {"en": "Name", "he": "שם"}, {"en": "Race", "he": "גזע"}, {"en": "Class", "he": "מקצוע"}, {"en": "Subclass", "he": "תת־מקצוע"}, {"en": "Level", "he": "רמה"}, {"en": "Combat Statistics", "he": "נתוני קרב"}, {"en": "Current HP", "he": "נקודות פגיעה נוכחיות"}, {"en": "Maximum HP", "he": "נקודות פגיעה מרביות"}, {"en": "Speed (ft.)", "he": "מהירות (רגל)"}, {"en": "Attack Ability", "he": "תכונת התקפה"}, {"en": "Current", "he": "נוכחי"}, {"en": "Maximum", "he": "מקסימום"}, {"en": "Die Type", "he": "סוג קובייה"}, {"en": "Skill Proficiencies", "he": "שליטה במיומנויות"}, {"en": "Saving Throw Proficiencies", "he": "שליטה בגלגולי הצלה"}, {"en": "Save All Changes", "he": "שמירת כל השינויים"}, {"en": "Inventory Editor", "he": "עורך מלאי"}, {"en": "Basic Information", "he": "מידע בסיסי"}, {"en": "Item Name", "he": "שם החפץ"}, {"en": "Category", "he": "קטגוריה"}, {"en": "General Item", "he": "חפץ כללי"}, {"en": "Weapon", "he": "נשק"}, {"en": "Armor / Shield", "he": "שריון / מגן"}, {"en": "Consumable", "he": "מתכלה"}, {"en": "Tool / Kit", "he": "כלי / ערכה"}, {"en": "Quantity", "he": "כמות"}, {"en": "Weight per Item", "he": "משקל ליחידה"}, {"en": "Item Status", "he": "מצב החפץ"}, {"en": "Active", "he": "פעיל"}, {"en": "Destroyed", "he": "הרוס"}, {"en": "Magical Properties", "he": "תכונות קסומות"}, {"en": "Magical Item", "he": "חפץ קסום"}, {"en": "No", "he": "לא"}, {"en": "Yes", "he": "כן"}, {"en": "Add Magical Power", "he": "הוסף כוח קסום"}, {"en": "Description", "he": "תיאור"}, {"en": "Save Item", "he": "שמירת החפץ"}, {"en": "Depletion Risk", "he": "סיכון התכלות"}, {"en": "Do Not Apply Penalty", "he": "אל תפעיל את העונש"}, {"en": "Apply Penalty", "he": "הפעל את העונש"}, {"en": "Recharge Magical Power", "he": "חידוש כוח קסום"}, {"en": "Skip", "he": "דלג"}, {"en": "Apply Recharge", "he": "החל חידוש"}, {"en": "Feat & Feature Editor", "he": "עורך Feats & Features"}, {"en": "Identity", "he": "זהות"}, {"en": "Class Feature", "he": "יכולת מקצוע"}, {"en": "Subclass Feature", "he": "יכולת תת־מקצוע"}, {"en": "Racial Trait", "he": "תכונת גזע"}, {"en": "Homebrew", "he": "תוכן ביתי"}, {"en": "Other", "he": "אחר"}, {"en": "Source Type", "he": "סוג מקור"}, {"en": "Source Name", "he": "שם המקור"}, {"en": "Usage in Play", "he": "שימוש במשחק"}, {"en": "Action Economy", "he": "כלכלת פעולות"}, {"en": "Activation Type", "he": "סוג הפעלה"}, {"en": "Passive", "he": "סביל"}, {"en": "Action", "he": "פעולה"}, {"en": "Bonus Action", "he": "פעולת בונוס"}, {"en": "Reaction", "he": "תגובה"}, {"en": "Special", "he": "מיוחד"}, {"en": "Trigger", "he": "תנאי הפעלה"}, {"en": "Show in Combat", "he": "הצג במסך הקרב", "aliases": ["הצג בקרב"]}, {"en": "Quick Summary", "he": "תקציר קצר"}, {"en": "Full Description", "he": "תיאור מלא"}, {"en": "Progression", "he": "התקדמות"}, {"en": "Unlock Level", "he": "נפתח ברמה"}, {"en": "Upgrade Levels", "he": "רמות שדרוג"}, {"en": "Resource Link", "he": "קישור למשאב"}, {"en": "No Resource", "he": "ללא משאב", "aliases": ["ללא Resource"]}, {"en": "Link Existing Resource", "he": "חבר למשאב קיים", "aliases": ["חבר ל־Resource קיים"]}, {"en": "Create New Resource", "he": "צור משאב חדש", "aliases": ["צור Resource חדש"]}, {"en": "Existing Resource", "he": "משאב קיים", "aliases": ["Resource קיים"]}, {"en": "New Resource", "he": "משאב חדש", "aliases": ["Resource חדש"]}, {"en": "Use Cost", "he": "עלות שימוש", "aliases": ["עלות הפעלה"]}, {"en": "Recharge", "he": "חידוש"}, {"en": "Short or Long Rest", "he": "מנוחה קצרה או ארוכה"}, {"en": "Manual", "he": "ידני"}, {"en": "None", "he": "ללא"}, {"en": "Recharge Method", "he": "אופן החידוש"}, {"en": "All Uses", "he": "כל השימושים"}, {"en": "Fixed Amount", "he": "מספר קבוע"}, {"en": "Amount Restored", "he": "כמות שחוזרת"}, {"en": "Save Feat / Feature", "he": "שמירת Feat / Feature", "aliases": ["שמירת Feat / Feature"]}, {"en": "Add Resource", "he": "הוספת משאב", "aliases": ["הוספת Resource"]}, {"en": "Resource Name", "he": "שם המשאב"}, {"en": "Action Type", "he": "סוג פעולה"}, {"en": "Free", "he": "חופשי"}, {"en": "Uses", "he": "שימושים"}, {"en": "Current Uses", "he": "שימושים נוכחיים"}, {"en": "Maximum Uses", "he": "שימושים מרביים"}, {"en": "Save Resource", "he": "שמירת משאב", "aliases": ["שמירת Resource"]}, {"en": "Level Up:", "he": "עליית רמה:"}, {"en": "Automatic Gains", "he": "מה מתקבל אוטומטית"}, {"en": "Hit Points on Level Up", "he": "נקודות פגיעה בעליית רמה"}, {"en": "Choose Advancement", "he": "בחר התקדמות"}, {"en": "Ability Score Improvement", "he": "שיפור ערכי תכונה"}, {"en": "Choose a New Feat", "he": "בחר Feat חדש"}, {"en": "Confirm Level Up", "he": "אישור עליית רמה"}, {"en": "New Character", "he": "דמות חדשה"}, {"en": "Create Character", "he": "יצירת דמות"}, {"en": "Damage at 0 HP", "he": "נזק בזמן 0 נקודות פגיעה", "aliases": ["נזק בזמן 0 נק״פ", "נזק בזמן 0 HP"]}, {"en": "Normal Damage", "he": "נזק רגיל"}, {"en": "Critical Hit", "he": "פגיעה קריטית"}, {"en": "Important:", "he": "חשוב:"}, {"en": "Save Changes", "he": "שמירה"}, {"en": "Spend Hit Die and Heal", "he": "בזבז קוביית פגיעה ורפא", "aliases": ["בזבז Hit Die ורפא"]}, {"en": "Cancel Rest", "he": "ביטול המנוחה"}, {"en": "Finish Short Rest", "he": "סיום מנוחה קצרה", "aliases": ["סיום Short Rest"]}, {"en": "Edit Coins", "he": "עריכת מטבעות"}, {"en": "Use Item", "he": "שימוש בחפץ"}, {"en": "Roll Manually and Enter HP Restored", "he": "גלגל ידנית והזן כמה נקודות פגיעה חזרו"}, {"en": "To Hit", "he": "גלגול פגיעה"}, {"en": "Range", "he": "טווח"}, {"en": "Magical", "he": "קסום"}, {"en": "Mundane", "he": "רגיל"}, {"en": "Magical Powers", "he": "כוחות קסומים"}, {"en": "Unlimited", "he": "ללא הגבלה"}, {"en": "Charges", "he": "שימושים"}, {"en": "Cost", "he": "עלות"}, {"en": "Proficient", "he": "בעל שליטה"}, {"en": "Not Proficient", "he": "ללא שליטה"}, {"en": "Proficiency", "he": "שליטה"}, {"en": "Expertise", "he": "מומחיות"}, {"en": "Movement", "he": "תנועה"}, {"en": "All", "he": "הכול"}, {"en": "Fixed", "he": "קבוע"}, {"en": "Dice", "he": "קוביות"}, {"en": "Dawn", "he": "שחר"}, {"en": "Live Inventory Preview", "he": "תצוגה מקדימה חיה של המלאי"}, {"en": "Live Feature Preview", "he": "תצוגה מקדימה חיה של היכולת"}, {"en": "Hidden from Combat", "he": "מוסתר מהקרב"}, {"en": "Linked Resource", "he": "משאב מקושר"}, {"en": "No description.", "he": "לא הוזן תיאור."}, {"en": "No Hebrew name provided", "he": "לא הוזן שם בעברית"}, {"en": "No Hebrew description provided", "he": "לא הוזן תיאור בעברית"}, {"en": "English name not provided", "he": "לא הוזן שם באנגלית"}, {"en": "English description not provided", "he": "לא הוזן תיאור באנגלית"}, {"en": "Character workspace", "he": "סביבת עבודה לדמות"}, {"en": "· Level", "he": "· רמה"}, {"en": "HP", "he": "נק״פ"}, {"en": "Temp HP", "he": "נק״פ זמניות"}, {"en": "AC", "he": "דרג״ש"}, {"en": "Saving Throws are shown separately, and each Skill remains under the Ability it normally uses.", "he": "גלגולי ההצלה מוצגים בנפרד, וכל מיומנות נשארת מתחת לתכונה שעליה היא מבוססת בדרך כלל.", "aliases": ["ה־Saving Throws מוצגים בנפרד, וכל Skill נשאר מתחת ל־Ability שעליו הוא מבוסס בדרך כלל."]}, {"en": "Edit Statistics", "he": "עריכת הנתונים"}, {"en": "Abilities", "he": "תכונות"}, {"en": "Swipe between Abilities", "he": "החליקו בין התכונות", "aliases": ["החליקו בין ה־Abilities"]}, {"en": "The most important information for each turn is shown above. Every other section can be opened or closed.", "he": "המידע החשוב בכל תור נמצא למעלה. כל אזור אחר ניתן לפתיחה וסגירה."}, {"en": "Edit Temp HP", "he": "עריכת נק״פ זמניות", "aliases": ["עריכת Temp HP"]}, {"en": "Reset Temp HP", "he": "איפוס נק״פ זמניות", "aliases": ["איפוס Temp HP"]}, {"en": "No active Conditions", "he": "אין מצבים פעילים", "aliases": ["אין Conditions פעילים"]}, {"en": "No HP change has been recorded yet.", "he": "לא נרשם שינוי בנק״פ עדיין.", "aliases": ["לא נרשם שינוי בנק״פ עדיין."]}, {"en": "Unconscious — roll a Death Save at the start of your turn.", "he": "מחוסר הכרה — גלגל גלגול הצלה ממוות בתחילת תורך.", "aliases": ["Unconscious — גלגל Death Save בתחילת התור."]}, {"en": "+ Success", "he": "+ הצלחה"}, {"en": "+ Failure", "he": "+ כישלון"}, {"en": "The character is at 0 HP. Attacks are shown for reference only.", "he": "הדמות ב־0 נק״פ. ההתקפות מוצגות לעיון בלבד.", "aliases": ["הדמות ב־0 HP. ההתקפות מוצגות לעיון בלבד."]}, {"en": "Action Surge Active", "he": "פרץ פעולה פעיל", "aliases": ["Action Surge פעיל"]}, {"en": "You have one additional Action this turn.", "he": "יש לך פעולה נוספת בתור הנוכחי.", "aliases": ["יש לך Action נוסף בתור הנוכחי."]}, {"en": "At 0 HP, active abilities are disabled; passive abilities remain visible.", "he": "ב־0 נק״פ יכולות פעילות מושבתות; יכולות סבילות נשארות מוצגות.", "aliases": ["ב־0 HP יכולות אקטיביות מושבתות; יכולות פסיביות נשארות מוצגות."]}, {"en": "At 0 HP, you cannot use items yourself.", "he": "ב־0 נק״פ אי אפשר להשתמש בחפצים בעצמך.", "aliases": ["ב־0 HP אי אפשר להשתמש בחפצים בעצמך."]}, {"en": "Core Rules Actions are unavailable while the character is unconscious.", "he": "פעולות חוקי הבסיס אינן זמינות כשהדמות מחוסרת הכרה.", "aliases": ["Core Rules Actions אינן זמינות כשהדמות מחוסרת הכרה."]}, {"en": "You may spend Hit Dice during a Short Rest.", "he": "ניתן לבזבז קוביות פגיעה במהלך מנוחה קצרה.", "aliases": ["ניתן לבזבז במהלך Short Rest"]}, {"en": "Spend Hit Dice and restore Short Rest resources.", "he": "בזבוז קוביות פגיעה וחידוש משאבי מנוחה קצרה.", "aliases": ["בזבוז Hit Dice וחידוש משאבי Short Rest."]}, {"en": "A Short Rest cannot be taken right now.", "he": "לא ניתן לבצע מנוחה קצרה כרגע.", "aliases": ["לא ניתן לבצע Short Rest כרגע."]}, {"en": "Restore HP, resources and magical powers according to their settings.", "he": "חידוש נק״פ, משאבים וכוחות קסומים בהתאם להגדרות.", "aliases": ["חידוש HP, משאבים וכוחות קסומים בהתאם להגדרות."]}, {"en": "A Long Rest cannot be taken right now.", "he": "לא ניתן לבצע מנוחה ארוכה כרגע.", "aliases": ["לא ניתן לבצע Long Rest כרגע."]}, {"en": "A cleaner inventory: search, filters, categories and magical items in one place.", "he": "ניהול מלאי נקי יותר: חיפוש, מסננים, קטגוריות וחפצים קסומים במקום אחד.", "aliases": ["ניהול מלאי נקי יותר: חיפוש, פילטרים, קטגוריות וחפצים מכושפים במקום אחד."]}, {"en": "+ Add Item", "he": "+ הוספת חפץ"}, {"en": "Manage all character feats and features in a clearer and more organized layout.", "he": "נהל את כל הכישרונות והיכולות של הדמות בצורה מסודרת, ברורה ונוחה יותר.", "aliases": ["נהל את כל היכולות, התכונות והפיצ'רים של הדמות בצורה מסודרת, ברורה ונוחה יותר."]}, {"en": "+ Add", "he": "+ הוספה"}, {"en": "Choose a fixed theme, or let the app follow the device display mode.", "he": "בחר מצב קבוע, או תן לאפליקציה לעקוב אחרי מצב התצוגה של המכשיר."}, {"en": "Choose one language for the entire interface. Content will not fall back to the other language when a translation is missing.", "he": "בחר שפה אחת לכל הממשק. תוכן לא יוצג בשפה השנייה כאשר חסר תרגום.", "aliases": ["בחר שפה אחת לכל הממשק. התוכן לא יוצג בשפה השנייה כאשר חסר תרגום."]}, {"en": "The prototype currently shows Human Fighter modules. Changing the class or race in the editor updates headings and emphasis without deleting your Homebrew data.", "he": "אב־הטיפוס מציג כרגע מודולים של בן־אנוש לוחם. שינוי המקצוע או הגזע במסך העריכה משנה את הכותרות והדגשים בלי למחוק את התוכן הביתי שהזנת.", "aliases": ["האב־טיפוס מציג כרגע מודולים של Human Fighter. שינוי המקצוע או הגזע במסך העריכה משנה את הכותרות והדגשים, בלי למחוק את נתוני ה־Homebrew שהזנת."]}, {"en": "Desktop Prototype", "he": "אב־טיפוס למחשב"}, {"en": "Advanced Character Editor", "he": "עריכת דמות מתקדמת"}, {"en": "Leave Override empty for automatic calculation. A manual number can be entered for a Homebrew campaign.", "he": "השאר את העקיפה ריקה לחישוב אוטומטי. אפשר להזין מספר ידני לקמפיין עם חוקי בית.", "aliases": ["Override ריק = חישוב אוטומטי. אפשר להזין מספר ידני לקמפיין Homebrew."]}, {"en": "Choose Proficiency or enter a manual Override.", "he": "בחר שליטה או הזן עקיפה ידנית.", "aliases": ["בחר Proficiency או הזן Override ידני."]}, {"en": "The category determines which fields are shown. Existing logic is preserved: weapons continue to appear in Combat, Consumables in Quick Items, and an item may contain multiple magical powers.", "he": "הקטגוריה קובעת אילו שדות יוצגו. כל הלוגיקה הקיימת נשמרת: נשקים ממשיכים להופיע בקרב, מתכלים בשימוש מהיר, וחפץ יכול להכיל כמה כוחות קסומים.", "aliases": ["הקטגוריה קובעת אילו שדות יוצגו. כל הלוגיקה הקיימת נשמרת: נשקים ממשיכים להופיע בקרב, Consumables בשימוש מהיר, וחפץ יכול להכיל כמה כוחות קסומים."]}, {"en": "Identity, category, quantity and item status", "he": "זהות, קטגוריה, כמות ומצב החפץ"}, {"en": "Item Name in Hebrew", "he": "שם החפץ בעברית"}, {"en": "Item Name in English", "he": "שם החפץ באנגלית"}, {"en": "Passive effects, active powers, Charges and Depletion Risk", "he": "השפעות סבילות, כוחות פעילים, שימושים וסיכון התכלות", "aliases": ["השפעות פסיביות, כוחות פעילים, Charges ו־Depletion Risk"]}, {"en": "An item may have multiple magical powers. Each power separately stores Activation, uses, Recharge and last-use risk.", "he": "אפשר להוסיף כמה כוחות קסומים לאותו חפץ. כל כוח שומר בנפרד סוג הפעלה, שימושים, חידוש וסיכון בשימוש האחרון.", "aliases": ["אפשר להוסיף כמה כוחות קסומים לאותו חפץ. כל כוח שומר בנפרד Activation, שימושים, Recharge וסיכון בשימוש האחרון."]}, {"en": "+ Add Magical Power", "he": "+ הוסף כוח קסום"}, {"en": "General description, Game Master information or Homebrew", "he": "תיאור כללי, מידע מהמנחה או תוכן ביתי", "aliases": ["תיאור כללי, מידע מה־DM או Homebrew"]}, {"en": "Description in Hebrew", "he": "תיאור בעברית"}, {"en": "Description in English", "he": "תיאור באנגלית"}, {"en": "Physically roll the configured die. After rolling, choose whether the condition was met and the penalty is applied.", "he": "גלגל פיזית את הקובייה שהוגדרה. לאחר הגלגול בחר האם התנאי התקיים והעונש מופעל."}, {"en": "There is no need to enter or save the roll result.", "he": "אין צורך להזין או לשמור את תוצאת הגלגול."}, {"en": "How many uses were actually restored?", "he": "כמה שימושים חזרו בפועל?"}, {"en": "Enter the total result of the recharge formula.", "he": "הזן את התוצאה הכוללת של נוסחת החידוש."}, {"en": "The Feat or Feature stores its explanation, trigger and source. If it has limited uses, link it to a Resource.", "he": "הכישרון או היכולת שומרים את ההסבר, תנאי ההפעלה והמקור. אם יש שימושים מוגבלים, מחברים אותם למשאב.", "aliases": ["ה־Feat או ה־Feature שומר את ההסבר, תנאי ההפעלה והמקור. אם יש שימושים מוגבלים, מחברים אותו ל־Resource."]}, {"en": "+ Add Feat / Feature", "he": "+ הוסף כישרון / יכולת", "aliases": ["+ הוסף Feat / Feature"]}, {"en": "Name, category and the source that grants the ability", "he": "שם, קטגוריה והמקור שממנו היכולת מגיעה"}, {"en": "Name in Hebrew", "he": "שם בעברית"}, {"en": "Name in English", "he": "שם באנגלית"}, {"en": "Feat", "he": "כישרון"}, {"en": "Source Name in Hebrew", "he": "שם המקור בעברית"}, {"en": "Source Name in English", "he": "שם המקור באנגלית"}, {"en": "Action Economy, Trigger and Combat visibility", "he": "כלכלת פעולות, תנאי הפעלה והופעה במסך הקרב", "aliases": ["Action Economy, Trigger והופעה במסך הקרב"]}, {"en": "Trigger in Hebrew", "he": "תנאי הפעלה בעברית"}, {"en": "Trigger in English", "he": "תנאי הפעלה באנגלית"}, {"en": "It will appear under Resources & Abilities according to its activation type.", "he": "יופיע באזור משאבים ויכולות לפי סוג ההפעלה.", "aliases": ["יופיע באזור Resources & Abilities לפי סוג ההפעלה."]}, {"en": "A quick summary beside the full explanation", "he": "תקציר מהיר לצד ההסבר המלא"}, {"en": "Short Summary in Hebrew", "he": "תקציר קצר בעברית"}, {"en": "Short Summary in English", "he": "תקציר קצר באנגלית"}, {"en": "Full Description in Hebrew", "he": "תיאור מלא בעברית"}, {"en": "Full Description in English", "he": "תיאור מלא באנגלית"}, {"en": "When the ability unlocks and at which levels it changes", "he": "מתי היכולת נפתחת ובאילו רמות היא משתדרגת"}, {"en": "No counter, link an existing counter, or create a new Resource", "he": "ללא מונה, חיבור למונה קיים או יצירת משאב חדש", "aliases": ["ללא מונה, חיבור למונה קיים או יצירת Resource חדש"]}, {"en": "The Feature stores the explanation and Trigger. The Resource stores uses and Recharge, so there is no duplicate counter.", "he": "היכולת שומרת את ההסבר ואת תנאי ההפעלה. המשאב שומר את מספר השימושים והחידוש, כך שאין מונה כפול.", "aliases": ["ה־Feature שומר את ההסבר וה־Trigger. ה־Resource שומר את מספר השימושים וה־Recharge, כך שאין מונה כפול."]}, {"en": "Usage Tracking", "he": "מעקב שימושים"}, {"en": "Add, edit and remove limited-use abilities such as Action Surge, Second Wind, subclass abilities and Homebrew.", "he": "כאן מוסיפים, עורכים ומסירים יכולות מוגבלות כמו פרץ פעולה, רוח שנייה, יכולות תת־מקצוע ותוכן ביתי.", "aliases": ["כאן מוסיפים, עורכים ומסירים יכולות מוגבלות כמו Action Surge, Second Wind, יכולות Subclass ו־Homebrew."]}, {"en": "+ Add Resource", "he": "+ הוסף משאב", "aliases": ["+ הוסף Resource"]}, {"en": "Resource Name in Hebrew", "he": "שם המשאב בעברית"}, {"en": "Resource Name in English", "he": "שם המשאב באנגלית"}, {"en": "Cost per Use", "he": "עלות בכל שימוש"}, {"en": "The Resource will appear under Combat Resources.", "he": "המשאב יופיע באזור משאבי הקרב.", "aliases": ["המשאב יופיע באזור Combat Resources."]}, {"en": "When it recharges", "he": "מתי מתחדש"}, {"en": "How many uses return", "he": "כמה שימושים חוזרים"}, {"en": "Preparation for the advanced version", "he": "מידע להכנה לגרסה המתקדמת"}, {"en": "These fields do not currently automate anything. They are saved so future Class, Subclass or Level Up systems can identify and update the ability.", "he": "השדות האלה לא מפעילים כרגע אוטומציה. הם נשמרים כדי שבעתיד מערכות מקצוע, תת־מקצוע או עליית רמה יוכלו לזהות ולעדכן את היכולת.", "aliases": ["השדות האלה לא מפעילים כרגע אוטומציה. הם נשמרים כדי שבעתיד Class, Subclass או Level Up יוכלו לזהות ולעדכן את היכולת."]}, {"en": "Source", "he": "מקור"}, {"en": "Physically roll your Hit Die and enter the result.", "he": "גלגל פיזית את קוביית הפגיעה שלך והזן את התוצאה.", "aliases": ["גלגל פיזית את קוביית ה־Hit Die שלך והזן את התוצאה."]}, {"en": "d10 Result", "he": "תוצאת d10"}, {"en": "Increase two scores by 1, or one score by 2.", "he": "העלה שני ערכים ב־1 או ערך אחד ב־2.", "aliases": ["העלה שני ציונים ב־1 או ציון אחד ב־2."]}, {"en": "Choose a new special ability.", "he": "בחר יכולת מיוחדת חדשה."}, {"en": "Create a New Character", "he": "דמות חדשה מאפס"}, {"en": "A short prototype of the guided process. The full system will add stages for class, race, Skills, equipment and spell choices.", "he": "אב־טיפוס קצר לתהליך המודרך. המערכת המלאה תוסיף שלבים לבחירת מקצוע, גזע, מיומנויות, ציוד ולחשים.", "aliases": ["אב־טיפוס קצר לתהליך המודרך. המערכת המלאה תפתח שלבים נוספים לבחירות מקצוע, גזע, Skills, ציוד ולחשים."]}, {"en": "Normal damage marks one failure. A Critical Hit marks two failures. Damage equal to or greater than Maximum HP causes Massive Damage.", "he": "נזק רגיל מסמן כישלון אחד. פגיעה קריטית מסמנת שני כישלונות. נזק ששווה לנק״פ המרביות או עובר אותן גורם לנזק עצום.", "aliases": ["נזק רגיל מסמן כישלון אחד. Critical Hit מסמן שני כישלונות. נזק ששווה או עובר את Maximum HP גורם ל־Massive Damage."]}, {"en": "Temporary HP absorb damage before normal HP. Enter the total amount the character should currently have.", "he": "נק״פ זמניות סופגות נזק לפני הנק״פ הרגילות. הזן את הכמות הכוללת שצריכה להיות לדמות כרגע.", "aliases": ["Temporary HP סופגים נזק לפני ה־HP הרגיל. הזן את הכמות הכוללת שצריכה להיות לדמות כרגע."]}, {"en": "Temporary HP normally do not stack; when a new source is received, choose which value to keep according to campaign rules.", "he": "נק״פ זמניות בדרך כלל אינן מצטברות; כאשר מתקבל מקור חדש בוחרים איזה ערך לשמור בהתאם לחוקי הקמפיין.", "aliases": ["Temporary HP בדרך כלל אינם מצטברים; כשמקבלים מקור חדש בוחרים איזה ערך לשמור, בהתאם לחוקי הקמפיין."]}, {"en": "You may roll one Hit Die at a time. Physically roll d10, enter the result, and the app adds the Constitution Modifier.", "he": "אפשר לגלגל קוביית פגיעה אחת בכל פעם. גלגל פיזית d10, הזן את התוצאה, והאפליקציה תוסיף את מתאם החוסן.", "aliases": ["אפשר לגלגל Hit Die אחד בכל פעם. גלגל פיזית d10, הזן את התוצאה, והאתר יוסיף את Constitution Modifier."]}, {"en": "Hit Die Result", "he": "תוצאת קוביית פגיעה", "aliases": ["תוצאת Hit Die"]}, {"en": "Enter a result to preview the healing.", "he": "הזן תוצאה כדי לראות את הריפוי."}, {"en": "No Hit Dice have been spent during this rest yet.", "he": "עדיין לא בוזבזו קוביות פגיעה במנוחה הזאת.", "aliases": ["עדיין לא בוזבזו Hit Dice במנוחה הזאת."]}, {"en": "Roll manually and enter HP restored", "he": "גלגל ידנית והזן כמה נק״פ חזרו", "aliases": ["גלגל ידנית והזן כמה HP חזרו"]}, {"en": "Category Details", "he": "פרטי הקטגוריה"}, {"en": "Weapon Details", "he": "פרטי הנשק"}, {"en": "Weapon Mode", "he": "סוג הנשק"}, {"en": "Damage Dice", "he": "קוביות נזק"}, {"en": "Damage Type", "he": "סוג נזק"}, {"en": "Additional Attack Bonus", "he": "תוסף פגיעה נוסף", "aliases": ["Attack Bonus נוסף"]}, {"en": "Additional Damage Bonus", "he": "תוסף נזק נוסף", "aliases": ["Damage Bonus נוסף"]}, {"en": "Properties", "he": "מאפיינים"}, {"en": "The weapon appears automatically under Weapons & Attacks. The Attack Roll is calculated from the Ability, Proficiency and bonuses.", "he": "הנשק מופיע אוטומטית באזור הנשקים וההתקפות. גלגול הפגיעה מחושב מהתכונה, מהשליטה ומהתוספים.", "aliases": ["הנשק יופיע אוטומטית ב־Weapons & Attacks. ה־Attack Roll יחושב מה־Ability, ה־Proficiency והבונוסים."]}, {"en": "Armor / Shield Details", "he": "פרטי שריון / מגן"}, {"en": "Armor Type", "he": "סוג שריון"}, {"en": "Base AC", "he": "דרג שריון בסיסי"}, {"en": "AC Bonus", "he": "תוסף לדרג השריון"}, {"en": "Maximum DEX Bonus", "he": "תוסף זריזות מרבי"}, {"en": "STR Requirement", "he": "דרישת כוח"}, {"en": "Add DEX to AC", "he": "הוסף זריזות לדרג השריון"}, {"en": "According to armor restrictions", "he": "בהתאם למגבלות השריון"}, {"en": "Stealth Disadvantage", "he": "חיסרון בהתגנבות"}, {"en": "In this version the data is saved and displayed, but it does not automatically change the character's AC until a full Equipped system is built.", "he": "בגרסה הזאת הנתונים נשמרים ומוצגים, אך אינם משנים אוטומטית את דרג השריון של הדמות עד שתיבנה מערכת ציוד מלאה.", "aliases": ["בגרסה הזאת הנתונים נשמרים ומוצגים, אך אינם משנים אוטומטית את ה־AC של הדמות עד שתיבנה מערכת Equipped מלאה."]}, {"en": "Consumable Details", "he": "פרטי חפץ מתכלה"}, {"en": "Effect Type", "he": "סוג השפעה"}, {"en": "Formula", "he": "נוסחה"}, {"en": "Consumed after use", "he": "נעלם מהמלאי לאחר שימוש"}, {"en": "Tool / Kit Details", "he": "פרטי כלי / ערכה"}, {"en": "Associated Ability", "he": "תכונה משויכת"}, {"en": "Proficient with this tool", "he": "שליטה בכלי הזה"}, {"en": "A General Item has no dedicated combat data.", "he": "לחפץ כללי אין נתוני קרב מיוחדים."}, {"en": "No magical powers have been added yet. An item may still be magical with only a passive effect.", "he": "עדיין לא נוספו כוחות קסומים. חפץ יכול להיות קסום גם עם השפעה סבילה בלבד.", "aliases": ["עדיין לא נוספו כוחות קסומים. חפץ יכול להיות קסום גם עם השפעה פסיבית בלבד."]}, {"en": "Power Name in Hebrew", "he": "שם הכוח בעברית"}, {"en": "Power Name in English", "he": "שם הכוח באנגלית"}, {"en": "Type", "he": "סוג"}, {"en": "Effect Formula", "he": "נוסחת השפעה"}, {"en": "Attack Bonus", "he": "תוסף פגיעה"}, {"en": "Damage Bonus", "he": "תוסף נזק"}, {"en": "Exact Description in Hebrew", "he": "תיאור מדויק בעברית"}, {"en": "Exact Description in English", "he": "תיאור מדויק באנגלית"}, {"en": "Uses & Recharge", "he": "שימושים וחידוש"}, {"en": "Recharge Amount", "he": "כמות חידוש"}, {"en": "Dice Formula for Recharge", "he": "נוסחת קוביות לחידוש"}, {"en": "Maximum Uses = 0 means the power has unlimited uses. For a rolled recharge, the app asks you to enter the physical roll result.", "he": "שימושים מרביים = 0 פירושם כוח ללא מגבלת שימוש. בחידוש באמצעות גלגול האפליקציה תבקש להזין את תוצאת הגלגול הפיזי.", "aliases": ["Maximum Uses = 0 פירושו כוח ללא מגבלת שימוש. בגלגול חידוש האתר יבקש להזין תוצאה פיזית."]}, {"en": "Shown under the selected Action type", "he": "מופיע תחת סוג הפעולה שנבחר"}, {"en": "The power is marked as Lost", "he": "הכוח מסומן כאבוד", "aliases": ["הכוח מסומן כ־Lost"]}, {"en": "It cannot be used or recharged", "he": "לא ניתן להשתמש בו או לחדש אותו"}, {"en": "Is there a risk on the final use?", "he": "האם יש סיכון בשימוש האחרון?"}, {"en": "The following fields open only when Yes is selected. The check appears when the power reaches 0 uses.", "he": "השדות הבאים נפתחים רק כאשר בוחרים כן. הבדיקה מופיעה כאשר הכוח מגיע ל־0 שימושים."}, {"en": "Die", "he": "קובייה"}, {"en": "Failure On", "he": "כישלון בתוצאה"}, {"en": "Failure Result", "he": "תוצאת הכישלון"}, {"en": "Only this power disappears", "he": "רק הכוח הזה נעלם"}, {"en": "All magic in the item disappears", "he": "כל הקסם בחפץ נעלם"}, {"en": "The item is destroyed", "he": "החפץ נהרס"}, {"en": "The Game Master decides manually", "he": "המנחה מחליט ידנית", "aliases": ["ה־DM מחליט ידנית"]}, {"en": "Current Quantity", "he": "כמות נוכחית"}, {"en": "Effect", "he": "השפעה"}, {"en": "Currently Available", "he": "זמין כרגע"}, {"en": "Not defined", "he": "לא הוגדר"}, {"en": "No details provided", "he": "ללא פירוט"}, {"en": "No description provided.", "he": "לא הוזן תיאור."}, {"en": "No summary provided.", "he": "לא הוזן תקציר."}, {"en": "Shown", "he": "מוצג"}, {"en": "Hidden", "he": "מוסתר"}, {"en": "Automatic", "he": "אוטומטי"}, {"en": "Additional Hit Die", "he": "קוביית פגיעה נוספת"}, {"en": "According to the level table", "he": "לפי טבלת הרמות"}, {"en": "Confirm End Combat", "he": "אישור סיום הקרב"}, {"en": "Confirm Use and Healing", "he": "אישור שימוש וריפוי"}, {"en": "Enter a result.", "he": "הזן תוצאה."}, {"en": "Open More menu", "he": "פתח תפריט נוסף", "aliases": ["פתח תפריט נוסף"]}, {"en": "Damage or healing amount", "he": "כמות נזק או ריפוי", "aliases": ["כמות נזק או ריפוי"]}, {"en": "Search inventory...", "he": "חיפוש במלאי..."}, {"en": "Search Feat or Feature...", "he": "חיפוש כישרון או יכולת...", "aliases": ["Search feat or feature..."]}, {"en": "Choose a theme", "he": "בחירת ערכת נושא"}, {"en": "Choose a language", "he": "בחירת שפה"}, {"en": "Main navigation", "he": "ניווט ראשי"}, {"en": "Battle Master / Echo Knight / Homebrew", "he": "אמן הקרב / אביר הד / תוכן ביתי"}, {"en": "Optional", "he": "אופציונלי", "aliases": ["אופציונלי"]}, {"en": "For example: 11, 17", "he": "למשל 11, 17", "aliases": ["למשל 11, 17"]}, {"en": "May be left empty", "he": "אפשר להשאיר ריק", "aliases": ["אפשר להשאיר ריק"]}, {"en": "5 ft. / 20/60 ft.", "he": "5 רגל / 20/60 רגל"}, {"en": "Heavy, Finesse, Reach", "he": "כבד, עדין, הישג"}, {"en": "Poison Damage / Healing", "he": "נזק רעל / ריפוי"}, {"en": "What happens on use?", "he": "מה קורה בעת השימוש?"}, {"en": "Blank = unlimited", "he": "ריק = ללא הגבלה"}, {"en": "Custom", "he": "מותאם אישית"}, {"en": "ft.", "he": "רגל"}, {"en": "lb", "he": "lb"}];
const TERM_TRANSLATIONS={"Human": {"en": "Human", "he": "בן־אנוש"}, "Dragonborn": {"en": "Dragonborn", "he": "דרקוניד"}, "Elf": {"en": "Elf", "he": "אלף"}, "Fighter": {"en": "Fighter", "he": "לוחם"}, "Cleric": {"en": "Cleric", "he": "כוהן"}, "Wizard": {"en": "Wizard", "he": "אשף"}, "Rogue": {"en": "Rogue", "he": "נוכל"}, "Battle Master": {"en": "Battle Master", "he": "אמן הקרב"}, "Strength": {"en": "Strength", "he": "כוח"}, "Dexterity": {"en": "Dexterity", "he": "זריזות"}, "Constitution": {"en": "Constitution", "he": "חוסן"}, "Intelligence": {"en": "Intelligence", "he": "תבונה"}, "Wisdom": {"en": "Wisdom", "he": "חוכמה"}, "Charisma": {"en": "Charisma", "he": "כריזמה"}, "Acrobatics": {"en": "Acrobatics", "he": "אקרובטיקה"}, "Animal Handling": {"en": "Animal Handling", "he": "טיפול בבעלי חיים"}, "Arcana": {"en": "Arcana", "he": "מאגיה"}, "Athletics": {"en": "Athletics", "he": "אתלטיקה"}, "Deception": {"en": "Deception", "he": "הונאה"}, "History": {"en": "History", "he": "היסטוריה"}, "Insight": {"en": "Insight", "he": "תובנה"}, "Intimidation": {"en": "Intimidation", "he": "איום"}, "Investigation": {"en": "Investigation", "he": "חקירה"}, "Medicine": {"en": "Medicine", "he": "רפואה"}, "Nature": {"en": "Nature", "he": "טבע"}, "Perception": {"en": "Perception", "he": "תפיסה"}, "Performance": {"en": "Performance", "he": "הופעה"}, "Persuasion": {"en": "Persuasion", "he": "שכנוע"}, "Religion": {"en": "Religion", "he": "דת"}, "Sleight of Hand": {"en": "Sleight of Hand", "he": "זריזות ידיים"}, "Stealth": {"en": "Stealth", "he": "התגנבות"}, "Survival": {"en": "Survival", "he": "הישרדות"}, "Feat": {"en": "Feat", "he": "Feat"}, "Class Feature": {"en": "Class Feature", "he": "יכולת מקצוע"}, "Subclass Feature": {"en": "Subclass Feature", "he": "יכולת תת־מקצוע"}, "Racial Trait": {"en": "Racial Trait", "he": "תכונת גזע"}, "Homebrew": {"en": "Homebrew", "he": "תוכן ביתי"}, "Other": {"en": "Other", "he": "אחר"}, "Class": {"en": "Class", "he": "מקצוע"}, "Subclass": {"en": "Subclass", "he": "תת־מקצוע"}, "Race": {"en": "Race", "he": "גזע"}, "Action": {"en": "Action", "he": "פעולה"}, "Bonus Action": {"en": "Bonus Action", "he": "פעולת בונוס"}, "Reaction": {"en": "Reaction", "he": "תגובה"}, "Passive": {"en": "Passive", "he": "סביל"}, "Special": {"en": "Special", "he": "מיוחד"}, "Free": {"en": "Free", "he": "חופשי"}, "On Hit": {"en": "On Hit", "he": "בעת פגיעה"}, "Short Rest": {"en": "Short Rest", "he": "מנוחה קצרה"}, "Long Rest": {"en": "Long Rest", "he": "מנוחה ארוכה"}, "Short or Long Rest": {"en": "Short or Long Rest", "he": "מנוחה קצרה או ארוכה"}, "Manual": {"en": "Manual", "he": "ידני"}, "None": {"en": "None", "he": "ללא"}, "All": {"en": "All", "he": "הכול"}, "Fixed": {"en": "Fixed", "he": "קבוע"}, "Dice": {"en": "Dice", "he": "קוביות"}, "Dawn": {"en": "Dawn", "he": "שחר"}, "Melee": {"en": "Melee", "he": "קפא״פ"}, "Ranged": {"en": "Ranged", "he": "טווח"}, "Melee or Ranged": {"en": "Melee or Ranged", "he": "קפא״פ או טווח"}, "Slashing": {"en": "Slashing", "he": "חותך"}, "Piercing": {"en": "Piercing", "he": "דוקר"}, "Bludgeoning": {"en": "Bludgeoning", "he": "מוחץ"}, "Fire": {"en": "Fire", "he": "אש"}, "Cold": {"en": "Cold", "he": "קור"}, "Lightning": {"en": "Lightning", "he": "ברק"}, "Thunder": {"en": "Thunder", "he": "רעם"}, "Acid": {"en": "Acid", "he": "חומצה"}, "Poison": {"en": "Poison", "he": "רעל"}, "Necrotic": {"en": "Necrotic", "he": "נקרוטי"}, "Radiant": {"en": "Radiant", "he": "קורן"}, "Force": {"en": "Force", "he": "כוח מאגי"}, "Psychic": {"en": "Psychic", "he": "תודעתי"}, "Radiant Damage": {"en": "Radiant Damage", "he": "נזק קורן"}, "Poison Damage": {"en": "Poison Damage", "he": "נזק רעל"}, "Healing": {"en": "Healing", "he": "ריפוי"}, "Utility": {"en": "Utility", "he": "שימושי"}, "Heavy": {"en": "Heavy", "he": "כבד"}, "Two-Handed": {"en": "Two-Handed", "he": "דו־ידני"}, "Light": {"en": "Light", "he": "קל"}, "Thrown": {"en": "Thrown", "he": "מוטל"}, "Finesse": {"en": "Finesse", "he": "עדין"}, "Reach": {"en": "Reach", "he": "הישג"}, "Versatile (1d10)": {"en": "Versatile (1d10)", "he": "רב־שימושי (1d10)"}, "Weapon": {"en": "Weapon", "he": "נשק"}, "Armor": {"en": "Armor", "he": "שריון"}, "Shield": {"en": "Shield", "he": "מגן"}, "Consumable": {"en": "Consumable", "he": "מתכלה"}, "Tool / Kit": {"en": "Tool / Kit", "he": "כלי / ערכה"}, "General Item": {"en": "General Item", "he": "חפץ כללי"}, "Active": {"en": "Active", "he": "פעיל"}, "Destroyed": {"en": "Destroyed", "he": "הרוס"}, "System": {"en": "System", "he": "מערכת"}, "Spell": {"en": "Spell", "he": "לחש"}, "Medium": {"en": "Medium", "he": "בינוני"}, "Movement": {"en": "Movement", "he": "תנועה"}, "Opportunity Attack": {"en": "Opportunity Attack", "he": "התקפת הזדמנות"}, "Advantage": {"en": "Advantage", "he": "יתרון"}, "Disadvantage": {"en": "Disadvantage", "he": "חיסרון"}, "Lost": {"en": "Lost", "he": "אבוד"}, "Game Master": {"en": "Game Master", "he": "מנחה"}, "Custom": {"en": "Custom", "he": "מותאם אישית"}, "Magic": {"en": "Magic", "he": "קסם"}, "ft.": {"en": "ft.", "he": "רגל"}, "lb": {"en": "lb", "he": "lb"}};
const BUILTIN_ENTITY_TRANSLATIONS={"resource_action_surge": {"en": {"name": "Action Surge", "desc": "Gain one additional Action on your turn.", "sourceName": "Fighter"}, "he": {"name": "פרץ פעולה", "desc": "מאפשר לבצע פעולה נוספת בתורך.", "sourceName": "לוחם"}}, "resource_second_wind": {"en": {"name": "Second Wind", "desc": "Restore 1d10 + Fighter level hit points. Roll physically and enter the result.", "sourceName": "Fighter"}, "he": {"name": "רוח שנייה", "desc": "מחזיר 1d10 + רמת הלוחם נקודות פגיעה. גלגל ידנית והזן את התוצאה.", "sourceName": "לוחם"}}, "resource_indomitable": {"en": {"name": "Indomitable", "desc": "Reroll a failed Saving Throw.", "sourceName": "Fighter"}, "he": {"name": "בלתי־נכנע", "desc": "מאפשר לגלגל מחדש גלגול הצלה שנכשל.", "sourceName": "לוחם"}}, "resource_hit_dice": {"en": {"name": "Hit Dice", "desc": "Spend Hit Dice during a Short Rest.", "sourceName": "Fighter"}, "he": {"name": "קוביות פגיעה", "desc": "אפשר לבזבז קוביות פגיעה במהלך מנוחה קצרה.", "sourceName": "לוחם"}}, "item_healing_potion": {"en": {"name": "Healing Potion", "desc": "Restores hit points.", "effect": "Restores hit points."}, "he": {"name": "שיקוי ריפוי", "desc": "מחזיר נקודות פגיעה.", "effect": "מחזיר נקודות פגיעה."}}, "item_longsword_1": {"en": {"name": "Longsword +1", "desc": "A magical versatile longsword."}, "he": {"name": "חרב ארוכה +1", "desc": "חרב ארוכה קסומה ורב־שימושית."}}, "power_longsword_plus1": {"en": {"name": "+1 Enchantment", "description": "The weapon grants +1 to attack rolls and damage rolls."}, "he": {"name": "הקסמה +1", "description": "הנשק מעניק +1 לגלגולי פגיעה ולגלגולי נזק."}}, "power_radiant_slash": {"en": {"name": "Radiant Slash", "description": "After a hit, add 1d6 Radiant Damage."}, "he": {"name": "שיסוף קורן", "description": "לאחר פגיעה, הוסף 1d6 נזק קורן."}}, "item_greatsword": {"en": {"name": "Greatsword", "desc": "Heavy two-handed sword."}, "he": {"name": "חרב דו־ידנית", "desc": "חרב כבדה לשימוש בשתי ידיים."}}, "item_handaxe": {"en": {"name": "Handaxe", "desc": "Light thrown weapon."}, "he": {"name": "גרזן יד", "desc": "נשק קל שניתן להטלה."}}, "item_shield": {"en": {"name": "Shield", "desc": "+2 AC while equipped."}, "he": {"name": "מגן", "desc": "+2 לדרג השריון כאשר הוא מצויד."}}, "item_rations": {"en": {"name": "Rations", "desc": "One day of food.", "effect": "One day of food."}, "he": {"name": "מנות מזון", "desc": "מזון ליום אחד.", "effect": "מזון ליום אחד."}}, "item_greater_healing": {"en": {"name": "Greater Healing Potion", "desc": "Stronger healing potion.", "effect": "Restores hit points."}, "he": {"name": "שיקוי ריפוי משופר", "desc": "שיקוי ריפוי חזק יותר.", "effect": "מחזיר נקודות פגיעה."}}, "item_heroism": {"en": {"name": "Potion of Heroism", "desc": "Temporary heroic effect.", "effect": "Grants a heroic magical effect; use the campaign description."}, "he": {"name": "שיקוי גבורה", "desc": "השפעת גבורה זמנית.", "effect": "מעניק השפעה קסומה של גבורה; השתמש בתיאור שנקבע בקמפיין."}}, "item_antitoxin": {"en": {"name": "Antitoxin", "desc": "Helps against poison.", "effect": "Advantage on relevant poison saves for the listed duration."}, "he": {"name": "נוגדן", "desc": "מסייע נגד רעל.", "effect": "מעניק יתרון בגלגולי הצלה מתאימים נגד רעל למשך הזמן המצוין."}}, "trait_fighting_style_gwf": {"en": {"name": "Fighting Style: Great Weapon Fighting", "shortDesc": "Improves certain damage rolls with eligible melee weapons.", "description": "Allows eligible low damage dice to be rerolled according to the campaign's version of Great Weapon Fighting.", "trigger": "When rolling damage with an eligible melee weapon.", "sourceName": "Fighter"}, "he": {"name": "סגנון לחימה: לחימה בנשק כבד", "shortDesc": "משפר גלגולי נזק מסוימים עם נשקי קפא״פ מתאימים.", "description": "מאפשר לגלגל מחדש קוביות נזק נמוכות שמתאימות לתנאי היכולת, בהתאם לגרסה שבה משתמש הקמפיין.", "trigger": "כאשר מגלגלים נזק עם נשק קפא״פ שעומד בתנאי היכולת.", "sourceName": "לוחם"}}, "trait_second_wind": {"en": {"name": "Second Wind", "shortDesc": "Limited-use self-healing.", "description": "Recover hit points according to the Fighter feature and the rules version used by the campaign.", "trigger": "As a Bonus Action on your turn.", "sourceName": "Fighter"}, "he": {"name": "רוח שנייה", "shortDesc": "ריפוי עצמי בעל מספר שימושים מוגבל.", "description": "השב נקודות פגיעה בהתאם ליכולת של הלוחם ולגרסת החוקים שבה משתמש הקמפיין.", "trigger": "כפעולת בונוס בתורך.", "sourceName": "לוחם"}}, "trait_action_surge": {"en": {"name": "Action Surge", "shortDesc": "Gain an additional Action on your turn.", "description": "Take an additional Action on your turn. The linked Resource tracks the available uses.", "trigger": "On your turn, when you choose to activate the feature.", "sourceName": "Fighter"}, "he": {"name": "פרץ פעולה", "shortDesc": "מקבל פעולה נוספת בתור.", "description": "בצע פעולה נוספת בתורך. המשאב המקושר עוקב אחר מספר השימושים הזמין.", "trigger": "בתורך, כאשר אתה בוחר להפעיל את היכולת.", "sourceName": "לוחם"}}, "trait_extra_attack": {"en": {"name": "Extra Attack", "shortDesc": "Make more than one attack when taking the Attack Action.", "description": "The number of attacks is determined by the character's class level and campaign rules.", "trigger": "When taking the Attack Action.", "sourceName": "Fighter"}, "he": {"name": "התקפה נוספת", "shortDesc": "מבצע יותר מהתקפה אחת כאשר משתמשים בפעולת התקפה.", "description": "מספר ההתקפות נקבע לפי רמת המקצוע הנוכחית וחוקי הקמפיין.", "trigger": "כאשר מבצעים את פעולת ההתקפה.", "sourceName": "לוחם"}}, "trait_indomitable": {"en": {"name": "Indomitable", "shortDesc": "Reroll a failed Saving Throw.", "description": "Reroll a failed Saving Throw. The linked Resource tracks the available uses.", "trigger": "After failing a Saving Throw.", "sourceName": "Fighter"}, "he": {"name": "בלתי־נכנע", "shortDesc": "מאפשר לגלגל מחדש גלגול הצלה שנכשל.", "description": "גלגל מחדש גלגול הצלה שנכשל. המשאב המקושר עוקב אחר מספר השימושים הזמין.", "trigger": "לאחר כישלון בגלגול הצלה.", "sourceName": "לוחם"}}, "trait_human_determination": {"en": {"name": "Human Determination", "shortDesc": "A racial or Homebrew feature defined by the campaign.", "description": "Use the exact racial or campaign description supplied by the Game Master.", "trigger": "As defined by the campaign.", "sourceName": "Human"}, "he": {"name": "נחישות אנושית", "shortDesc": "יכולת גזע או תוכן ביתי בהתאם לקמפיין.", "description": "השתמש בתיאור המדויק של הגזע או הקמפיין שסיפק המנחה.", "trigger": "לפי ההגדרה בקמפיין.", "sourceName": "בן־אנוש"}}, "trait_gwm": {"en": {"name": "Great Weapon Master", "shortDesc": "A combat feat for heavy weapons.", "description": "A heavy-weapon combat feat. Its exact effects differ between rules versions, so use the wording selected by the campaign.", "trigger": "When the conditions of the campaign's version of the feat are met.", "sourceName": "Great Weapon Master"}, "he": {"name": "אמן הנשק הכבד", "shortDesc": "כישרון קרבי לנשקים כבדים.", "description": "כישרון קרבי לנשקים כבדים. ההשפעות המדויקות משתנות בין גרסאות החוקים, ולכן יש להשתמש בנוסח שנבחר בקמפיין.", "trigger": "כאשר מתקיימים התנאים של גרסת הכישרון שבה משתמש הקמפיין.", "sourceName": "אמן הנשק הכבד"}}, "trait_sentinel": {"en": {"name": "Sentinel", "shortDesc": "Controls enemy movement and improves Opportunity Attacks.", "description": "In the 2014-style version: a hit with an Opportunity Attack can reduce the target's speed to 0; Disengage does not necessarily prevent your Opportunity Attack; and you may use a Reaction to attack a nearby creature that attacks someone other than you. Confirm the exact campaign version.", "trigger": "When a creature within 5 ft. attacks another target, or when a valid Opportunity Attack condition is met.", "sourceName": "Sentinel"}, "he": {"name": "זקיף", "shortDesc": "שולט בתנועת אויבים ומשפר התקפות הזדמנות.", "description": "בגרסה בסגנון 2014: פגיעה בהתקפת הזדמנות יכולה להפחית את מהירות המטרה ל־0; פעולת התנתקות אינה בהכרח מונעת את התקפת ההזדמנות שלך; ובאפשרותך להשתמש בתגובה כדי לתקוף יצור סמוך שתוקף מטרה שאינה אתה. יש לאשר את הגרסה המדויקת של הקמפיין.", "trigger": "כאשר יצור בטווח 5 רגל ממך תוקף מטרה אחרת, או כאשר מתקיים תנאי מתאים להתקפת הזדמנות.", "sourceName": "זקיף"}}};

Object.values(TERM_TRANSLATIONS).forEach(pair=>{
  if(!UI_PHRASE_PAIRS.some(existing=>existing.en===pair.en)){
    UI_PHRASE_PAIRS.push({en:pair.en,he:pair.he});
  }
});
const uiPhraseIndex=new Map();
UI_PHRASE_PAIRS.forEach((pair,index)=>{
  uiPhraseIndex.set(normalizeUiPhrase(pair.en),index);
  uiPhraseIndex.set(normalizeUiPhrase(pair.he),index);
  (pair.aliases||[]).forEach(alias=>uiPhraseIndex.set(normalizeUiPhrase(alias),index));
});
const localizedTextNodes=new WeakMap();
const localizedAttributes=new WeakMap();
let localizationObserver=null;
let localizationBusy=false;

function normalizeUiPhrase(value){
  return String(value??"").replace(/\s+/g," ").trim();
}
function isHebrewLanguage(){return false;}
function term(value){
  const pair=TERM_TRANSLATIONS[String(value??"")];
  return pair?.[appLanguage]??String(value??"");
}
function phrase(value){
  const normalized=normalizeUiPhrase(value);
  const index=uiPhraseIndex.get(normalized);
  return index===undefined?String(value??""):UI_PHRASE_PAIRS[index][appLanguage];
}
function tText(en,he){
  return appLanguage==="he"?he:en;
}
function formatLevel(level){
  return appLanguage==="he"?`רמה ${level}`:`Level ${level}`;
}
function formatFeet(value){
  const raw=String(value??"");
  if(appLanguage==="en")return raw;
  return raw.replace(/\bft\.?\b/gi,"רגל");
}
function formatUses(current,max){
  return appLanguage==="he"?`${current}/${max} שימושים`:`${current}/${max} Charges`;
}
function formatCost(value){
  return appLanguage==="he"?`עלות ${value}`:`Cost ${value}`;
}
function runtimePhrase(value){
  const raw=String(value??"");
  const exact=phrase(raw);
  if(exact!==raw)return exact;
  if(appLanguage==="en"){
    let match;
    if((match=raw.match(/^(.+) הופעל$/)))return `${match[1]} activated`;
    if((match=raw.match(/^(.+): נשארו (\d+)\/(\d+)$/)))return `${match[1]}: ${match[2]}/${match[3]} remaining`;
    if((match=raw.match(/^עלית לרמה (\d+)$/)))return `Advanced to level ${match[1]}`;
    if((match=raw.match(/^למחוק את (.+)\?$/)))return `Delete ${match[1]}?`;
    if((match=raw.match(/^הזן תוצאה בין (\d+) ל־(\d+)$/)))return `Enter a result between ${match[1]} and ${match[2]}`;
  }else{
    let match;
    if((match=raw.match(/^(.+) activated$/)))return `${match[1]} הופעל`;
    if((match=raw.match(/^(.+): (\d+)\/(\d+) remaining$/)))return `${match[1]}: נשארו ${match[2]}/${match[3]}`;
    if((match=raw.match(/^Advanced to level (\d+)$/)))return `עלית לרמה ${match[1]}`;
    if((match=raw.match(/^Delete (.+)\?$/)))return `למחוק את ${match[1]}?`;
    if((match=raw.match(/^Enter a result between (\d+) and (\d+)$/)))return `הזן תוצאה בין ${match[1]} ל־${match[2]}`;
  }
  return raw;
}
function translateTextNode(node){
  if(!node?.nodeValue||node.parentElement?.closest("[data-localized-content],script,style"))return;
  const value=node.nodeValue;
  const normalized=normalizeUiPhrase(value);
  if(!normalized)return;
  let pairIndex=localizedTextNodes.get(node);
  if(pairIndex===undefined){
    pairIndex=uiPhraseIndex.get(normalized);
    if(pairIndex!==undefined)localizedTextNodes.set(node,pairIndex);
  }
  const translated=pairIndex!==undefined
    ?UI_PHRASE_PAIRS[pairIndex][appLanguage]
    :runtimePhrase(normalized);
  if(translated===normalized)return;
  const leading=value.match(/^\s*/)?.[0]||"";
  const trailing=value.match(/\s*$/)?.[0]||"";
  node.nodeValue=leading+translated+trailing;
}
function translateElementAttributes(element){
  if(!(element instanceof Element)||element.closest("[data-localized-content]"))return;
  const attributes=["placeholder","aria-label","title"];
  let remembered=localizedAttributes.get(element);
  if(!remembered){remembered={};localizedAttributes.set(element,remembered);}
  attributes.forEach(attribute=>{
    if(!element.hasAttribute(attribute))return;
    const current=element.getAttribute(attribute)||"";
    const normalized=normalizeUiPhrase(current);
    let pairIndex=remembered[attribute];
    if(pairIndex===undefined){
      pairIndex=uiPhraseIndex.get(normalized);
      if(pairIndex!==undefined)remembered[attribute]=pairIndex;
    }
    const translated=pairIndex!==undefined?UI_PHRASE_PAIRS[pairIndex][appLanguage]:runtimePhrase(normalized);
    if(translated!==normalized)element.setAttribute(attribute,translated);
  });
}
function localizeDocument(root=document.body){
  if(!root||localizationBusy)return;
  localizationBusy=true;
  try{
    if(root.nodeType===Node.TEXT_NODE)translateTextNode(root);
    if(root.nodeType===Node.ELEMENT_NODE)translateElementAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let textNode;
    while((textNode=walker.nextNode()))translateTextNode(textNode);
    const elements=root.querySelectorAll?.("*")||[];
    elements.forEach(translateElementAttributes);
  }finally{localizationBusy=false;}
}
function startLocalizationObserver(){
  if(localizationObserver||!document.body)return;
  localizationObserver=new MutationObserver(records=>{
    if(localizationBusy)return;
    records.forEach(record=>{
      if(record.type==="characterData")translateTextNode(record.target);
      record.addedNodes?.forEach(node=>localizeDocument(node));
      if(record.type==="attributes")translateElementAttributes(record.target);
    });
  });
  localizationObserver.observe(document.body,{
    subtree:true,childList:true,characterData:true,attributes:true,
    attributeFilter:["placeholder","aria-label","title"]
  });
}
function updateLanguageControls(){
  document.querySelectorAll("[data-language-choice]").forEach(button=>{
    const selected=button.dataset.languageChoice===appLanguage;
    button.classList.toggle("active",selected);
    button.setAttribute("aria-checked",String(selected));
  });
  const badge=document.getElementById("languageResolvedBadge");
  const status=document.getElementById("languageStatus");
  if(badge)badge.textContent=appLanguage==="he"?"עברית":"English";
  if(status)status.textContent=appLanguage==="he"
    ?"כל הממשק מוצג בעברית ובכיוון RTL."
    :"The entire interface is displayed in English and LTR.";
}
function applyLanguage(language=appLanguage,{persist=true,rerender=true}={}){
  appLanguage="en";
  const root=document.documentElement;
  root.lang=appLanguage;
  root.dir="ltr";
  root.dataset.language=appLanguage;
  document.title=appLanguage==="he"
    ?"Character Hub — ניהול דמות"
    :"Character Hub — Character Manager";
  if(persist){
    try{localStorage.setItem(LANGUAGE_STORAGE_KEY,appLanguage)}catch(error){}
  }
  updateLanguageControls();
  if(typeof applyLocalizedStateView==="function")applyLocalizedStateView();
  if(rerender&&typeof render==="function")render();
  localizeDocument(document.body);
  requestAnimationFrame(()=>{
    if(typeof syncAbilityTransformCarousel==="function")syncAbilityTransformCarousel();
  });
  return appLanguage;
}
function chooseLanguage(language){
  applyLanguage(language);
  toast(appLanguage==="he"?"השפה הוחלפה לעברית":"Language changed to English");
}
function detectLegacyLanguage(value){
  const text=String(value??"")
    .replace(/\b\d*d\d+\b/gi,"")
    .replace(/\b(?:STR|DEX|CON|INT|WIS|CHA|HP|AC|DC|DM)\b/g,"")
    .replace(/\b(?:ft|lb)\.?\b/gi,"");
  const hasHebrew=/[\u0590-\u05FF]/.test(text);
  const hasLatin=/[A-Za-z]/.test(text);
  if(hasHebrew&&!hasLatin)return "he";
  if(hasLatin&&!hasHebrew)return "en";
  if(!hasHebrew&&!hasLatin)return "neutral";
  return "mixed";
}
const MISSING_LOCALIZED_VALUES=new Set([
  "לא הוזן שם בעברית",
  "לא הוזן תיאור בעברית",
  "לא הוזן תקציר בעברית",
  "לא הוזן שם באנגלית",
  "לא הוזן תיאור באנגלית",
  "English name not provided",
  "English description not provided",
  "English summary not provided",
  "No Hebrew name provided",
  "No Hebrew description provided",
  "לא הוזן תקציר.",
  "לא הוזן תיאור.",
  "No summary provided.",
  "No description provided."
].map(value=>value.toLowerCase()));

const BUILTIN_ENTITY_PREFIX={
  resource:"resource_",
  item:"item_",
  power:"power_",
  trait:"trait_"
};

const BUILTIN_RESOURCE_BY_SYSTEM_KEY={
  actionSurge:"resource_action_surge",
  secondWind:"resource_second_wind",
  indomitable:"resource_indomitable",
  hitDice:"resource_hit_dice"
};

const BUILTIN_TRAIT_BY_RESOURCE_ID={
  resource_action_surge:"trait_action_surge",
  resource_second_wind:"trait_second_wind",
  resource_indomitable:"trait_indomitable"
};

function cleanLocalizedCandidate(value){
  const text=String(value??"").trim();
  return text&&!MISSING_LOCALIZED_VALUES.has(text.toLowerCase())?text:"";
}

function normalizedBuiltinName(value){
  return cleanLocalizedCandidate(value)
    .toLowerCase()
    .replace(/[’‘]/g,"'")
    .replace(/\s+/g," ")
    .trim();
}

function builtinTraitCompatible(key,raw={}){
  const category=String(raw.category||"").toLowerCase();
  const sourceType=String(raw.sourceType||"").toLowerCase();

  if(["trait_sentinel","trait_gwm"].includes(key)){
    return category==="feat"||sourceType==="feat";
  }
  if(key==="trait_human_determination"){
    return category==="racial trait"||sourceType==="race";
  }
  return category==="class feature"||category==="subclass feature"||
    sourceType==="class"||sourceType==="subclass"||!category;
}

function builtinTranslationFor(raw={},id="",entityKind=""){
  if(BUILTIN_ENTITY_TRANSLATIONS[id]){
    return BUILTIN_ENTITY_TRANSLATIONS[id];
  }

  if(entityKind==="resource"){
    const systemId=BUILTIN_RESOURCE_BY_SYSTEM_KEY[raw.systemKey];
    if(systemId&&BUILTIN_ENTITY_TRANSLATIONS[systemId]){
      return BUILTIN_ENTITY_TRANSLATIONS[systemId];
    }
  }

  if(entityKind==="trait"){
    const linkedId=BUILTIN_TRAIT_BY_RESOURCE_ID[raw.resourceId];
    if(linkedId&&BUILTIN_ENTITY_TRANSLATIONS[linkedId]){
      return BUILTIN_ENTITY_TRANSLATIONS[linkedId];
    }
  }

  const prefix=BUILTIN_ENTITY_PREFIX[entityKind]||"";
  const candidates=[
    raw.localized?.en?.name,
    raw.i18n?.en?.name,
    raw.localized?.he?.name,
    raw.i18n?.he?.name,
    raw.localized?.legacy?.name,
    raw.i18n?.legacy?.name,
    raw.name,
    raw.title
  ].map(normalizedBuiltinName).filter(Boolean);

  if(!candidates.length)return {};

  for(const [key,translation] of Object.entries(BUILTIN_ENTITY_TRANSLATIONS)){
    if(prefix&&!key.startsWith(prefix))continue;
    if(entityKind==="trait"&&!builtinTraitCompatible(key,raw))continue;

    const knownNames=[
      translation?.en?.name,
      translation?.he?.name
    ].map(normalizedBuiltinName).filter(Boolean);

    if(knownNames.some(name=>candidates.includes(name))){
      return translation;
    }
  }

  return {};
}

function normalizeLocalizedFields(raw,fields,builtin={}){
  const localized={
    he:{},
    en:{},
    legacy:{...(raw.localized?.legacy||raw.i18n?.legacy||{})}
  };

  ["he","en"].forEach(language=>{
    fields.forEach(field=>{
      const existing=cleanLocalizedCandidate(
        raw.localized?.[language]?.[field]??
        raw.i18n?.[language]?.[field]
      );
      const built=cleanLocalizedCandidate(builtin?.[language]?.[field]);
      localized[language][field]=existing||built||"";
    });
  });

  fields.forEach(field=>{
    if(localized.he[field]||localized.en[field])return;

    const legacy=cleanLocalizedCandidate(raw[field]);
    const detected=detectLegacyLanguage(legacy);

    if(detected==="he"){
      localized.he[field]=legacy;
    }else if(detected==="en"){
      localized.en[field]=legacy;
    }else if(detected==="neutral"){
      localized.he[field]=legacy;
      localized.en[field]=legacy;
    }else if(legacy){
      localized.legacy[field]=legacy;
    }
  });

  return localized;
}
function localizedContentName(entity,field="name"){
  const hebrew=cleanLocalizedCandidate(entity?.localized?.he?.[field]);
  const english=cleanLocalizedCandidate(entity?.localized?.en?.[field]);

  if(appLanguage==="en"){
    return english||hebrew||"Unnamed";
  }

  if(field==="name"){
    if(entity?.useHebrewName&&hebrew)return hebrew;
    return english||hebrew||"ללא שם";
  }

  return hebrew||english||"";
}

function localizedValue(entity,field,kind="text"){
  if(kind==="name"||kind==="contentName"){
    return localizedContentName(entity,field);
  }

  const value=cleanLocalizedCandidate(entity?.localized?.[appLanguage]?.[field]);
  if(value)return value;

  if(kind==="description"){
    return appLanguage==="he"
      ?"לא הוזן תיאור בעברית"
      :"English description not provided";
  }

  return "";
}
function localizedHtml(entity,field,kind="description"){
  return `<span data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(localizedValue(entity,field,kind))}</span>`;
}
function applyLocalizedStateView(){
  if(typeof state==="undefined"||!state)return;
  (state.resources||[]).forEach(resource=>{
    resource.name=localizedValue(resource,"name","name");
    resource.desc=localizedValue(resource,"desc","description");
    resource.sourceName=localizedValue(resource,"sourceName","contentName");
  });
  (state.inventory||[]).forEach(item=>{
    item.name=localizedValue(item,"name","name");
    item.desc=localizedValue(item,"desc","description");
    if(item.consumable)item.consumable.effect=localizedValue(item,"effect","description");
    (item.magicalProperties||[]).forEach(power=>{
      power.name=localizedValue(power,"name","name");
      power.description=localizedValue(power,"description","description");
    });
  });
  (state.traits||[]).forEach(trait=>{
    trait.name=localizedValue(trait,"name","name");
    trait.shortDesc=localizedValue(trait,"shortDesc","description");
    trait.description=localizedValue(trait,"description","description");
    trait.trigger=localizedValue(trait,"trigger","description");
    trait.sourceName=localizedValue(trait,"sourceName","contentName");
  });
}
function canonicalLocalizedValue(localized,field,fallback=""){
  return String(localized?.en?.[field]||localized?.he?.[field]||fallback);
}
function displayLanguageOfText(value){
  const stripped=String(value??"")
    .replace(/\b\d*d\d+\b/gi,"")
    .replace(/\b(?:STR|DEX|CON|INT|WIS|CHA|HP|AC|DM)\b/g,"")
    .replace(/[+\-]?\d+(?:\/\d+)?/g,"");
  return detectLegacyLanguage(stripped);
}
function localizedHpLastChange(){
  const raw=String(state?.hpLastChange||"").trim();
  if(!raw)return appLanguage==="he"
    ?"לא נרשם שינוי בנק״פ עדיין."
    :"No HP change has been recorded yet.";
  const language=displayLanguageOfText(raw);
  if(language==="neutral"||language===appLanguage)return runtimePhrase(raw);
  return appLanguage==="he"
    ?"השינוי האחרון נרשם לפני החלפת השפה."
    :"The last change was recorded before the language was switched.";
}

const defaultState = {
  name:"Kael Thorn", race:"Human", className:"Fighter", subclass:"Battle Master", level:7,
  hpCurrent:62, hpMax:62, tempHp:8, ac:18, initiative:3, speed:30, proficiency:3,
  abilities:{STR:[16,3],DEX:[12,1],CON:[18,4],INT:[10,0],WIS:[14,2],CHA:[8,-1]},
  resources:[
    {
      id:"resource_action_surge",systemKey:"actionSurge",name:"Action Surge",current:1,max:1,useCost:1,
      recharge:"Short Rest",rechargeMode:"All",rechargeValue:1,action:"Free",showInCombat:true,
      desc:"מאפשר לבצע Action נוסף בתור שלך.",
      sourceType:"Class",sourceName:"Fighter",unlockLevel:2,upgradeLevels:"17"
    },
    {
      id:"resource_second_wind",systemKey:"secondWind",name:"Second Wind",current:1,max:1,useCost:1,
      recharge:"Short Rest",rechargeMode:"All",rechargeValue:1,action:"Bonus Action",showInCombat:true,
      desc:"מחזיר 1d10 + רמת Fighter חיים. גלגל ידנית והזן את התוצאה.",
      sourceType:"Class",sourceName:"Fighter",unlockLevel:1,upgradeLevels:""
    },
    {
      id:"resource_indomitable",systemKey:"indomitable",name:"Indomitable",current:2,max:2,useCost:1,
      recharge:"Long Rest",rechargeMode:"All",rechargeValue:2,action:"Special",showInCombat:true,
      desc:"מאפשר לגלגל מחדש Saving Throw שנכשל.",
      sourceType:"Class",sourceName:"Fighter",unlockLevel:9,upgradeLevels:"13, 17"
    },
    {
      id:"resource_hit_dice",systemKey:"hitDice",name:"Hit Dice",current:5,max:7,useCost:1,
      recharge:"Long Rest",rechargeMode:"Fixed",rechargeValue:3,action:"Short Rest",showInCombat:false,
      desc:"אפשר לבזבז Hit Dice במהלך Short Rest.",
      sourceType:"Class",sourceName:"Fighter",unlockLevel:1,upgradeLevels:""
    }
  ],
  attackAbility:"STR",
  inventory:[
    {
      id:"item_healing_potion",name:"Healing Potion",category:"Consumable",type:"Consumable",qty:3,weight:0.5,
      desc:"Restores hit points.",destroyed:false,isMagical:true,
      consumable:{activation:"Action",effectType:"Healing",formula:"2d4 + 2",effect:"Restores hit points.",consumedOnUse:true},
      magicalProperties:[]
    },
    {
      id:"item_longsword_1",name:"Longsword +1",category:"Weapon",type:"Weapon",qty:1,weight:3,
      desc:"A magical versatile longsword.",destroyed:false,isMagical:true,
      weapon:{mode:"Melee",damageDice:"1d8",damageType:"Slashing",ability:"STR",attackBonus:0,damageBonus:0,range:"5 ft.",properties:["Versatile (1d10)"]},
      magicalProperties:[
        {
          id:"power_longsword_plus1",name:"+1 Enchantment",kind:"Passive",description:"The weapon grants +1 to attack rolls and damage rolls.",
          activation:"Passive",effectFormula:"",effectType:"",attackBonus:1,damageBonus:1,acBonus:0,
          currentUses:0,maxUses:0,useCost:1,recharge:"None",rechargeMode:"All",rechargeValue:0,rechargeFormula:"",
          showInCombat:false,lost:false,
          depletionRisk:{enabled:false,die:"d20",failOn:1,outcome:"property"}
        },
        {
          id:"power_radiant_slash",name:"Radiant Slash",kind:"Active",description:"After a hit, add 1d6 Radiant Damage.",
          activation:"On Hit",effectFormula:"1d6",effectType:"Radiant Damage",attackBonus:0,damageBonus:0,acBonus:0,
          currentUses:1,maxUses:1,useCost:1,recharge:"Long Rest",rechargeMode:"All",rechargeValue:1,rechargeFormula:"",
          showInCombat:true,lost:false,
          depletionRisk:{enabled:false,die:"d20",failOn:1,outcome:"property"}
        }
      ]
    },
    {
      id:"item_greatsword",name:"Greatsword",category:"Weapon",type:"Weapon",qty:1,weight:6,
      desc:"Heavy two-handed sword.",destroyed:false,isMagical:false,
      weapon:{mode:"Melee",damageDice:"2d6",damageType:"Slashing",ability:"STR",attackBonus:0,damageBonus:0,range:"5 ft.",properties:["Heavy","Two-Handed"]},
      magicalProperties:[]
    },
    {
      id:"item_handaxe",name:"Handaxe",category:"Weapon",type:"Weapon",qty:1,weight:2,
      desc:"Light thrown weapon.",destroyed:false,isMagical:false,
      weapon:{mode:"Melee or Ranged",damageDice:"1d6",damageType:"Slashing",ability:"STR",attackBonus:0,damageBonus:0,range:"20/60 ft.",properties:["Light","Thrown"]},
      magicalProperties:[]
    },
    {
      id:"item_shield",name:"Shield",category:"Armor",type:"Armor",qty:1,weight:6,
      desc:"+2 AC while equipped.",destroyed:false,isMagical:false,
      armor:{armorType:"Shield",baseAC:0,acBonus:2,addDex:false,maxDex:"",strengthRequirement:0,stealthDisadvantage:false},
      magicalProperties:[]
    },
    {
      id:"item_rations",name:"Rations",category:"Consumable",type:"Consumable",qty:4,weight:2,
      desc:"One day of food.",destroyed:false,isMagical:false,
      consumable:{activation:"Special",effectType:"Utility",formula:"",effect:"One day of food.",consumedOnUse:true},
      magicalProperties:[]
    },
    {
      id:"item_greater_healing",name:"Greater Healing Potion",category:"Consumable",type:"Consumable",qty:1,weight:0.5,
      desc:"Stronger healing potion.",destroyed:false,isMagical:true,
      consumable:{activation:"Action",effectType:"Healing",formula:"4d4 + 4",effect:"Restores hit points.",consumedOnUse:true},
      magicalProperties:[]
    },
    {
      id:"item_heroism",name:"Potion of Heroism",category:"Consumable",type:"Consumable",qty:1,weight:0.5,
      desc:"Temporary heroic effect.",destroyed:false,isMagical:true,
      consumable:{activation:"Action",effectType:"Utility",formula:"",effect:"Grants a heroic magical effect; use the campaign description.",consumedOnUse:true},
      magicalProperties:[]
    },
    {
      id:"item_antitoxin",name:"Antitoxin",category:"Consumable",type:"Consumable",qty:2,weight:0.5,
      desc:"Helps against poison.",destroyed:false,isMagical:false,
      consumable:{activation:"Action",effectType:"Utility",formula:"",effect:"Advantage on relevant poison saves for the listed duration.",consumedOnUse:true},
      magicalProperties:[]
    }
  ],
  traits:[
    {
      id:"trait_fighting_style_gwf",name:"Fighting Style: Great Weapon Fighting",
      category:"Class Feature",activation:"Passive",
      shortDesc:"משפר גלגולי נזק מסוימים עם נשקי קפא״פ מתאימים.",
      description:"Allows eligible low damage dice to be rerolled according to the campaign's version of Great Weapon Fighting.",
      trigger:"כאשר מגלגלים נזק עם נשק קפא״פ שעומד בתנאי היכולת.",
      showInCombat:true,sourceType:"Class",sourceName:"Fighter",unlockLevel:1,resourceId:""
    },
    {
      id:"trait_second_wind",name:"Second Wind",
      category:"Class Feature",activation:"Bonus Action",
      shortDesc:"ריפוי עצמי מוגבל בשימושים.",
      description:"Recover hit points according to the Fighter feature and the rules version used by the campaign.",
      trigger:"Bonus Action בתור שלך.",
      showInCombat:true,sourceType:"Class",sourceName:"Fighter",unlockLevel:1,resourceId:"resource_second_wind"
    },
    {
      id:"trait_action_surge",name:"Action Surge",
      category:"Class Feature",activation:"Special",
      shortDesc:"מקבל Action נוסף בתור.",
      description:"Take an additional Action on your turn. The exact number of uses is tracked by the linked Resource.",
      trigger:"בתור שלך, כאשר אתה בוחר להפעיל את היכולת.",
      showInCombat:true,sourceType:"Class",sourceName:"Fighter",unlockLevel:2,resourceId:"resource_action_surge"
    },
    {
      id:"trait_extra_attack",name:"Extra Attack",
      category:"Class Feature",activation:"Passive",
      shortDesc:"מבצע יותר מהתקפה אחת כאשר משתמשים ב־Attack Action.",
      description:"The number of attacks is determined by the character's current class level and campaign rules.",
      trigger:"כאשר מבצעים את פעולת Attack.",
      showInCombat:true,sourceType:"Class",sourceName:"Fighter",unlockLevel:5,resourceId:""
    },
    {
      id:"trait_indomitable",name:"Indomitable",
      category:"Class Feature",activation:"Special",
      shortDesc:"מאפשר לגלגל מחדש Saving Throw שנכשל.",
      description:"Reroll a failed Saving Throw. The number of available uses is tracked by the linked Resource.",
      trigger:"לאחר כישלון ב־Saving Throw.",
      showInCombat:true,sourceType:"Class",sourceName:"Fighter",unlockLevel:9,resourceId:"resource_indomitable"
    },
    {
      id:"trait_human_determination",name:"Human Determination",
      category:"Racial Trait",activation:"Special",
      shortDesc:"יכולת גזע או Homebrew בהתאם לקמפיין.",
      description:"Use the exact racial or campaign description supplied by the DM.",
      trigger:"לפי ההגדרה בקמפיין.",
      showInCombat:false,sourceType:"Race",sourceName:"Human",unlockLevel:1,resourceId:""
    },
    {
      id:"trait_gwm",name:"Great Weapon Master",
      category:"Feat",activation:"Passive",
      shortDesc:"Feat קרבי לנשקים כבדים.",
      description:"A heavy-weapon combat feat. Its exact effects differ between rules versions, so use the wording selected by the campaign.",
      trigger:"כאשר מתקיימים התנאים של גרסת ה־Feat שבה הקמפיין משתמש.",
      showInCombat:true,sourceType:"Feat",sourceName:"Great Weapon Master",unlockLevel:"",resourceId:""
    },
    {
      id:"trait_sentinel",name:"Sentinel",
      category:"Feat",activation:"Reaction",
      shortDesc:"שולט בתנועת אויבים ומשפר Opportunity Attacks.",
      description:"In the 2014-style version: a hit with an Opportunity Attack can reduce the target's speed to 0; Disengage does not necessarily prevent your Opportunity Attack; and you may use a Reaction to attack a nearby creature that attacks someone other than you. Confirm the exact campaign version.",
      trigger:"כאשר יצור בטווח 5 ft. ממך תוקף מטרה אחרת, או כאשר מתקיים תנאי מתאים ל־Opportunity Attack.",
      showInCombat:true,sourceType:"Feat",sourceName:"Sentinel",unlockLevel:"",resourceId:""
    }
  ],
  coins:{CP:18,SP:42,EP:0,GP:125,PP:2},
  hpLastChange:"לא נרשם שינוי בנק״פ עדיין.",
  deathSaves:{successes:0,failures:0,stabilized:false,dead:false,cause:""},
  skillProficiencies:{
    acrobatics:"none",animalHandling:"none",arcana:"none",athletics:"proficient",
    deception:"none",history:"none",insight:"none",intimidation:"proficient",
    investigation:"none",medicine:"none",nature:"none",perception:"proficient",
    performance:"none",persuasion:"none",religion:"none",sleightOfHand:"none",
    stealth:"none",survival:"proficient"
  },
  skillOverrides:{},
  saveProficiencies:{STR:true,DEX:false,CON:true,INT:false,WIS:false,CHA:false},
  saveOverrides:{},
  hitDieType:"d10",
  extraActionActive:false,
  combatActive:false,
  shortRestSession:null,
  pendingZeroDamage:0,
  selectedAdvancement:"asi",
  schemaVersion:992
};


function makeId(prefix="id"){
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}
function parseLegacyUses(value){
  const match=String(value||"").match(/(\d+)\s*\/\s*(\d+)/);
  return match?{current:Number(match[1]),max:Number(match[2])}:{current:0,max:0};
}
function normalizePower(raw={}){
  const risk=raw.depletionRisk||{};
  const id=raw.id||makeId("power");
  const builtin=builtinTranslationFor(raw,id,"power");
  const localized=normalizeLocalizedFields({...raw,name:raw.name||raw.title||"Magical Property"},["name","description"],builtin);
  return {
    id,
    localized,
    useHebrewName:typeof raw.useHebrewName==="boolean"
      ?raw.useHebrewName
      :!cleanLocalizedCandidate(localized.en.name)&&Boolean(cleanLocalizedCandidate(localized.he.name)),
    name:canonicalLocalizedValue(localized,"name","Magical Property"),
    kind:raw.kind||((raw.maxUses||raw.uses)?"Active":"Passive"),
    description:canonicalLocalizedValue(localized,"description",raw.description||raw.effect||""),
    activation:raw.activation||((raw.maxUses||raw.uses)?"Special":"Passive"),
    effectFormula:raw.effectFormula||"",
    effectType:raw.effectType||"",
    attackBonus:Number(raw.attackBonus)||0,
    damageBonus:Number(raw.damageBonus)||0,
    acBonus:Number(raw.acBonus)||0,
    currentUses:(Number(raw.maxUses)||0)>0?Math.max(0,Math.min(Number(raw.maxUses)||0,Number(raw.currentUses)||0)):Math.max(0,Number(raw.currentUses)||0),
    maxUses:Math.max(0,Number(raw.maxUses)||0),
    useCost:Math.max(1,Number(raw.useCost)||1),
    recharge:raw.recharge||"None",
    rechargeMode:raw.rechargeMode||"All",
    rechargeValue:Math.max(0,Number(raw.rechargeValue)||0),
    rechargeFormula:raw.rechargeFormula||"",
    showInCombat:Boolean(raw.showInCombat),
    lost:Boolean(raw.lost),
    depletionRisk:{
      enabled:Boolean(risk.enabled),
      die:risk.die||"d20",
      failOn:Math.max(1,Number(risk.failOn)||1),
      outcome:risk.outcome||"property"
    }
  };
}
function normalizeInventoryItem(raw={},legacyWeapon=null){
  const category=raw.category || (legacyWeapon?"Weapon":
    raw.type==="Armor"?"Armor":
    raw.type==="Consumable"?"Consumable":
    raw.type==="Tool / Kit"?"Tool / Kit":"General Item");
  const id=raw.id||makeId("item");
  const builtin=builtinTranslationFor(raw,id,"item");
  const localized=normalizeLocalizedFields({...raw,effect:raw.effect??raw.consumable?.effect},["name","desc","effect"],builtin);
  const item={
    id,
    localized,
    useHebrewName:typeof raw.useHebrewName==="boolean"
      ?raw.useHebrewName
      :!cleanLocalizedCandidate(localized.en.name)&&Boolean(cleanLocalizedCandidate(localized.he.name)),
    name:canonicalLocalizedValue(localized,"name","Unnamed Item"),
    category,
    type:category,
    qty:Number.isFinite(Number(raw.qty))?Math.max(0,Number(raw.qty)):1,
    weight:raw.weight===""||raw.weight==null?"":Math.max(0,Number(raw.weight)||0),
    desc:canonicalLocalizedValue(localized,"desc",raw.desc||""),
    destroyed:Boolean(raw.destroyed),
    isMagical:Boolean(raw.isMagical || raw.type==="Magic Item" || legacyWeapon?.magic),
    magicalProperties:(raw.magicalProperties||[]).map(normalizePower)
  };

  if(category==="Weapon"){
    const legacyDamage=String(legacyWeapon?.damage||"").match(/^(\d+d\d+)(?:\s*\+\s*(-?\d+))?/i);
    const ability=raw.weapon?.ability||legacyWeapon?.ability||"STR";
    const abilityModifier=defaultState.abilities?.[ability]?.[1]||0;
    const shownBonus=legacyDamage?.[2]!==undefined?Number(legacyDamage[2]):abilityModifier;
    const inferredDamageBonus=shownBonus-abilityModifier;
    const inferredMagicBonus=/\+\d+/.test(raw.name||legacyWeapon?.name||"")?Number((raw.name||legacyWeapon?.name||"").match(/\+(\d+)/)?.[1]||0):0;
    item.weapon={
      mode:raw.weapon?.mode||"Melee",
      damageDice:raw.weapon?.damageDice||legacyDamage?.[1]||"1d6",
      damageType:raw.weapon?.damageType||"Slashing",
      ability,
      attackBonus:Number(raw.weapon?.attackBonus ?? inferredMagicBonus)||0,
      damageBonus:Number(raw.weapon?.damageBonus ?? inferredDamageBonus)||0,
      range:raw.weapon?.range||"",
      properties:Array.isArray(raw.weapon?.properties)?raw.weapon.properties:
        String(legacyWeapon?.tag||"").split("·").map(x=>x.trim()).filter(Boolean)
    };
    if(legacyWeapon?.magic && item.magicalProperties.length===0){
      const uses=parseLegacyUses(legacyWeapon.magic.uses);
      item.magicalProperties.push(normalizePower({
        name:legacyWeapon.magic.title||"Magical Property",
        kind:uses.max>0?"Active":"Passive",
        description:legacyWeapon.magic.effect||"",
        activation:uses.max>0?"Special":"Passive",
        currentUses:uses.current,maxUses:uses.max,useCost:1,
        recharge:legacyWeapon.magic.recharge||"None",
        rechargeMode:"All",
        showInCombat:uses.max>0
      }));
    }
  }else if(category==="Armor"){
    item.armor={
      armorType:raw.armor?.armorType||"Shield",
      baseAC:Number(raw.armor?.baseAC)||0,
      acBonus:Number(raw.armor?.acBonus)||0,
      addDex:Boolean(raw.armor?.addDex),
      maxDex:raw.armor?.maxDex??"",
      strengthRequirement:Number(raw.armor?.strengthRequirement)||0,
      stealthDisadvantage:Boolean(raw.armor?.stealthDisadvantage)
    };
  }else if(category==="Consumable"){
    item.consumable={
      activation:raw.consumable?.activation||"Action",
      effectType:raw.consumable?.effectType||(raw.healing?"Healing":"Utility"),
      formula:raw.consumable?.formula||raw.effect||"",
      effect:canonicalLocalizedValue(localized,"effect",raw.consumable?.effect||raw.desc||""),
      consumedOnUse:raw.consumable?.consumedOnUse!==false
    };
  }else if(category==="Tool / Kit"){
    item.tool={
      ability:raw.tool?.ability||"None",
      proficient:Boolean(raw.tool?.proficient)
    };
  }
  return item;
}


function normalizeTrait(raw={},index=0){
  const category=raw.category || (raw.combat!==undefined?"Feat":"Class Feature");
  const id=raw.id||makeId(`trait_${index}`);
  const builtin=builtinTranslationFor(raw,id,"trait");
  const localized=normalizeLocalizedFields(raw,["name","shortDesc","description","trigger","sourceName"],builtin);
  return {
    id,
    localized,
    useHebrewName:typeof raw.useHebrewName==="boolean"
      ?raw.useHebrewName
      :!cleanLocalizedCandidate(localized.en.name)&&Boolean(cleanLocalizedCandidate(localized.he.name)),
    name:canonicalLocalizedValue(localized,"name","New Feature"),
    category:["Feat","Class Feature","Subclass Feature","Racial Trait","Homebrew","Other"].includes(category)?category:"Other",
    activation:raw.activation||raw.action||"Passive",
    shortDesc:canonicalLocalizedValue(localized,"shortDesc",raw.shortDesc||raw.desc||""),
    description:canonicalLocalizedValue(localized,"description",raw.description||raw.desc||""),
    trigger:canonicalLocalizedValue(localized,"trigger",raw.trigger||""),
    showInCombat:raw.showInCombat!==undefined?Boolean(raw.showInCombat):Boolean(raw.combat),
    sourceType:raw.sourceType||(category==="Feat"?"Feat":"Other"),
    sourceName:canonicalLocalizedValue(localized,"sourceName",raw.sourceName||""),
    unlockLevel:raw.unlockLevel===""||raw.unlockLevel==null?"":Math.max(1,Number(raw.unlockLevel)||1),
    upgradeLevels:String(raw.upgradeLevels||""),
    resourceId:String(raw.resourceId||"")
  };
}
function normalizeTraits(traits=[],legacyFeatures=[],legacyFeats=[]){
  const source=Array.isArray(traits)&&traits.length
    ?traits
    :[
      ...(Array.isArray(legacyFeatures)?legacyFeatures.map(feature=>({...feature,category:"Class Feature",showInCombat:true})):[]),
      ...(Array.isArray(legacyFeats)?legacyFeats.map(feat=>({...feat,category:"Feat",showInCombat:feat.combat!==false})):[])
    ];
  return source.map((trait,index)=>normalizeTrait(trait,index));
}
function traitCategoryClass(category){
  return String(category||"Other").toLowerCase().replaceAll(" ","-");
}
function traitLinkedResource(trait){
  return trait?.resourceId?state.resources.find(resource=>resource.id===trait.resourceId):null;
}
function traitSourceText(trait){
  return [term(trait.sourceType),trait.sourceName,trait.unlockLevel?formatLevel(trait.unlockLevel):""]
    .filter(Boolean).join(" · ")||(appLanguage==="he"?"לא הוגדר":"Not defined");
}

function normalizeResource(raw,index=0){
  const legacyReset=raw?.reset||raw?.recharge||"Manual";
  const id=raw?.id||`resource_${Date.now()}_${index}_${Math.random().toString(36).slice(2,7)}`;
  const builtin=builtinTranslationFor(raw||{},id,"resource");
  const localized=normalizeLocalizedFields(raw||{},["name","desc","sourceName"],builtin);
  const systemKey=raw?.systemKey||
    (raw?.name==="Action Surge"?"actionSurge":
     raw?.name==="Second Wind"?"secondWind":
     raw?.name==="Hit Dice"?"hitDice":
     raw?.name==="Indomitable"?"indomitable":"");
  const max=Math.max(1,Number(raw?.max)||1);
  const parsedCurrent=Number(raw?.current);
  const current=Number.isFinite(parsedCurrent)?Math.max(0,Math.min(max,parsedCurrent)):max;
  return {
    id,
    localized,
    useHebrewName:typeof raw?.useHebrewName==="boolean"
      ?raw.useHebrewName
      :!cleanLocalizedCandidate(localized.en.name)&&Boolean(cleanLocalizedCandidate(localized.he.name)),
    systemKey,
    name:canonicalLocalizedValue(localized,"name","New Resource"),
    current,
    max,
    useCost:Math.max(1,Number(raw?.useCost)||1),
    recharge:["Short Rest","Long Rest","Short or Long Rest","Manual","None"].includes(legacyReset)?legacyReset:"Manual",
    rechargeMode:raw?.rechargeMode==="Fixed"?"Fixed":"All",
    rechargeValue:Math.max(0,Number(raw?.rechargeValue) || (raw?.rechargeMode==="Fixed"?1:max)),
    action:raw?.action||"Special",
    showInCombat:raw?.showInCombat!==false && systemKey!=="hitDice",
    desc:canonicalLocalizedValue(localized,"desc",raw?.desc||""),
    sourceType:raw?.sourceType||"Homebrew",
    sourceName:canonicalLocalizedValue(localized,"sourceName",raw?.sourceName||""),
    unlockLevel:raw?.unlockLevel===""||raw?.unlockLevel==null?"":Math.max(1,Number(raw.unlockLevel)||1),
    upgradeLevels:String(raw?.upgradeLevels||"")
  };
}
function normalizeResources(resources=[]){
  const list=Array.isArray(resources)?resources:[];
  const normalized=list.map((resource,index)=>normalizeResource(resource,index));
  if(!normalized.some(resource=>resource.systemKey==="hitDice")){
    normalized.push(normalizeResource(structuredClone(defaultState.resources.find(resource=>resource.systemKey==="hitDice")),normalized.length));
  }
  return normalized;
}
function resourceByKey(key){return state.resources.find(resource=>resource.systemKey===key);}
function resourceBubbles(resource){
  return Array.from({length:resource.max},(_,i)=>`<span class="use-bubble ${i<resource.current?"":"empty"}"></span>`).join("");
}
function resourceRechargeText(resource){
  const recharge=term(resource.recharge);
  if(resource.recharge==="Manual"||resource.recharge==="None")return recharge;
  if(resource.rechargeMode==="Fixed")return `${recharge} · +${resource.rechargeValue}`;
  return `${recharge} · ${term("All")}`;
}
function resourceCanRecharge(resource,restType){
  if(resource.systemKey==="hitDice"||resource.current>=resource.max)return false;
  if(restType==="Short Rest")return ["Short Rest","Short or Long Rest"].includes(resource.recharge);
  if(restType==="Long Rest")return ["Short Rest","Long Rest","Short or Long Rest"].includes(resource.recharge);
  return false;
}
function rechargeCharacterResources(restType){
  let changed=0;
  state.resources.forEach(resource=>{
    if(!resourceCanRecharge(resource,restType))return;
    const before=resource.current;
    resource.current=resource.rechargeMode==="Fixed"
      ?Math.min(resource.max,resource.current+resource.rechargeValue)
      :resource.max;
    if(resource.current!==before)changed++;
  });
  return changed;
}

function migrateInventory(rawInventory=[],legacyWeapons=[]){
  const weapons=Array.isArray(legacyWeapons)?legacyWeapons:[];
  const output=(Array.isArray(rawInventory)?rawInventory:[]).map(raw=>{
    const match=weapons.find(w=>w.name===raw.name);
    return normalizeInventoryItem(raw,match);
  });
  weapons.forEach(w=>{
    if(!output.some(i=>i.name===w.name)) output.push(normalizeInventoryItem({name:w.name,qty:1,desc:"Migrated weapon"},w));
  });
  return output;
}

let state = JSON.parse(localStorage.getItem("characterHubState") || "null") || structuredClone(defaultState);
if (!state.schemaVersion || state.schemaVersion < 90) {
  state.attackAbility = state.attackAbility || "STR";
  state.traits = normalizeTraits(state.traits || [], state.features || [], state.feats || []);
  delete state.features;
  delete state.feats;
  state.coins = state.coins || structuredClone(defaultState.coins);
  state.hpLastChange = state.hpLastChange || "לא נרשם שינוי בנק״פ עדיין.";
  state.deathSaves = {...structuredClone(defaultState.deathSaves), ...(state.deathSaves || {})};
  state.skillProficiencies = {...structuredClone(defaultState.skillProficiencies), ...(state.skillProficiencies || {})};
  state.skillOverrides = state.skillOverrides || {};
  state.saveProficiencies = {...structuredClone(defaultState.saveProficiencies), ...(state.saveProficiencies || {})};
  state.saveOverrides = state.saveOverrides || {};
  state.hitDieType = state.hitDieType || "d10";
  state.extraActionActive = Boolean(state.extraActionActive);
  state.combatActive = Boolean(state.combatActive);
  state.shortRestSession = null;
  state.pendingZeroDamage = 0;
  state.resources = normalizeResources(state.resources?.length ? state.resources : structuredClone(defaultState.resources));
  state.inventory = migrateInventory(state.inventory || [], state.weapons || []);
  delete state.weapons;
  state.schemaVersion = 90;
  localStorage.setItem("characterHubState", JSON.stringify(englishOnlySnapshot(state)));
} else {
  state.inventory = migrateInventory(state.inventory || [], []);
  state.resources = normalizeResources(state.resources || []);
  state.traits = normalizeTraits(state.traits || [], state.features || [], state.feats || []);
  delete state.features;
  delete state.feats;
}
state.inventoryUi=state.inventoryUi||{};
state.inventoryUi.search=String(state.inventoryUi.search||"");
state.inventoryUi.filter=state.inventoryUi.filter||"All";
state.inventoryUi.magicalOnly=Boolean(state.inventoryUi.magicalOnly);
state.inventoryUi.sections={weapons:true,armor:false,consumables:true,tools:false,general:false,destroyed:false,...(state.inventoryUi.sections||{})};
state.inventoryUi.expandedItems=state.inventoryUi.expandedItems||{};
state.traitUi=state.traitUi||{};
state.traitUi.search=String(state.traitUi.search||"");
state.traitUi.filter=state.traitUi.filter||"All";
state.traitUi.sections={feat:true,"class feature":true,"subclass feature":false,"racial trait":false,homebrew:false,other:false,...(state.traitUi.sections||{})};
state.traitUi.expanded=state.traitUi.expanded||{};

const combatSectionDefaults={
  status:true,
  attacks:true,
  abilities:true,
  quick:false,
  basic:false,
  recovery:false
};
state.combatSections={...combatSectionDefaults,...(state.combatSections||{})};

function stabilizeStateData(){
  const before=JSON.stringify(state);

  state.schemaVersion=995;
  state.level=Math.max(1,Math.min(20,Number(state.level)||1));
  state.hpMax=Math.max(1,Number(state.hpMax)||1);
  state.hpCurrent=Math.max(0,Math.min(state.hpMax,Number(state.hpCurrent)||0));
  state.tempHp=Math.max(0,Number(state.tempHp)||0);
  state.ac=Number.isFinite(Number(state.ac))?Number(state.ac):10;
  state.initiative=Number(state.initiative)||0;
  state.speed=Math.max(0,Number(state.speed)||0);
  state.proficiency=Number(state.proficiency)||0;
  state.attackAbility=["STR","DEX","CON","INT","WIS","CHA"].includes(state.attackAbility)?state.attackAbility:"STR";

  state.abilities=state.abilities||structuredClone(defaultState.abilities);
  ["STR","DEX","CON","INT","WIS","CHA"].forEach(key=>{
    const score=Math.max(1,Math.min(30,Number(state.abilities?.[key]?.[0])||10));
    state.abilities[key]=[score,Math.floor((score-10)/2)];
  });

  state.coins={...structuredClone(defaultState.coins),...(state.coins||{})};
  Object.keys(state.coins).forEach(key=>{
    state.coins[key]=Math.max(0,Math.floor(Number(state.coins[key])||0));
  });

  state.deathSaves={...structuredClone(defaultState.deathSaves),...(state.deathSaves||{})};
  state.deathSaves.successes=Math.max(0,Math.min(3,Number(state.deathSaves.successes)||0));
  state.deathSaves.failures=Math.max(0,Math.min(3,Number(state.deathSaves.failures)||0));
  state.deathSaves.stabilized=Boolean(state.deathSaves.stabilized);
  state.deathSaves.dead=Boolean(state.deathSaves.dead);
  state.deathSaves.cause=String(state.deathSaves.cause||"");
  if(state.hpCurrent>0){
    state.deathSaves={successes:0,failures:0,stabilized:false,dead:false,cause:""};
  }else if(state.deathSaves.failures>=3){
    state.deathSaves.failures=3;
    state.deathSaves.dead=true;
    state.deathSaves.stabilized=false;
  }else if(state.deathSaves.successes>=3){
    state.deathSaves.successes=3;
    state.deathSaves.stabilized=true;
    state.deathSaves.dead=false;
  }

  state.resources=normalizeResources(state.resources||[]);
  state.inventory=(Array.isArray(state.inventory)?state.inventory:[]).map(item=>normalizeInventoryItem(item));
  state.traits=normalizeTraits(state.traits||[]);
  const resourceIds=new Set(state.resources.map(resource=>resource.id));
  state.traits.forEach(trait=>{
    if(trait.resourceId&&!resourceIds.has(trait.resourceId))trait.resourceId="";
  });

  state.inventoryUi=state.inventoryUi||{};
  const inventoryFilters=new Set(["All","Weapon","Armor","Consumable","Tool / Kit","General Item"]);
  if(!inventoryFilters.has(state.inventoryUi.filter))state.inventoryUi.filter="All";
  state.inventoryUi.search=String(state.inventoryUi.search||"");
  state.inventoryUi.magicalOnly=Boolean(state.inventoryUi.magicalOnly);
  state.inventoryUi.sections={weapons:true,armor:false,consumables:true,tools:false,general:false,destroyed:false,...(state.inventoryUi.sections||{})};
  const itemIds=new Set(state.inventory.map(item=>item.id));
  state.inventoryUi.expandedItems=Object.fromEntries(
    Object.entries(state.inventoryUi.expandedItems||{}).filter(([id,value])=>itemIds.has(id)&&Boolean(value))
  );

  state.traitUi=state.traitUi||{};
  const traitFilters=new Set(["All","Feats","Class","Subclass","Racial","Homebrew","Passive","Action","Bonus Action","Reaction"]);
  if(!traitFilters.has(state.traitUi.filter))state.traitUi.filter="All";
  state.traitUi.search=String(state.traitUi.search||"");
  state.traitUi.sections={feat:true,"class feature":true,"subclass feature":false,"racial trait":false,homebrew:false,other:false,...(state.traitUi.sections||{})};
  const traitIds=new Set(state.traits.map(trait=>trait.id));
  state.traitUi.expanded=Object.fromEntries(
    Object.entries(state.traitUi.expanded||{}).filter(([id,value])=>traitIds.has(id)&&Boolean(value))
  );

  state.combatSections={...combatSectionDefaults,...(state.combatSections||{})};
  state.extraActionActive=Boolean(state.extraActionActive);
  state.combatActive=Boolean(state.combatActive);
  state.shortRestSession=null;
  state.pendingZeroDamage=Math.max(0,Number(state.pendingZeroDamage)||0);
  state.hpLastChange=String(state.hpLastChange||"לא נרשם שינוי בנק״פ עדיין.");

  const after=JSON.stringify(state);
  if(before!==after){
    try{localStorage.setItem("characterHubState",JSON.stringify(englishOnlySnapshot(state)));}catch(error){console.warn("State stabilization could not be persisted",error);}
    return true;
  }
  return false;
}
stabilizeStateData();
applyLocalizedStateView();

const abilityNames={
  STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"
};
function abilityDisplayName(ability,{withCode=false}={}){
  const name=term(abilityNames[ability]||ability);
  return withCode?`${name} (${ability})`:name;
}
function skillDisplayName(def){return term(def?.name||"");}
function saveDisplayName(def){
  return appLanguage==="he"
    ?`גלגול הצלה: ${abilityDisplayName(def.ability)}`
    :`${abilityDisplayName(def.ability)} Save`;
}
const skillDefs=[
  {key:"acrobatics",name:"Acrobatics",ability:"DEX"},
  {key:"animalHandling",name:"Animal Handling",ability:"WIS"},
  {key:"arcana",name:"Arcana",ability:"INT"},
  {key:"athletics",name:"Athletics",ability:"STR"},
  {key:"deception",name:"Deception",ability:"CHA"},
  {key:"history",name:"History",ability:"INT"},
  {key:"insight",name:"Insight",ability:"WIS"},
  {key:"intimidation",name:"Intimidation",ability:"CHA"},
  {key:"investigation",name:"Investigation",ability:"INT"},
  {key:"medicine",name:"Medicine",ability:"WIS"},
  {key:"nature",name:"Nature",ability:"INT"},
  {key:"perception",name:"Perception",ability:"WIS"},
  {key:"performance",name:"Performance",ability:"CHA"},
  {key:"persuasion",name:"Persuasion",ability:"CHA"},
  {key:"religion",name:"Religion",ability:"INT"},
  {key:"sleightOfHand",name:"Sleight of Hand",ability:"DEX"},
  {key:"stealth",name:"Stealth",ability:"DEX"},
  {key:"survival",name:"Survival",ability:"WIS"}
];
const saveDefs=["STR","DEX","CON","INT","WIS","CHA"].map(ability=>({
  key:ability,name:`${abilityNames[ability]} Save`,ability
}));
function getInfoMap(){
  if(appLanguage==="he"){
    return {
      hp:["נקודות פגיעה",`נקודות פגיעה מייצגות כמה נזק הדמות יכולה לספוג. כרגע יש לך <b>${state.hpCurrent}/${state.hpMax}</b>. בעליית רמה מגלגלים ידנית את קוביית הפגיעה, מוסיפים את מתאם החוסן ומזינים את התוצאה.`],
      temp:["נקודות פגיעה זמניות","נקודות פגיעה זמניות סופגות נזק לפני הנקודות הרגילות. הן אינן מצטברות אלא אם חוק מסוים אומר אחרת."],
      ac:["דרג שריון",`דרג השריון קובע כמה קשה לפגוע בך. אויב צריך להגיע ל־<b>${state.ac}</b> או יותר בגלגול הפגיעה.`],
      initiative:["יוזמה",`היוזמה קובעת את סדר הפעולה בתחילת הקרב. התוסף הנוכחי שלך הוא ${signed(state.initiative)}.`],
      speed:["מהירות","מספר הרגליים שהדמות יכולה לנוע בתור רגיל, לפני פעולות או תוספים אחרים."],
      proficiency:["תוסף שליטה","תוסף שמתווסף לגלגולים שבהם הדמות בעלת שליטה. הוא גדל לפי הרמה."],
      resources:["משאבים","יכולות בעלות מספר שימושים מוגבל. כל שורה מציגה כמה שימושים נשארו ומתי הם מתחדשים."],
      attacks:["נשקים והתקפות","מציג את גלגול הפגיעה והנזק של כל נשק. נשק קסום כולל את הכוחות השייכים אליו בתוך כרטיס הנשק."],
      attackroll:["גלגול פגיעה",""],
      levelauto:["התקדמות אוטומטית","כל מה שהמקצוע או תת־המקצוע מעניקים ללא בחירה יתווסף לאחר אישור העלייה ברמה."],
      levelhp:["נקודות פגיעה בעליית רמה","האפליקציה אינה מגלגלת במקומך. גלגל קובייה אמיתית, הזן את התוצאה, והמערכת תחשב את התוספת יחד עם מתאם החוסן."],
      advancement:["בחירת התקדמות","כאשר הרמה מציעה בחירה, נפתח מסך נפרד עם הסבר על כל אפשרות לפני האישור."],
      hptracker:["מעקב נקודות פגיעה","הזן את כמות הנזק או הריפוי. נזק יורד קודם מנקודות הפגיעה הזמניות ורק אחר כך מהנקודות הרגילות."],
      shortrest:["מנוחה קצרה","מנוחה קצרה מחדשת רק משאבים שמוגדרים להתחדש במנוחה קצרה. האפליקציה אינה מגבילה את מספר המנוחות בקמפיין."],
      longrest:["מנוחה ארוכה","מנוחה ארוכה מחדשת את המשאבים המתאימים ומחזירה את נקודות הפגיעה למקסימום באב־הטיפוס. החוקים המדויקים יכולים להשתנות בין קמפיינים."],
      feats:["Feats & Features","ניתן להוסיף, לערוך ולחבר Feats ו־Features למשאבים. יכולות רלוונטיות מוצגות גם במסך הקרב."],
      turnactions:["פעולות בתור","החלוקה מציגה מה ניתן לבצע כפעולה, פעולת בונוס, תגובה, תנועה או הפעלה מיוחדת."],
      deathsaves:["גלגולי הצלה ממוות","כאשר נקודות הפגיעה מגיעות ל־0 מסמנים ידנית הצלחות וכישלונות. 1 טבעי שווה שני כישלונות; 20 טבעי מחזיר לנקודת פגיעה אחת; שלוש הצלחות מייצבות ושלושה כישלונות מסמנים מוות."],
      hitdice:["קוביות פגיעה","ללוחם יש קוביית d10 אחת לכל רמה. במהלך מנוחה קצרה ניתן לגלגל קובייה פיזית, להזין את התוצאה ולהוסיף את מתאם החוסן."],
      combatstate:["מצב הקרב","מסך הקרב מציג מידע בכל עת, אך התחלת קרב מפעילה את מצב הקרב בפועל. בזמן קרב פעיל המנוחות נעולות."],
      temphpedit:["נקודות פגיעה זמניות","אפשר לערוך את נקודות הפגיעה הזמניות לפני הקרב ובמהלכו. נזק יורד מהן אוטומטית לפני הנקודות הרגילות."]
    };
  }
  return {
    hp:["Hit Points",`Hit Points represent how much damage the character can withstand. You currently have <b>${state.hpCurrent}/${state.hpMax}</b>. On level up, physically roll the Hit Die, add the Constitution Modifier and enter the result.`],
    temp:["Temporary HP","Temporary HP absorb damage before normal HP. They do not stack unless a rule specifically says otherwise."],
    ac:["Armor Class",`Armor Class determines how difficult you are to hit. An enemy must reach <b>${state.ac}</b> or higher on the attack roll.`],
    initiative:["Initiative",`Initiative determines turn order at the start of combat. Your current bonus is ${signed(state.initiative)}.`],
    speed:["Speed","The number of feet the character can move during a normal turn, before other Actions or bonuses."],
    proficiency:["Proficiency Bonus","A bonus added to rolls in which the character is proficient. It increases with level."],
    resources:["Resources","Abilities with limited uses. Each row shows the remaining uses and when they recharge."],
    attacks:["Weapons & Attacks","Shows the attack roll and damage for each weapon. A magical weapon contains its associated powers inside the weapon card."],
    attackroll:["Attack Roll",""],
    levelauto:["Automatic Gains","Everything granted automatically by the Class or Subclass is added after the level-up is confirmed."],
    levelhp:["HP on Level Up","The app does not roll for you. Physically roll the die, enter the result, and the system adds the Constitution Modifier."],
    advancement:["Advancement Choice","When a level offers a choice, a separate screen explains each option before confirmation."],
    hptracker:["HP Tracker","Enter damage or healing. Damage is removed from Temporary HP first and then from normal HP."],
    shortrest:["Short Rest","A Short Rest restores only Resources configured to recharge on a Short Rest. The app does not limit the number of rests in a campaign."],
    longrest:["Long Rest","A Long Rest restores the appropriate Resources and returns HP to maximum in this prototype. Exact rules may vary by campaign."],
    feats:["Feats & Features","Feats and Features may be added, edited and linked to Resources. Relevant abilities also appear in Combat."],
    turnactions:["Turn Actions","This section shows what may be performed as an Action, Bonus Action, Reaction, Movement or Special activation."],
    deathsaves:["Death Saving Throws","At 0 HP, mark successes and failures manually. A Natural 1 counts as two failures; a Natural 20 restores 1 HP; three successes stabilize and three failures mark death."],
    hitdice:["Hit Dice","A Fighter has one d10 Hit Die per level. During a Short Rest, physically roll the die, enter the result and add the Constitution Modifier."],
    combatstate:["Combat State","Combat information is always available, but Start Combat activates the actual Combat state. Rests are locked while Combat is active."],
    temphpedit:["Temporary HP","Temporary HP can be edited before or during Combat. Damage is removed from them automatically before normal HP."]
  };
}

function signed(n){ return n>0?`+${n}`:`${n}`; }
function abilityMod(score){ return Math.floor((Number(score)-10)/2); }
function syncAbilityModifiers(){
  Object.keys(state.abilities).forEach(key=>{
    state.abilities[key][0]=Number(state.abilities[key][0])||10;
    state.abilities[key][1]=abilityMod(state.abilities[key][0]);
  });
}
function skillTotal(def){
  const override=state.skillOverrides?.[def.key];
  if(override!==undefined && override!==null && override!=="") return Number(override);
  const ability=state.abilities[def.ability][1];
  const status=state.skillProficiencies?.[def.key] || "none";
  const multiplier=status==="expertise"?2:status==="proficient"?1:0;
  return ability + state.proficiency*multiplier;
}
function saveTotal(def){
  const override=state.saveOverrides?.[def.key];
  if(override!==undefined && override!==null && override!=="") return Number(override);
  return state.abilities[def.ability][1] + (state.saveProficiencies?.[def.key]?state.proficiency:0);
}
function proficiencyLabel(status){
  return status==="expertise"?phrase("Expertise"):status==="proficient"?phrase("Proficiency"):phrase("None");
}
function englishOnlySnapshot(value){
  const copy=structuredClone(value);
  const visit=node=>{
    if(!node||typeof node!=="object")return;
    if(Object.prototype.hasOwnProperty.call(node,"localized")){
      const localized=node.localized||{};
      const english={...(localized.en||{})};
      const hebrew=localized.he||{};
      Object.keys(hebrew).forEach(key=>{if(!String(english[key]??"").trim())english[key]=hebrew[key];});
      node.localized={en:english};
    }
    delete node.i18n;
    delete node.useHebrewName;
    Object.values(node).forEach(visit);
  };
  visit(copy);
  copy.schemaVersion=995;
  return copy;
}
function save(){
  state.schemaVersion=995;
  try{
    localStorage.setItem("characterHubState",JSON.stringify(englishOnlySnapshot(state)));
    return true;
  }catch(error){
    console.error("Character Hub could not save state",error);
    return false;
  }
}
function updateModalScrollLock(){
  const hasOpen=Boolean(document.querySelector(".modal-backdrop.open,.sheet-backdrop.open"));
  document.body?.classList.toggle("modal-open",hasOpen);
}
function openEl(id){
  const target=document.getElementById(id);
  if(!target)return;
  target.classList.add("open");
  updateModalScrollLock();
  localizeDocument(target);
}
function closeEl(id){
  const target=document.getElementById(id);
  if(!target)return;
  target.classList.remove("open");
  updateModalScrollLock();
}
function toast(msg){
  const t=document.getElementById("toast");
  if(!t)return;
  t.textContent=runtimePhrase(msg);
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
}


function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function bidiAutoHtml(value){
  return `<bdi dir="auto" class="bidi-auto">${escapeHtml(value)}</bdi>`;
}
function ltrHtml(value){
  return `<bdi dir="ltr" class="bidi-ltr">${escapeHtml(value)}</bdi>`;
}
function mixedTextHtml(value){
  const text=String(value??"");
  if(!text)return "";
  const ltrRun=/[+\-]?(?:\d+[A-Za-z0-9+\-*/()./%]*|[A-Za-z][A-Za-z0-9'’+\-*/()./%]*)(?:[ \t]+(?:[+\-]?\d+[A-Za-z0-9+\-*/()./%]*|[A-Za-z][A-Za-z0-9'’+\-*/()./%]*))*[.,:;!?]?/g;
  let result="";
  let cursor=0;
  text.replace(ltrRun,(match,offset)=>{
    result+=escapeHtml(text.slice(cursor,offset));
    result+=`<bdi dir="ltr" class="ltr-run">${escapeHtml(match)}</bdi>`;
    cursor=offset+match.length;
    return match;
  });
  result+=escapeHtml(text.slice(cursor));
  return result.replace(/\r?\n/g,"<br>");
}
function itemCategory(item){ return item.category||item.type||"General Item"; }
function activePowers(item){ return (item.magicalProperties||[]).filter(p=>!p.lost); }
function passiveMagicBonus(item,key){
  return activePowers(item).filter(p=>p.kind==="Passive"||p.activation==="Passive").reduce((sum,p)=>sum+(Number(p[key])||0),0);
}
function weaponAbilityModifier(item){
  const ability=item.weapon?.ability||state.attackAbility||"STR";
  return state.abilities[ability]?.[1]??0;
}
function formatSignedParts(base,...parts){
  let result=base||"";
  parts.filter(n=>Number(n)!==0).forEach(n=>{ result+=` ${Number(n)>0?"+":"-"} ${Math.abs(Number(n))}`; });
  return result||"0";
}
function weaponDamageFormula(item){
  const w=item.weapon||{};
  return formatSignedParts(w.damageDice||"1d6",weaponAbilityModifier(item),Number(w.damageBonus)||0,passiveMagicBonus(item,"damageBonus"));
}
function weaponAttackBonus(item){
  return weaponAbilityModifier(item)+state.proficiency+(Number(item.weapon?.attackBonus)||0)+passiveMagicBonus(item,"attackBonus");
}
function compactRollFormula(value){
  return String(value||"")
    .replace(/\s*([+-])\s*/g,"$1")
    .replace(/\s+/g," ")
    .trim();
}
function weaponAttackFormula(item){
  return `1d20${signed(weaponAttackBonus(item))}`;
}
function weaponDamageDisplay(item){
  return [compactRollFormula(weaponDamageFormula(item)),term(item.weapon?.damageType||"")]
    .filter(Boolean)
    .join(" ");
}
function weaponSummaryText(item){
  return `${phrase("To Hit")} ${weaponAttackFormula(item)} · ${phrase("Damage")} ${weaponDamageDisplay(item)}`;
}
function weaponSummaryHtml(item){
  return `<span class="weapon-summary-block">
    <span class="weapon-summary-line">${phrase("To Hit")} ${escapeHtml(weaponAttackFormula(item))}</span>
    <span class="weapon-summary-line">${phrase("Damage")} ${escapeHtml(weaponDamageDisplay(item))}</span>
  </span>`;
}
function weaponTag(item){
  const w=item.weapon||{};
  const parts=[term(w.mode),term(w.damageType),formatFeet(w.range),...(w.properties||[]).map(term)].filter(Boolean);
  return parts.join(" · ")||term("Weapon");
}
function combatWeaponDescriptor(item){
  const weapon=item.weapon||{};
  return [term(weapon.mode),term(weapon.damageType),...(weapon.properties||[]).map(term)].filter(Boolean).join(" · ")||term("Weapon");
}
const combatWeaponPowerUi=new Map();
function combatWeaponPowers(item){
  return (item.magicalProperties||[])
    .map((power,powerIndex)=>({power,powerIndex}))
    .filter(({power})=>power.showInCombat&&!power.lost);
}
function combatPowerUsageText(power){
  const max=Math.max(0,Number(power.maxUses)||0);
  if(max<=0)return phrase("Unlimited");
  return formatUses(Math.max(0,Number(power.currentUses)||0),max);
}
function combatPowerRechargeText(power){
  let text=term(power.recharge||"None");
  if(power.rechargeMode==="Fixed")text+=` · +${Math.max(0,Number(power.rechargeValue)||0)}`;
  else if(power.rechargeMode==="Dice")text+=` · ${power.rechargeFormula||(appLanguage==="he"?"גלגול ידני":"Manual roll")}`;
  else if(power.rechargeMode==="All"&&power.recharge!=="None")text+=` · ${term("All")}`;
  return text;
}
function renderCombatWeaponPower(item,itemIndex,power,powerIndex,downed=false){
  const passive=power.kind==="Passive"||power.activation==="Passive";
  const canUse=!passive&&powerCanUse(power)&&!downed&&!item.destroyed&&item.qty>0;
  const effect=[power.effectFormula,power.effectType].filter(Boolean).join(" · ");
  return `<article class="combat-weapon-power ${passive?"passive":""} ${downed?"active-disabled":""}">
    <div class="combat-weapon-power-icon" aria-hidden="true">${passive?"✦":"⚡"}</div>
    <div class="combat-weapon-power-main">
      <div class="combat-weapon-power-title-row">
        <h5>${bidiAutoHtml(power.name)}</h5>
        <span class="inline-tag">${bidiAutoHtml(term(power.activation||power.kind||"Special"))}</span>
      </div>
      <div class="combat-weapon-power-meta">
        <span>${ltrHtml(combatPowerUsageText(power))}</span>
        <span>${ltrHtml(combatPowerRechargeText(power))}</span>
      </div>
      ${power.description?`<p class="mixed-copy" dir="auto">${mixedTextHtml(power.description)}</p>`:""}
      ${effect?`<div class="combat-weapon-power-effect">${ltrHtml(effect)}</div>`:""}
      ${powerUseTracker(power)}
    </div>
    <div class="combat-weapon-power-actions">
      <button class="small-btn" onclick="showWeaponItem(${itemIndex});event.stopPropagation()">${phrase("Details")}</button>
      ${passive?"":`<button class="small-btn primary" onclick="useMagicPower(${itemIndex},${powerIndex});event.stopPropagation()" ${canUse?"":"disabled"}>${phrase("Use")}</button>`}
    </div>
  </article>`;
}
function renderCombatWeaponCard(item,index,downed=false){
  const powers=combatWeaponPowers(item);
  const range=formatFeet(item.weapon?.range||"5 ft.");
  const powersOpen=combatWeaponPowerUi.get(item.id)===true;
  return `<article class="combat-weapon-card ${item.isMagical?"magical":""}">
    <div class="combat-weapon-header">
      <div class="combat-weapon-identity">
        <div class="combat-weapon-title-row">
          <h4 class="combat-weapon-name">${bidiAutoHtml(item.name)}</h4>
          ${item.isMagical?`<span class="combat-magic-badge">${appLanguage==="he"?"קסום":"Magical"} ✦</span>`:""}
        </div>
        <div class="combat-weapon-meta">${ltrHtml(combatWeaponDescriptor(item))}</div>
      </div>
      <button class="magic-info-btn combat-weapon-info" aria-label="${appLanguage==="he"?"פרטי הנשק":"Weapon details"}" onclick="showWeaponItem(${index});event.stopPropagation()">i</button>
    </div>

    <div class="combat-weapon-stats">
      <div class="combat-weapon-stat combat-weapon-to-hit">
        <span>To Hit</span>
        <b class="weapon-formula">${escapeHtml(weaponAttackFormula(item))}</b>
      </div>
      <div class="combat-weapon-stat combat-weapon-damage">
        <span>Damage</span>
        <b class="weapon-formula">${escapeHtml(weaponDamageDisplay(item))}</b>
      </div>
      <div class="combat-weapon-stat combat-weapon-range">
        <span>Range</span>
        <b>${escapeHtml(range)}</b>
      </div>
    </div>

    ${powers.length?`<section class="combat-weapon-powers ${powersOpen?"open":""}">
      <button class="combat-weapon-powers-toggle" aria-expanded="${powersOpen}" onclick="toggleCombatWeaponPowers('${escapeHtml(item.id)}');event.stopPropagation()">
        <span><b>✦ ${appLanguage==="he"?"כוחות קסומים":"Magical Powers"}</b><em>${powers.length}</em></span>
        <span class="combat-weapon-powers-chevron">⌄</span>
      </button>
      <div class="combat-weapon-powers-body">
        <div class="combat-weapon-powers-list">
          ${powers.map(({power,powerIndex})=>renderCombatWeaponPower(item,index,power,powerIndex,downed)).join("")}
        </div>
      </div>
    </section>`:""}
  </article>`;
}
window.toggleCombatWeaponPowers=function(itemId){
  const open=combatWeaponPowerUi.get(itemId)!==false;
  combatWeaponPowerUi.set(itemId,!open);
  render();
};
function getCombatWeapons(){
  return state.inventory.map((item,index)=>({item,index})).filter(x=>itemCategory(x.item)==="Weapon"&&!x.item.destroyed&&x.item.qty>0);
}
function powerUsesText(power){
  if((Number(power.maxUses)||0)<=0)return phrase("Unlimited");
  return `${power.currentUses}/${power.maxUses} · ${formatCost(power.useCost||1)}`;
}
function powerUseTracker(power){
  const max=Math.max(0,Number(power.maxUses)||0);
  if(max<=0)return "";
  const current=Math.max(0,Math.min(max,Number(power.currentUses)||0));
  const bubbles=Array.from({length:max},(_,i)=>`<span class="use-bubble ${i<current?"":"empty"}"></span>`).join("");
  let rechargeText=term(power.recharge||"None");
  if(power.rechargeMode==="Fixed") rechargeText+=` · +${Math.max(0,Number(power.rechargeValue)||0)}`;
  else if(power.rechargeMode==="Dice") rechargeText+=` · ${escapeHtml(power.rechargeFormula||(appLanguage==="he"?"גלגול ידני":"Manual roll"))}`;
  else if(power.rechargeMode==="All") rechargeText+=` · ${term("All")}`;
  return `<div class="power-use-tracker">
    <div class="resource-bubbles">${bubbles}</div>
    <div class="power-use-meta">
      <span class="quantity-pill" dir="ltr">${current}/${max}</span>
      <span class="tiny" dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(formatCost(Math.max(1,Number(power.useCost)||1)))} · ${rechargeText}</span>
    </div>
  </div>`;
}
function depletionOutcomeLabel(outcome){
  if(appLanguage==="he"){
    if(outcome==="property")return "הכוח הקסום הזה נעלם";
    if(outcome==="allMagic")return "כל הכוחות הקסומים בחפץ נעלמים";
    if(outcome==="destroyItem")return "החפץ מסומן כהרוס";
    return "המנחה קובע את העונש";
  }
  if(outcome==="property")return "this magical power disappears";
  if(outcome==="allMagic")return "all magical powers in the item disappear";
  if(outcome==="destroyItem")return "the item is marked as Destroyed";
  return "the Game Master determines the penalty";
}
function powerCanUse(power){
  return !power.lost&&((Number(power.maxUses)||0)<=0||Number(power.currentUses)>=Math.max(1,Number(power.useCost)||1));
}
function actionGroupForPower(power){
  const value=power.activation||"Special";
  if(["Action","Bonus Action","Reaction","Movement","Special"].includes(value))return value;
  return "Special";
}
function categorySummary(item){
  const category=itemCategory(item);
  if(category==="Weapon")return weaponSummaryText(item);
  if(category==="Armor"){
    const a=item.armor||{};
    return a.armorType==="Shield"
      ?`${appLanguage==="he"?"תוסף לדרג השריון":"AC Bonus"} ${signed(Number(a.acBonus)||0)}`
      :`${appLanguage==="he"?"דרג שריון בסיסי":"Base AC"} ${a.baseAC||0}${a.addDex?" + DEX":""}`;
  }
  if(category==="Consumable"){
    const c=item.consumable||{};
    return [term(c.effectType),c.formula,term(c.activation)].filter(Boolean).join(" · ")||item.desc||term("Consumable");
  }
  if(category==="Tool / Kit"){
    const ability=item.tool?.ability&&item.tool.ability!=="None"?abilityDisplayName(item.tool.ability):phrase("None");
    return `${ability}${item.tool?.proficient?` · ${phrase("Proficient")}`:""}`;
  }
  return item.desc||term("General Item");
}
function findPowerByIds(itemId,powerId){
  const itemIndex=state.inventory.findIndex(i=>i.id===itemId);
  if(itemIndex<0)return null;
  const powerIndex=(state.inventory[itemIndex].magicalProperties||[]).findIndex(p=>p.id===powerId);
  if(powerIndex<0)return null;
  return {item:state.inventory[itemIndex],itemIndex,power:state.inventory[itemIndex].magicalProperties[powerIndex],powerIndex};
}
let editingItemIndex=null;
let itemDraftSource=null;
let itemDraftPowers=[];
let itemDraftPowerOpen=new Set();
function blankMagicPower(){
  return normalizePower({
    name:"New Magical Power",kind:"Active",description:"",activation:"Action",
    effectFormula:"",effectType:"",currentUses:1,maxUses:1,useCost:1,
    recharge:"Long Rest",rechargeMode:"All",rechargeValue:1,rechargeFormula:"",
    showInCombat:true,depletionRisk:{enabled:false,die:"d20",failOn:1,outcome:"property"}
  });
}
function openItemEditor(index=null){
  editingItemIndex=index;
  const existing=index===null?null:state.inventory[index];
  itemDraftSource=existing?structuredClone(existing):null;
  itemDraftPowers=existing?(existing.magicalProperties||[]).map(normalizePower):[];
  itemDraftPowerOpen=new Set(itemDraftPowers.length?[0]:[]);
  document.getElementById("itemEditorTitle").textContent=existing
    ?(appLanguage==="he"?"עריכת חפץ":"Edit Item")
    :(appLanguage==="he"?"הוספת חפץ":"Add Item");
  itemNameHe.value=existing?.localized?.he?.name||"";
  itemNameEn.value=existing?.localized?.en?.name||existing?.localized?.he?.name||"";
  itemUseHebrewName.checked=Boolean(existing?.useHebrewName);
  itemType.value=itemCategory(existing||{category:"General Item"});
  itemQty.value=existing?.qty??1;
  itemWeight.value=existing?.weight??"";
  itemDestroyed.value=String(Boolean(existing?.destroyed));
  itemMagical.value=String(Boolean(existing?.isMagical));
  itemDescHe.value=existing?.localized?.he?.desc||"";
  itemDescEn.value=existing?.localized?.en?.desc||existing?.localized?.he?.desc||"";
  renderItemCategoryFields();
  renderMagicPropertiesEditor();
  updateMagicalVisibility();
  openEl("itemModal");
  requestAnimationFrame(updateItemEditorPreview);
}
function renderItemCategoryFields(){
  const category=itemType.value;
  const same=itemDraftSource&&itemCategory(itemDraftSource)===category;
  const source=same?itemDraftSource:{};
  let content="";
  if(category==="Weapon"){
    const w=source.weapon||{};
    content=`<div class="editor-step-card category-panel"><div class="editor-step-head"><span class="editor-step-number">2</span><div><h3>Category Details</h3><p>Weapon Details</p></div></div>
      <div class="field-grid">
        <div class="form-group"><label>Weapon Mode</label><select id="weaponMode">
          ${["Melee","Ranged","Melee or Ranged"].map(v=>`<option value="${v}" ${w.mode===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Damage Dice</label><input id="weaponDamageDice" value="${escapeHtml(w.damageDice||"1d8")}" placeholder="1d8"></div>
        <div class="form-group"><label>Damage Type</label><select id="weaponDamageType">
          ${["Slashing","Piercing","Bludgeoning","Fire","Cold","Lightning","Thunder","Acid","Poison","Necrotic","Radiant","Force","Psychic","Other"].map(v=>`<option value="${v}" ${w.damageType===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Ability</label><select id="weaponAbility">
          ${["STR","DEX","CON","INT","WIS","CHA","None"].map(v=>`<option value="${v}" ${w.ability===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Attack Bonus נוסף</label><input id="weaponAttackBonus" type="number" value="${Number(w.attackBonus)||0}"></div>
        <div class="form-group"><label>Damage Bonus נוסף</label><input id="weaponDamageBonus" type="number" value="${Number(w.damageBonus)||0}"></div>
        <div class="form-group"><label>Range</label><input id="weaponRange" value="${escapeHtml(w.range||"")}" placeholder="5 ft. / 20/60 ft."></div>
        <div class="form-group"><label>Properties</label><input id="weaponProperties" value="${escapeHtml((w.properties||[]).join(", "))}" placeholder="Heavy, Finesse, Reach"></div>
      </div>
      <p class="builder-note">הנשק יופיע אוטומטית ב־Weapons & Attacks. ה־Attack Roll יחושב מה־Ability, ה־Proficiency והבונוסים.</p>
    </div>`;
  }else if(category==="Armor"){
    const a=source.armor||{};
    content=`<div class="editor-step-card category-panel"><div class="editor-step-head"><span class="editor-step-number">2</span><div><h3>Category Details</h3><p>Armor / Shield Details</p></div></div>
      <div class="field-grid">
        <div class="form-group"><label>Armor Type</label><select id="armorType">
          ${["Light","Medium","Heavy","Shield","Other"].map(v=>`<option value="${v}" ${a.armorType===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Base AC</label><input id="armorBaseAC" type="number" value="${Number(a.baseAC)||0}"></div>
        <div class="form-group"><label>AC Bonus</label><input id="armorACBonus" type="number" value="${Number(a.acBonus)||0}"></div>
        <div class="form-group"><label>Maximum DEX Bonus</label><input id="armorMaxDex" type="number" value="${a.maxDex??""}" placeholder="ריק = ללא הגבלה"></div>
        <div class="form-group"><label>STR Requirement</label><input id="armorStrength" type="number" value="${Number(a.strengthRequirement)||0}"></div>
      </div>
      <div class="checkbox-line"><span><b>Add DEX to AC</b><div class="tiny">לפי מגבלות השריון</div></span><input id="armorAddDex" type="checkbox" ${a.addDex?"checked":""}></div>
      <div class="checkbox-line"><span><b>Stealth Disadvantage</b></span><input id="armorStealth" type="checkbox" ${a.stealthDisadvantage?"checked":""}></div>
      <p class="builder-note">בגרסה הזאת הנתונים נשמרים ומוצגים, אך אינם משנים אוטומטית את ה־AC של הדמות עד שתיבנה מערכת Equipped מלאה.</p>
    </div>`;
  }else if(category==="Consumable"){
    const c=source.consumable||{};
    content=`<div class="editor-step-card category-panel"><div class="editor-step-head"><span class="editor-step-number">2</span><div><h3>Category Details</h3><p>Consumable Details</p></div></div>
      <div class="field-grid">
        <div class="form-group"><label>Activation</label><select id="consumableActivation">
          ${["Action","Bonus Action","Reaction","Special"].map(v=>`<option value="${v}" ${c.activation===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Effect Type</label><select id="consumableEffectType">
          ${["Healing","Damage","Utility","Other"].map(v=>`<option value="${v}" ${c.effectType===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
        <div class="form-group"><label>Formula</label><input id="consumableFormula" value="${escapeHtml(c.formula||"")}" placeholder="2d4 + 2"></div>
        <div class="localized-field-grid" style="grid-column:1/-1">
          <input id="consumableEffectHe" type="hidden" value=""/>
          <div class="form-group language-field en-field"><label>Effect in English</label><input id="consumableEffectEn" dir="ltr" value="${escapeHtml(source.localized?.en?.effect||"")}" placeholder="What happens on use?"></div>
        </div>
      </div>
      <div class="checkbox-line"><span><b>נעלם מהמלאי לאחר שימוש</b></span><input id="consumableConsumed" type="checkbox" ${c.consumedOnUse!==false?"checked":""}></div>
    </div>`;
  }else if(category==="Tool / Kit"){
    const t=source.tool||{};
    content=`<div class="editor-step-card category-panel"><div class="editor-step-head"><span class="editor-step-number">2</span><div><h3>Category Details</h3><p>Tool / Kit Details</p></div></div>
      <div class="field-grid">
        <div class="form-group"><label>Associated Ability</label><select id="toolAbility">
          ${["None","STR","DEX","CON","INT","WIS","CHA"].map(v=>`<option value="${v}" ${t.ability===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
        </select></div>
      </div>
      <div class="checkbox-line"><span><b>Proficient with this tool</b></span><input id="toolProficient" type="checkbox" ${t.proficient?"checked":""}></div>
    </div>`;
  }else{
    content=`<div class="editor-step-card category-panel"><div class="editor-step-head"><span class="editor-step-number">2</span><div><h3>Category Details</h3><p>General Item</p></div></div><p class="builder-note">לחפץ כללי אין נתוני קרב מיוחדים. אפשר להשתמש בתיאור כדי לשמור כל מידע שה־DM מספק.</p></div>`;
  }
  document.getElementById("itemCategoryFields").innerHTML=content;
}
function syncPowerDraftFromDom(){
  itemDraftPowers=itemDraftPowers.map((power,index)=>{
    const get=id=>document.getElementById(`${id}_${index}`);
    if(!get("powerNameHe"))return power;
    const localized={
      he:{name:get("powerNameHe").value.trim(),description:get("powerDescriptionHe").value.trim()},
      en:{name:get("powerNameEn").value.trim(),description:get("powerDescriptionEn").value.trim()},
      legacy:{...(power.localized?.legacy||{})}
    };
    return normalizePower({
      ...power,
      localized,
      useHebrewName:get("powerUseHebrewName").checked,
      name:canonicalLocalizedValue(localized,"name","Magical Property"),
      kind:get("powerKind").value,
      description:canonicalLocalizedValue(localized,"description",""),
      activation:get("powerActivation").value,
      effectFormula:get("powerFormula").value.trim(),
      effectType:get("powerEffectType").value.trim(),
      attackBonus:Number(get("powerAttackBonus").value)||0,
      damageBonus:Number(get("powerDamageBonus").value)||0,
      acBonus:Number(get("powerACBonus").value)||0,
      currentUses:Math.max(0,Number(get("powerCurrentUses").value)||0),
      maxUses:Math.max(0,Number(get("powerMaxUses").value)||0),
      useCost:Math.max(1,Number(get("powerUseCost").value)||1),
      recharge:get("powerRecharge").value,
      rechargeMode:get("powerRechargeMode").value,
      rechargeValue:Math.max(0,Number(get("powerRechargeValue").value)||0),
      rechargeFormula:get("powerRechargeFormula").value.trim(),
      showInCombat:get("powerShowCombat").checked,
      lost:get("powerLost").checked,
      depletionRisk:{
        enabled:get("powerDepletionEnabled").value==="true",
        die:get("powerDepletionDie").value,
        failOn:Math.max(1,Number(get("powerDepletionFail").value)||1),
        outcome:get("powerDepletionOutcome").value
      }
    });
  });
}
function renderMagicPropertiesEditor(){
  const wrap=document.getElementById("magicPropertiesEditor");
  if(!itemDraftPowers.length){
    wrap.innerHTML=`<div class="summary">עדיין לא נוספו כוחות קסומים. חפץ יכול להיות קסום גם עם השפעה פסיבית בלבד.</div>`;
    scheduleItemEditorPreview();
    return;
  }
  wrap.innerHTML=itemDraftPowers.map((p,index)=>{
    const open=itemDraftPowerOpen.has(index);
    const uses=Number(p.maxUses)>0?`${p.currentUses}/${p.maxUses}`:"Unlimited";
    return `<div class="magic-property-editor ${open?"open":""}">
      <div class="magic-property-head">
        <div>
          <h4 data-localized-content>${escapeHtml(localizedValue(p,"name","name")||`${appLanguage==="he"?"כוח קסום":"Magical Power"} ${index+1}`)}</h4>
          <div class="magic-property-summary">${escapeHtml(term(p.kind))} · ${escapeHtml(term(p.activation))} · ${uses}</div>
        </div>
        <div class="magic-property-head-actions">
          <button class="small-btn magic-property-toggle" type="button" onclick="toggleMagicPropertyEditor(${index})">${open?"סגור":"פתח"}</button>
          <button class="danger-btn" type="button" onclick="removeMagicProperty(${index})">הסר</button>
        </div>
      </div>
      <div class="magic-property-body">
        <div class="magic-property-content">
          <div class="field-grid">
            <div class="localized-field-grid" style="grid-column:1/-1">
              <input id="powerNameHe_${index}" type="hidden" value=""/>
              <div class="form-group language-field en-field"><label>שם באנגלית — ברירת המחדל</label><input id="powerNameEn_${index}" dir="ltr" value="${escapeHtml(p.localized?.en?.name||"")}"></div>
            </div>
            <div class="checkbox-line optional-name-toggle">
              <span><b>הצג את השם העברי במצב עברית</b><div class="tiny">כאשר האפשרות כבויה, שם הכוח נשאר באנגלית.</div></span>
              <input id="powerUseHebrewName_${index}" type="checkbox" ${p.useHebrewName?"checked":""}>
            </div>
            <div class="form-group"><label>סוג</label><select id="powerKind_${index}">
              ${["Passive","Active","Spell"].map(v=>`<option value="${v}" ${p.kind===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
            </select></div>
            <div class="form-group"><label>Activation</label><select id="powerActivation_${index}">
              ${["Passive","Action","Bonus Action","Reaction","On Hit","Special"].map(v=>`<option value="${v}" ${p.activation===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
            </select></div>
            <div class="form-group"><label>Effect Formula</label><input id="powerFormula_${index}" value="${escapeHtml(p.effectFormula)}" placeholder="3d8 / 2d4 + 2"></div>
            <div class="form-group"><label>Effect Type</label><input id="powerEffectType_${index}" value="${escapeHtml(p.effectType)}" placeholder="Poison Damage / Healing"></div>
            <div class="form-group"><label>Attack Bonus</label><input id="powerAttackBonus_${index}" type="number" value="${Number(p.attackBonus)||0}"></div>
            <div class="form-group"><label>Damage Bonus</label><input id="powerDamageBonus_${index}" type="number" value="${Number(p.damageBonus)||0}"></div>
            <div class="form-group"><label>AC Bonus</label><input id="powerACBonus_${index}" type="number" value="${Number(p.acBonus)||0}"></div>
          </div>
          <div class="localized-field-grid">
            <input id="powerDescriptionHe_${index}" type="hidden" value=""/>
            <div class="form-group language-field en-field"><label>Exact Description in English</label><textarea id="powerDescriptionEn_${index}" rows="3" dir="ltr">${escapeHtml(p.localized?.en?.description||"")}</textarea></div>
          </div>

          <div class="subsection-title">Uses & Recharge</div>
          <div class="field-grid three">
            <div class="form-group"><label>Current Uses</label><input id="powerCurrentUses_${index}" type="number" min="0" value="${p.currentUses}"></div>
            <div class="form-group"><label>Maximum Uses</label><input id="powerMaxUses_${index}" type="number" min="0" value="${p.maxUses}"></div>
            <div class="form-group"><label>Cost per Use</label><input id="powerUseCost_${index}" type="number" min="1" value="${p.useCost}"></div>
            <div class="form-group"><label>Recharge</label><select id="powerRecharge_${index}">
              ${["Short Rest","Long Rest","Short or Long Rest","Dawn","Manual","None"].map(v=>`<option value="${v}" ${p.recharge===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
            </select></div>
            <div class="form-group"><label>Recharge Amount</label><select id="powerRechargeMode_${index}">
              ${["All","Fixed","Dice"].map(v=>`<option value="${v}" ${p.rechargeMode===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
            </select></div>
            <div class="form-group"><label>Fixed Amount</label><input id="powerRechargeValue_${index}" type="number" min="0" value="${p.rechargeValue}"></div>
          </div>
          <div class="form-group"><label>Dice Formula for Recharge</label><input id="powerRechargeFormula_${index}" value="${escapeHtml(p.rechargeFormula)}" placeholder="1d4 + 1"></div>
          <p class="builder-note">Maximum Uses = 0 פירושו כוח ללא מגבלת שימוש. בגלגול חידוש האתר יבקש להזין תוצאה פיזית.</p>

          <div class="checkbox-line"><span><b>הצג במסך הקרב</b><div class="tiny">יופיע תחת סוג הפעולה שנבחר</div></span><input id="powerShowCombat_${index}" type="checkbox" ${p.showInCombat?"checked":""}></div>
          <div class="checkbox-line"><span><b>הכוח מסומן כ־Lost</b><div class="tiny">לא ניתן להשתמש או לחדש אותו</div></span><input id="powerLost_${index}" type="checkbox" ${p.lost?"checked":""}></div>

          <div class="subsection-title">Depletion Risk</div>
          <div class="form-group"><label>האם יש סיכון בשימוש האחרון?</label>
            <select id="powerDepletionEnabled_${index}" onchange="toggleDepletionFields(${index})">
              <option value="false" ${!p.depletionRisk.enabled?"selected":""}>לא</option>
              <option value="true" ${p.depletionRisk.enabled?"selected":""}>כן</option>
            </select>
          </div>
          <div id="powerDepletionFields_${index}" class="${p.depletionRisk.enabled?"":"hidden"}">
            <p class="builder-note">השדות הבאים נפתחים רק כאשר בוחרים כן. הבדיקה תופיע כאשר הכוח מגיע ל־0 שימושים.</p>
            <div class="field-grid three">
              <div class="form-group"><label>Die</label><select id="powerDepletionDie_${index}">
                ${["d4","d6","d8","d10","d12","d20","d100"].map(v=>`<option value="${v}" ${p.depletionRisk.die===v?"selected":""}>${escapeHtml(term(v))}</option>`).join("")}
              </select></div>
              <div class="form-group"><label>Failure On</label><input id="powerDepletionFail_${index}" type="number" min="1" value="${p.depletionRisk.failOn}"></div>
              <div class="form-group"><label>Failure Result</label><select id="powerDepletionOutcome_${index}">
                <option value="property" ${p.depletionRisk.outcome==="property"?"selected":""}>רק הכוח נעלם</option>
                <option value="allMagic" ${p.depletionRisk.outcome==="allMagic"?"selected":""}>כל הקסם בחפץ נעלם</option>
                <option value="destroyItem" ${p.depletionRisk.outcome==="destroyItem"?"selected":""}>החפץ נהרס</option>
                <option value="manual" ${p.depletionRisk.outcome==="manual"?"selected":""}>ה־DM מחליט ידנית</option>
              </select></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
  scheduleItemEditorPreview();
}
window.toggleMagicPropertyEditor=function(index){
  syncPowerDraftFromDom();
  if(itemDraftPowerOpen.has(index))itemDraftPowerOpen.delete(index);
  else itemDraftPowerOpen.add(index);
  renderMagicPropertiesEditor();
};
window.toggleDepletionFields=function(index){
  const select=document.getElementById(`powerDepletionEnabled_${index}`);
  const fields=document.getElementById(`powerDepletionFields_${index}`);
  if(!select||!fields)return;
  fields.classList.toggle("hidden",select.value!=="true");
};
window.removeMagicProperty=function(index){
  syncPowerDraftFromDom();
  itemDraftPowers.splice(index,1);
  itemDraftPowerOpen=new Set(itemDraftPowers.length?[Math.max(0,Math.min(index,itemDraftPowers.length-1))]:[]);
  renderMagicPropertiesEditor();
};
function updateMagicalVisibility(){
  document.getElementById("magicalItemFields").classList.toggle("hidden",itemMagical.value!=="true");
  scheduleItemEditorPreview();
}
function collectItemFromEditor(){
  syncPowerDraftFromDom();
  const category=itemType.value;
  const localized={
    he:{
      name:itemNameHe.value.trim(),
      desc:itemDescHe.value.trim(),
      effect:category==="Consumable"?(document.getElementById("consumableEffectHe")?.value.trim()||""):""
    },
    en:{
      name:itemNameEn.value.trim(),
      desc:itemDescEn.value.trim(),
      effect:category==="Consumable"?(document.getElementById("consumableEffectEn")?.value.trim()||""):""
    },
    legacy:{...(itemDraftSource?.localized?.legacy||{})}
  };
  const item={
    id:itemDraftSource?.id||makeId("item"),
    localized,
    useHebrewName:itemUseHebrewName.checked,
    name:canonicalLocalizedValue(localized,"name","Unnamed Item"),
    category,type:category,
    qty:Math.max(0,Number(itemQty.value)||1),
    weight:itemWeight.value===""?"":Math.max(0,Number(itemWeight.value)||0),
    desc:canonicalLocalizedValue(localized,"desc",""),
    destroyed:itemDestroyed.value==="true",
    isMagical:itemMagical.value==="true",
    magicalProperties:itemMagical.value==="true"?itemDraftPowers.map(normalizePower):[]
  };
  if(category==="Weapon"){
    item.weapon={
      mode:weaponMode.value,
      damageDice:weaponDamageDice.value.trim()||"1d6",
      damageType:weaponDamageType.value,
      ability:weaponAbility.value,
      attackBonus:Number(weaponAttackBonus.value)||0,
      damageBonus:Number(weaponDamageBonus.value)||0,
      range:weaponRange.value.trim(),
      properties:weaponProperties.value.split(",").map(x=>x.trim()).filter(Boolean)
    };
  }else if(category==="Armor"){
    item.armor={
      armorType:armorType.value,
      baseAC:Number(armorBaseAC.value)||0,
      acBonus:Number(armorACBonus.value)||0,
      addDex:armorAddDex.checked,
      maxDex:armorMaxDex.value===""?"":Number(armorMaxDex.value),
      strengthRequirement:Number(armorStrength.value)||0,
      stealthDisadvantage:armorStealth.checked
    };
  }else if(category==="Consumable"){
    item.consumable={
      activation:consumableActivation.value,
      effectType:consumableEffectType.value,
      formula:consumableFormula.value.trim(),
      effect:canonicalLocalizedValue(localized,"effect",""),
      consumedOnUse:consumableConsumed.checked
    };
  }else if(category==="Tool / Kit"){
    item.tool={ability:toolAbility.value,proficient:toolProficient.checked};
  }
  return normalizeInventoryItem(item);
}

let itemPreviewFrame=0;
function scheduleItemEditorPreview(){
  if(itemPreviewFrame)return;
  itemPreviewFrame=requestAnimationFrame(()=>{
    itemPreviewFrame=0;
    updateItemEditorPreview();
  });
}
function itemPreviewSafeDraft(){
  try{return collectItemFromEditor();}
  catch(error){
    return normalizeInventoryItem({
      id:itemDraftSource?.id||makeId("preview"),
      localized:{
        he:{name:itemNameHe?.value?.trim()||"",desc:itemDescHe?.value?.trim()||"",effect:document.getElementById("consumableEffectHe")?.value?.trim()||""},
        en:{name:itemNameEn?.value?.trim()||"",desc:itemDescEn?.value?.trim()||"",effect:document.getElementById("consumableEffectEn")?.value?.trim()||""}
      },
      useHebrewName:Boolean(itemUseHebrewName?.checked),
      name:itemNameEn?.value?.trim()||itemNameHe?.value?.trim()||"Unnamed Item",
      category:itemType?.value||"General Item",
      type:itemType?.value||"General Item",
      qty:Math.max(0,Number(itemQty?.value)||1),
      weight:itemWeight?.value===""?"":Math.max(0,Number(itemWeight?.value)||0),
      desc:itemDescEn?.value?.trim()||itemDescHe?.value?.trim()||"",
      destroyed:itemDestroyed?.value==="true",
      isMagical:itemMagical?.value==="true",
      magicalProperties:itemMagical?.value==="true"?itemDraftPowers.map(normalizePower):[]
    });
  }
}
function updateItemEditorPreview(){
  const summary=document.getElementById("itemEditorSummary");
  const preview=document.getElementById("itemLivePreview");
  if(!summary||!preview)return;
  const item=itemPreviewSafeDraft();
  const category=itemCategory(item);
  const magical=item.isMagical;
  const activePowers=(item.magicalProperties||[]).filter(power=>!power.lost);
  summary.innerHTML=[
    `<span class="editor-summary-chip primary">${escapeHtml(category)}</span>`,
    `<span class="editor-summary-chip">x${item.qty}</span>`,
    `<span class="editor-summary-chip">${formatWeight(Number(item.weight)||0)} lb each</span>`,
    magical?`<span class="editor-summary-chip magic">✦ Magical</span>`:`<span class="editor-summary-chip">Mundane</span>`,
    magical?`<span class="editor-summary-chip resource">${activePowers.length} ${activePowers.length===1?"Power":"Powers"}</span>`:""
  ].filter(Boolean).join("");
  const summaryText=categorySummary(item);
  const previewSummary=category==="Weapon"
    ?weaponSummaryHtml(item)
    :`<p class="mixed-copy" data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(summaryText||localizedValue(item,"desc","description")||(appLanguage==="he"?"החפץ יופיע במלאי לאחר השמירה.":"The item will appear in the inventory after saving."))}</p>`;
  preview.innerHTML=`<div class="editor-live-preview-head">
      <div>
        <span class="editor-kicker">Live Inventory Preview</span>
        <h3 data-localized-content>${bidiAutoHtml(localizedValue(item,"name","name"))}</h3>
        ${previewSummary}
      </div>
      <span class="quantity-pill">x${item.qty}</span>
    </div>
    <div class="editor-live-preview-badges">
      <span class="editor-preview-badge">${escapeHtml(category)}</span>
      <span class="editor-preview-badge">${formatWeight(Number(item.weight)||0)} lb</span>
      ${item.destroyed?'<span class="editor-preview-badge combat">Destroyed</span>':""}
      ${magical?'<span class="editor-preview-badge magic">Magical</span>':""}
      ${magical&&activePowers.length?`<span class="editor-preview-badge resource">${activePowers.length} active powers</span>`:""}
    </div>`;
}
function updateTraitEditorPreview(){
  const summary=document.getElementById("traitEditorSummary");
  const preview=document.getElementById("traitLivePreview");
  if(!summary||!preview)return;
  const mode=traitResourceMode.value;
  const linked=mode==="existing"?state.resources.find(resource=>resource.id===traitExistingResource.value):null;
  const draftTraitName=appLanguage==="he"
    ?traitNameHe.value.trim():traitNameEn.value.trim();
  const resourceName=mode==="create"
    ?`${draftTraitName||(appLanguage==="he"?"יכולת":"Feature")} ${appLanguage==="he"?"— משאב":"Resource"}`
    :linked?.name||"";
  summary.innerHTML=[
    `<span class="editor-summary-chip primary">${escapeHtml(traitCategory.value)}</span>`,
    `<span class="editor-summary-chip">${escapeHtml(traitActivation.value)}</span>`,
    traitShowCombat.checked?'<span class="editor-summary-chip primary">Show in Combat</span>':'<span class="editor-summary-chip">Hidden from Combat</span>',
    mode==="none"?'<span class="editor-summary-chip">No Resource</span>':`<span class="editor-summary-chip resource">Linked Resource</span>`
  ].join("");
  preview.innerHTML=`<div class="editor-live-preview-head">
      <div>
        <span class="editor-kicker">Live Feature Preview</span>
        <h3 data-localized-content>${bidiAutoHtml(draftTraitName||(appLanguage==="he"?"יכולת ללא שם":"Unnamed Feature"))}</h3>
        <p class="mixed-copy" data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(
          (appLanguage==="he"?traitShortDescHe.value.trim()||traitDescriptionHe.value.trim():traitShortDescEn.value.trim()||traitDescriptionEn.value.trim())
          ||(appLanguage==="he"?"התקציר שיופיע בכרטיס היכולת.":"The summary shown on the feature card.")
        )}</p>
      </div>
    </div>
    <div class="editor-live-preview-badges">
      <span class="editor-preview-badge">${escapeHtml(traitCategory.value)}</span>
      <span class="editor-preview-badge">${escapeHtml(traitActivation.value)}</span>
      ${traitShowCombat.checked?'<span class="editor-preview-badge combat">Combat</span>':""}
      ${mode!=="none"?`<span class="editor-preview-badge resource">${escapeHtml(resourceName||"Resource")}</span>`:""}
      ${traitUnlockLevel.value?`<span class="editor-preview-badge">Level ${escapeHtml(traitUnlockLevel.value)}</span>`:""}
    </div>`;
  const linkedPreview=document.getElementById("traitExistingResourcePreview");
  if(linkedPreview){
    linkedPreview.innerHTML=linked
      ?`<b>${escapeHtml(linked.name)}</b><div class="tiny">${linked.current}/${linked.max} · ${escapeHtml(resourceRechargeText(linked))}</div><div class="resource-bubbles">${resourceBubbles(linked)}</div>`
      :"";
  }
}

const polishDisclosureMotion={duration:290,easing:"cubic-bezier(.22,.8,.22,1)"};
function prefersReducedPolishMotion(){
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}
function disclosureParts(element){
  if(!element)return {};
  if(element.classList.contains("inventory-section"))return {
    body:element.querySelector(".inventory-section-body"),
    content:element.querySelector(".inventory-section-content"),
    toggle:element.querySelector(".inventory-section-toggle")
  };
  if(element.classList.contains("inventory-item-card"))return {
    body:element.querySelector(".inventory-item-body"),
    content:element.querySelector(".inventory-item-content"),
    toggle:element.querySelector(".inventory-toggle-details")
  };
  if(element.classList.contains("trait-page-section"))return {
    body:element.querySelector(".trait-page-section-body"),
    content:element.querySelector(".trait-page-section-content"),
    toggle:element.querySelector(".trait-page-section-toggle")
  };
  if(element.classList.contains("trait-page-card"))return {
    body:element.querySelector(".trait-card-body"),
    content:element.querySelector(".trait-card-content"),
    toggle:element.querySelector(".trait-toggle-btn")
  };
  return {};
}
function syncPolishDisclosure(element,open){
  if(!element)return;
  const {body,content,toggle}=disclosureParts(element);
  element.classList.toggle("open",Boolean(open));
  element.classList.remove("polish-animating");
  delete element.dataset.animating;
  delete element.dataset.animationToken;
  toggle?.setAttribute("aria-expanded",String(Boolean(open)));
  if(body){
    body.style.transition="";
    body.style.height=open?"auto":"0px";
    body.style.opacity=open?"1":"0";
    body.style.willChange="";
  }
  if(content){
    content.style.transition="";
    content.style.opacity="";
    content.style.transform="";
    content.style.willChange="";
  }
}
function finishPolishDisclosure(element,open,token){
  if(!element||element.dataset.animationToken!==token)return;
  syncPolishDisclosure(element,open);
}
function animatePolishDisclosure(element,open){
  if(!element||element.dataset.animating==="true")return false;
  const {body,content,toggle}=disclosureParts(element);
  if(!body||!content||prefersReducedPolishMotion()){
    syncPolishDisclosure(element,open);
    return true;
  }

  const token=`polish_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const currentlyOpen=element.classList.contains("open");
  const currentHeight=Math.max(0,body.getBoundingClientRect().height);

  element.dataset.animating="true";
  element.dataset.animationToken=token;
  element.classList.add("polish-animating");
  toggle?.setAttribute("aria-expanded",String(Boolean(open)));

  body.style.transition="none";
  content.style.transition="none";
  body.style.height=`${currentHeight}px`;
  body.style.opacity=currentlyOpen?"1":"0";
  content.style.opacity=currentlyOpen?"1":"0";
  content.style.transform=currentlyOpen?"translate3d(0,0,0)":"translate3d(0,-7px,0)";

  let targetHeight=0;
  if(open){
    element.classList.add("open");
    body.style.height="auto";
    targetHeight=Math.max(body.scrollHeight||0,body.getBoundingClientRect().height);
    body.style.height=`${currentHeight}px`;
  }else{
    element.classList.remove("open");
  }

  void body.offsetHeight;
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      if(element.dataset.animationToken!==token)return;
      body.style.transition=`height ${polishDisclosureMotion.duration}ms ${polishDisclosureMotion.easing},opacity 180ms ease`;
      content.style.transition=`opacity 180ms ease,transform 280ms ${polishDisclosureMotion.easing}`;
      body.style.height=`${open?targetHeight:0}px`;
      body.style.opacity=open?"1":"0";
      content.style.opacity=open?"1":"0";
      content.style.transform=open?"translate3d(0,0,0)":"translate3d(0,-7px,0)";
    });
  });

  const onEnd=event=>{
    if(event.target!==body||event.propertyName!=="height")return;
    body.removeEventListener("transitionend",onEnd);
    finishPolishDisclosure(element,open,token);
  };
  body.addEventListener("transitionend",onEnd);
  setTimeout(()=>finishPolishDisclosure(element,open,token),polishDisclosureMotion.duration+100);
  return true;
}
function syncPolishDisclosureTree(root=document){
  root?.querySelectorAll?.("[data-polish-disclosure]").forEach(element=>{
    syncPolishDisclosure(element,element.classList.contains("open"));
  });
}
function disclosureElement(type,key){
  return document.querySelector(`[data-disclosure-type="${type}"][data-disclosure-key="${key}"]`);
}
let inventoryRenderFrame=0;
let traitRenderFrame=0;
let deferredSaveTimer=0;
function scheduleDeferredSave(){
  clearTimeout(deferredSaveTimer);
  deferredSaveTimer=setTimeout(save,120);
}
function queueInventoryPageRender(){
  if(inventoryRenderFrame)cancelAnimationFrame(inventoryRenderFrame);
  inventoryRenderFrame=requestAnimationFrame(()=>{
    inventoryRenderFrame=0;
    renderInventoryPage();
  });
}
function queueTraitPageRender(){
  if(traitRenderFrame)cancelAnimationFrame(traitRenderFrame);
  traitRenderFrame=requestAnimationFrame(()=>{
    traitRenderFrame=0;
    renderTraitPage();
  });
}

const inventorySectionDefaults={
  weapons:true,
  armor:false,
  consumables:true,
  tools:false,
  general:false,
  destroyed:false
};

const inventoryCategoryDefs=[
  {key:"All",labelEn:"All",labelHe:"הכול",sectionKey:"all",icon:"🧰"},
  {key:"Weapon",labelEn:"Weapons",labelHe:"נשקים",sectionKey:"weapons",icon:"⚔️"},
  {key:"Armor",labelEn:"Armor",labelHe:"שריון",sectionKey:"armor",icon:"🛡️"},
  {key:"Consumable",labelEn:"Consumables",labelHe:"מתכלים",sectionKey:"consumables",icon:"🧪"},
  {key:"Tool / Kit",labelEn:"Tools",labelHe:"כלים",sectionKey:"tools",icon:"🧰"},
  {key:"General Item",labelEn:"Other",labelHe:"אחר",sectionKey:"general",icon:"🎒"}
];
function inventoryCategoryLabel(def){return appLanguage==="he"?def.labelHe:def.labelEn;}

function ensureInventoryUiState(){
  state.inventoryUi=state.inventoryUi||{};
  state.inventoryUi.search=String(state.inventoryUi.search||"");
  state.inventoryUi.filter=state.inventoryUi.filter||"All";
  state.inventoryUi.magicalOnly=Boolean(state.inventoryUi.magicalOnly);
  state.inventoryUi.sections={...inventorySectionDefaults,...(state.inventoryUi.sections||{})};
  state.inventoryUi.expandedItems=state.inventoryUi.expandedItems||{};
}

function inventorySectionInfo(sectionKey){
  const map={
    weapons:{title:appLanguage==="he"?"נשקים":"Weapons",icon:"⚔️",subtitle:appLanguage==="he"?"נשקים רגילים וקסומים":"Mundane and magical weapons"},
    armor:{title:appLanguage==="he"?"שריון":"Armor",icon:"🛡️",subtitle:appLanguage==="he"?"שריונות, מגנים והגנות":"Armor, shields and defenses"},
    consumables:{title:appLanguage==="he"?"מתכלים":"Consumables",icon:"🧪",subtitle:appLanguage==="he"?"שיקויים, מזון ופריטים לשימוש":"Potions, food and usable items"},
    tools:{title:appLanguage==="he"?"כלים וערכות":"Tools & Kits",icon:"🧰",subtitle:appLanguage==="he"?"כלים, ערכות וציוד מקצועי":"Tools, kits and professional equipment"},
    general:{title:appLanguage==="he"?"חפצים כלליים":"General Items",icon:"🎒",subtitle:appLanguage==="he"?"כל שאר החפצים במלאי":"All other inventory items"},
    destroyed:{title:appLanguage==="he"?"חפצים הרוסים":"Destroyed Items",icon:"🪦",subtitle:appLanguage==="he"?"פריטים שסומנו כהרוסים":"Items marked as destroyed"}
  };
  return map[sectionKey]||map.general;
}

function inventorySectionKeyForItem(item){
  if(item.destroyed)return "destroyed";
  const category=itemCategory(item);
  if(category==="Weapon")return "weapons";
  if(category==="Armor")return "armor";
  if(category==="Consumable")return "consumables";
  if(category==="Tool / Kit")return "tools";
  return "general";
}

function itemTotalWeight(item){
  return (Number(item.weight)||0)*(Math.max(0,Number(item.qty)||0));
}

function formatWeight(value){
  const n=Math.round((Number(value)||0)*10)/10;
  return Number.isInteger(n)?String(n):n.toFixed(1);
}

function inventoryLoadLabel(weight){
  const strScore=Number(state.abilities?.STR?.[0])||10;
  if(appLanguage==="he"){
    if(weight<=0)return "ללא עומס";
    if(weight<=strScore*5)return "עומס קל";
    if(weight<=strScore*10)return "עומס בינוני";
    return "עומס כבד";
  }
  if(weight<=0)return "Unburdened";
  if(weight<=strScore*5)return "Light Load";
  if(weight<=strScore*10)return "Medium Load";
  return "Heavy Load";
}

function inventorySummaryData(){
  const activeItems=state.inventory.filter(item=>!item.destroyed);
  const totalQty=activeItems.reduce((sum,item)=>sum+Math.max(0,Number(item.qty)||0),0);
  const totalWeight=activeItems.reduce((sum,item)=>sum+itemTotalWeight(item),0);
  const magicalQty=activeItems.filter(item=>item.isMagical).reduce((sum,item)=>sum+Math.max(0,Number(item.qty)||0),0);
  const consumableQty=activeItems.filter(item=>itemCategory(item)==="Consumable").reduce((sum,item)=>sum+Math.max(0,Number(item.qty)||0),0);
  return {
    totalQty,
    distinctCount:activeItems.length,
    totalWeight,
    magicalQty,
    consumableQty,
    destroyedCount:state.inventory.filter(item=>item.destroyed).length
  };
}

function inventoryCardPreview(item){
  const category=itemCategory(item);
  if(category==="Weapon"){
    return weaponSummaryHtml(item);
  }
  if(category==="Armor"){
    const a=item.armor||{};
    return a.armorType==="Shield"
      ?`${signed(Number(a.acBonus)||0)} AC`
      :`Base AC ${a.baseAC||0}${a.addDex?" + DEX":""}`;
  }
  if(category==="Consumable"){
    const c=item.consumable||{};
    const compact=[c.formula,c.effectType].filter(Boolean).join(" ");
    return compact?ltrHtml(compact):mixedTextHtml(c.effect||item.desc||"Consumable");
  }
  if(category==="Tool / Kit"){
    const t=item.tool||{};
    return [t.ability||"",t.proficient?"Proficient":""].filter(Boolean).join(" · ") || escapeHtml(item.desc||"Tool / Kit");
  }
  return mixedTextHtml(item.desc||"General Item");
}

function inventoryCardSubline(item){
  const category=itemCategory(item);
  if(category==="Weapon")return bidiAutoHtml(weaponTag(item));
  if(category==="Consumable"){
    const c=item.consumable||{};
    return `<span data-localized-content>${escapeHtml([term(c.activation),c.effect||""].filter(Boolean).join(" · "))}</span>`;
  }
  if(category==="Armor"){
    const a=item.armor||{};
    const bits=[term(a.armorType)];
    if(a.strengthRequirement)bits.push(`${abilityDisplayName("STR",true)} ${a.strengthRequirement}`);
    if(a.stealthDisadvantage)bits.push(appLanguage==="he"?"חיסרון בהתגנבות":"Stealth Disadvantage");
    return escapeHtml(bits.join(" · "));
  }
  return `<span data-localized-content>${escapeHtml(categorySummary(item))}</span>`;
}

function inventoryItemBadges(item){
  const badges=[`<span class="inventory-badge">${escapeHtml(term(itemCategory(item)))}</span>`];
  if(item.isMagical)badges.push(`<span class="inventory-badge magic">${phrase("Magical")}</span>`);
  if(item.destroyed)badges.push(`<span class="inventory-badge destroyed">${phrase("Destroyed")}</span>`);
  if((item.magicalProperties||[]).some(power=>power.lost))badges.push(`<span class="inventory-badge lost">${appLanguage==="he"?"כוח שאבד":"Lost Power"}</span>`);
  return badges.join("");
}

function inventoryPowerDetails(item,itemIndex){
  const he=appLanguage==="he";
  const heading=he?"תכונות קסומות":"Magical Properties";
  if(!item.isMagical)return `<div class="inventory-detail-box"><h4>${heading}</h4><p data-localized-content>${he?"החפץ הזה אינו מוגדר כקסום.":"This item is not marked as magical."}</p></div>`;
  const powers=item.magicalProperties||[];
  if(!powers.length)return `<div class="inventory-detail-box"><h4>${heading}</h4><p data-localized-content>${he?"לא הוגדרו כוחות לחפץ הזה.":"No powers are defined for this item."}</p></div>`;
  return `<div class="inventory-detail-box">
    <h4>${heading}</h4>
    <div class="inventory-power-list">${powers.map((power,powerIndex)=>`
      <div class="inventory-power-card ${power.lost?"power-lost":""}">
        <h5>${bidiAutoHtml(power.name)}</h5>
        <div class="inventory-power-meta">
          <span class="inventory-badge">${bidiAutoHtml(term(power.kind||"Magic"))}</span>
          <span class="inventory-badge">${bidiAutoHtml(term(power.activation||"Special"))}</span>
          ${power.showInCombat&&!power.lost?`<span class="inventory-badge magic">${he?"קרב":"Combat"}</span>`:""}
        </div>
        <p data-localized-content>${escapeHtml(power.description||(he?"לא הוזן תיאור.":"No description provided."))}</p>
        ${power.effectFormula||power.effectType?`<p class="inventory-inline-formula">${bidiAutoHtml([power.effectFormula,term(power.effectType)].filter(Boolean).join(" · "))}</p>`:""}
        ${powerUseTracker(power)}
        ${power.depletionRisk?.enabled?`<p class="tiny" data-localized-content>${he?"סיכון התכלות: גלגל":"Depletion Risk: Roll"} ${escapeHtml(power.depletionRisk.die||"d20")}; ${he?"בתוצאה":"on"} ${escapeHtml(power.depletionRisk.failOn)}, ${escapeHtml(depletionOutcomeLabel(power.depletionRisk.outcome))}.</p>`:""}
        ${!power.lost&&power.kind!=="Passive"?`<button class="small-btn primary" onclick="useMagicPower(${itemIndex},${powerIndex});event.stopPropagation()" ${powerCanUse(power)&&!item.destroyed&&item.qty>0?"":"disabled"}>${phrase("Use")}</button>`:""}
      </div>`).join("")}
    </div>
  </div>`;
}

function inventoryItemDetailHtml(item,index){
  const category=itemCategory(item);
  let leftBlock='';
  if(category==="Weapon"){
    const w=item.weapon||{};
    leftBlock=`<div class="inventory-detail-box">
      <h4>Weapon Details</h4>
      <div class="inventory-detail-list">
        <div class="inventory-detail-line"><span>To Hit</span><b class="weapon-formula">${escapeHtml(weaponAttackFormula(item))}</b></div>
        <div class="inventory-detail-line"><span>Damage</span><b class="weapon-formula">${escapeHtml(weaponDamageDisplay(item))}</b></div>
        <div class="inventory-detail-line"><span>Ability</span><b>${escapeHtml(w.ability||state.attackAbility||"STR")}</b></div>
        <div class="inventory-detail-line"><span>Range</span><b>${escapeHtml(w.range||"—")}</b></div>
        <div class="inventory-detail-line"><span>Properties</span><b>${escapeHtml((w.properties||[]).join(", ")||"None")}</b></div>
      </div>
    </div>`;
  }else if(category==="Armor"){
    const a=item.armor||{};
    leftBlock=`<div class="inventory-detail-box">
      <h4>Armor Details</h4>
      <div class="inventory-detail-list">
        <div class="inventory-detail-line"><span>Armor Type</span><b>${escapeHtml(a.armorType||"Armor")}</b></div>
        <div class="inventory-detail-line"><span>Base AC</span><b>${a.baseAC||0}</b></div>
        <div class="inventory-detail-line"><span>AC Bonus</span><b>${signed(Number(a.acBonus)||0)}</b></div>
        <div class="inventory-detail-line"><span>Add DEX</span><b>${a.addDex?"Yes":"No"}</b></div>
        <div class="inventory-detail-line"><span>STR Requirement</span><b>${a.strengthRequirement||"—"}</b></div>
        <div class="inventory-detail-line"><span>Stealth</span><b>${a.stealthDisadvantage?"Disadvantage":"Normal"}</b></div>
      </div>
    </div>`;
  }else if(category==="Consumable"){
    const c=item.consumable||{};
    leftBlock=`<div class="inventory-detail-box">
      <h4>Consumable Details</h4>
      <div class="inventory-detail-list">
        <div class="inventory-detail-line"><span>Activation</span><b>${escapeHtml(c.activation||"Special")}</b></div>
        <div class="inventory-detail-line"><span>Effect Type</span><b>${escapeHtml(c.effectType||"Utility")}</b></div>
        <div class="inventory-detail-line"><span>Formula</span><b>${escapeHtml(c.formula||"—")}</b></div>
        <div class="inventory-detail-line"><span>Consumes Item</span><b>${c.consumedOnUse?"Yes":"No"}</b></div>
      </div>
      <p class="mixed-copy" dir="auto">${mixedTextHtml(c.effect||item.desc||"Consumable effect.")}</p>
    </div>`;
  }else if(category==="Tool / Kit"){
    const t=item.tool||{};
    leftBlock=`<div class="inventory-detail-box">
      <h4>Tool Details</h4>
      <div class="inventory-detail-list">
        <div class="inventory-detail-line"><span>Related Ability</span><b>${escapeHtml(t.ability||"—")}</b></div>
        <div class="inventory-detail-line"><span>Proficient</span><b>${t.proficient?"Yes":"No"}</b></div>
      </div>
      <p class="mixed-copy" dir="auto">${mixedTextHtml(item.desc||"No description.")}</p>
    </div>`;
  }else{
    leftBlock=`<div class="inventory-detail-box">
      <h4>Item Details</h4>
      <div class="inventory-detail-list">
        <div class="inventory-detail-line"><span>Category</span><b>${escapeHtml(category)}</b></div>
        <div class="inventory-detail-line"><span>Quantity</span><b>x${item.qty}</b></div>
        <div class="inventory-detail-line"><span>Total Weight</span><b>${formatWeight(itemTotalWeight(item))} lb</b></div>
      </div>
      <p class="mixed-copy" dir="auto">${mixedTextHtml(item.desc||"No description.")}</p>
    </div>`;
  }

  const descriptionBox=`<div class="inventory-detail-box">
    <h4>Description</h4>
    <p class="mixed-copy" dir="auto">${mixedTextHtml(item.desc||"No description available.")}</p>
    <div class="inventory-detail-list">
      <div class="inventory-detail-line"><span>Quantity</span><b>x${item.qty}</b></div>
      <div class="inventory-detail-line"><span>Unit Weight</span><b>${formatWeight(Number(item.weight)||0)} lb</b></div>
      <div class="inventory-detail-line"><span>Total Weight</span><b>${formatWeight(itemTotalWeight(item))} lb</b></div>
      <div class="inventory-detail-line"><span>Status</span><b>${item.destroyed?"Destroyed":"Active"}</b></div>
    </div>
  </div>`;

  return `<div class="inventory-detail-grid">
    <div>${leftBlock}${descriptionBox}</div>
    <div>${inventoryPowerDetails(item,index)}</div>
  </div>
  <div class="item-action-row" style="margin-top:10px">
    <button class="small-btn" onclick="showItemDetails(${index});event.stopPropagation()">!</button>
    <button class="small-btn" onclick="editItem(${index});event.stopPropagation()">עריכה</button>
    <button class="danger-btn" onclick="removeItem(${index});event.stopPropagation()">מחיקה</button>
  </div>`;
}

function inventoryItemCardHtml(item,index){
  const expanded=Boolean(state.inventoryUi.expandedItems?.[item.id]);
  const category=itemCategory(item);
  const quickUse=category==="Consumable"
    ?`<button class="small-btn primary inventory-use-btn" onclick="openConsumable(${index});event.stopPropagation()" ${item.qty<=0||item.destroyed?"disabled":""}>${phrase("Use")}</button>`
    :"";
  return `<article class="inventory-item-card ${expanded?"open":""} ${item.destroyed?"is-destroyed":""}" data-polish-disclosure data-disclosure-type="inventory-item" data-disclosure-key="${escapeHtml(item.id)}">
    <div class="inventory-item-header">
      <div class="inventory-item-main">
        <div class="inventory-item-topline">
          <div class="inventory-item-name">${bidiAutoHtml(item.name)}</div>
          <div class="inventory-item-stack">
            <div class="inventory-item-qty">x${item.qty}</div>
            <div class="inventory-item-weight">${formatWeight(Number(item.weight)||0)} "lb"</div>
          </div>
        </div>
        <div class="inventory-badge-row">${inventoryItemBadges(item)}</div>
        <div class="inventory-item-preview">${inventoryCardPreview(item)}</div>
        <div class="inventory-item-subline">${inventoryCardSubline(item)}</div>
      </div>
      <div class="inventory-item-actions">
        ${quickUse}
        <button class="small-btn inventory-toggle-details" aria-expanded="${expanded}" onclick="toggleInventoryItem('${item.id}');event.stopPropagation()">${expanded?phrase("Close"):phrase("Open")}</button>
      </div>
    </div>
    <div class="inventory-item-body">
      <div class="inventory-item-content">${inventoryItemDetailHtml(item,index)}</div>
    </div>
  </article>`;
}

function inventoryItemsAfterFilters(){
  ensureInventoryUiState();
  const search=state.inventoryUi.search.trim().toLowerCase();
  return state.inventory.filter(item=>{
    const sectionKey=inventorySectionKeyForItem(item);
    if(state.inventoryUi.filter!=="All"){
      const wanted=(inventoryCategoryDefs.find(def=>def.key===state.inventoryUi.filter)?.sectionKey)||"all";
      if(wanted!=="all"&&sectionKey!==wanted)return false;
    }
    if(state.inventoryUi.magicalOnly && !item.isMagical)return false;
    if(search){
      const haystack=[
        item.name,
        item.desc,
        itemCategory(item),
        categorySummary(item),
        ...(item.weapon?.properties||[]),
        ...(item.magicalProperties||[]).map(power=>`${power.name} ${power.description||""}`),
        ...Object.values(item.localized?.he||{}),
        ...Object.values(item.localized?.en||{}),
        ...(item.magicalProperties||[]).flatMap(power=>[
          ...Object.values(power.localized?.he||{}),
          ...Object.values(power.localized?.en||{})
        ])
      ].join(" ").toLowerCase();
      if(!haystack.includes(search))return false;
    }
    return true;
  });
}

function renderInventoryPage(){
  ensureInventoryUiState();

  const summary=inventorySummaryData();
  document.getElementById("inventorySummary").innerHTML=(appLanguage==="he"?[
    {icon:"🎒",value:summary.totalQty,label:"סך החפצים",sub:`סוגים שונים: ${summary.distinctCount}`},
    {icon:"⚖️",value:`${formatWeight(summary.totalWeight)} lb`,label:"משקל כולל",sub:inventoryLoadLabel(summary.totalWeight)},
    {icon:"✨",value:summary.magicalQty,label:"חפצים קסומים",sub:"מסומנים כקסומים"},
    {icon:"🧪",value:summary.consumableQty,label:"מתכלים",sub:"מוכנים לשימוש מהיר"}
  ]:[
    {icon:"🎒",value:summary.totalQty,label:"Total Items",sub:`Distinct: ${summary.distinctCount}`},
    {icon:"⚖️",value:`${formatWeight(summary.totalWeight)} lb`,label:"Total Weight",sub:inventoryLoadLabel(summary.totalWeight)},
    {icon:"✨",value:summary.magicalQty,label:"Magical Items",sub:"Marked as magical"},
    {icon:"🧪",value:summary.consumableQty,label:"Consumables",sub:"Ready for quick use"}
  ]).map(card=>`<div class="inventory-stat-card">
      <div class="inventory-stat-icon">${card.icon}</div>
      <div class="inventory-stat-copy">
        <b class="inventory-stat-value" dir="ltr">${card.value}</b>
        <span class="inventory-stat-label">${card.label}</span>
        <small class="inventory-stat-sub">${card.sub}</small>
      </div>
    </div>`).join("");

  const searchInput=document.getElementById("inventorySearchInput");
  if(searchInput && searchInput.value!==state.inventoryUi.search)searchInput.value=state.inventoryUi.search;
  const magicalCheckbox=document.getElementById("inventoryMagicalOnly");
  if(magicalCheckbox)magicalCheckbox.checked=state.inventoryUi.magicalOnly;

  document.getElementById("inventoryFilterChips").innerHTML=inventoryCategoryDefs.map(def=>`
    <button class="inventory-filter-chip ${state.inventoryUi.filter===def.key?"active":""}" onclick="setInventoryFilter('${def.key}')">${inventoryCategoryLabel(def)}</button>
  `).join("");

  const filteredItems=inventoryItemsAfterFilters();
  const grouped={
    weapons:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="weapons"),
    armor:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="armor"),
    consumables:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="consumables"),
    tools:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="tools"),
    general:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="general"),
    destroyed:filteredItems.filter(item=>inventorySectionKeyForItem(item)==="destroyed")
  };

  const sectionsOrder=["weapons","armor","consumables","tools","general","destroyed"];
  const visibleSections=sectionsOrder.filter(key=>grouped[key].length>0);

  if(!visibleSections.length){
    document.getElementById("inventorySections").innerHTML=`
      <div class="inventory-empty-state">
        <b>${appLanguage==="he"?"לא נמצאו חפצים תואמים.":"No matching items were found."}</b>
        <div class="tiny" style="margin-top:6px">${appLanguage==="he"?"נסה לנקות את החיפוש או לשנות את המסננים.":"Clear the search or change the filters."}</div>
      </div>`;
    return;
  }

  document.getElementById("inventorySections").innerHTML=visibleSections.map(sectionKey=>{
    const info=inventorySectionInfo(sectionKey);
    const items=grouped[sectionKey];
    const totalQty=items.reduce((sum,item)=>sum+(Number(item.qty)||0),0);
    const totalWeight=items.reduce((sum,item)=>sum+itemTotalWeight(item),0);
    const open=Boolean(state.inventoryUi.sections?.[sectionKey]);
    return `<section class="inventory-section ${open?"open":""} ${sectionKey==="destroyed"?"is-destroyed":""}" data-polish-disclosure data-disclosure-type="inventory-section" data-disclosure-key="${sectionKey}">
      <button class="inventory-section-toggle" aria-expanded="${open}" onclick="toggleInventorySection('${sectionKey}')">
        <div class="inventory-section-head">
          <div class="inventory-section-icon">${info.icon}</div>
          <div class="inventory-section-title-wrap">
            <b>${info.title} (${items.length})</b>
            <span>${info.subtitle}</span>
          </div>
        </div>
        <div class="inventory-section-meta">
          <span class="quantity-pill">x${totalQty}</span>
          <span class="tiny">${formatWeight(totalWeight)} "lb"</span>
          <span class="inventory-section-chevron">⌄</span>
        </div>
      </button>
      <div class="inventory-section-body">
        <div class="inventory-section-content">
          <div class="inventory-items-grid">${items.map(item=>inventoryItemCardHtml(item,state.inventory.indexOf(item))).join("")}</div>
          <div class="inventory-section-footnote">${appLanguage==="he"
            ?`סך הכול באזור: ${totalQty} יחידות · ${formatWeight(totalWeight)} lb`
            :`Section total: ${totalQty} item units · ${formatWeight(totalWeight)} lb`}</div>
        </div>
      </div>
    </section>`;
  }).join("");
  syncPolishDisclosureTree(document.getElementById("inventorySections"));
}

window.setInventorySearch=function(value){
  ensureInventoryUiState();
  state.inventoryUi.search=String(value||"");
  scheduleDeferredSave();
  queueInventoryPageRender();
};
window.setInventoryFilter=function(filterKey){
  ensureInventoryUiState();
  state.inventoryUi.filter=filterKey;
  save();
  renderInventoryPage();
};
window.toggleInventoryMagicalOnly=function(checked){
  ensureInventoryUiState();
  state.inventoryUi.magicalOnly=Boolean(checked);
  save();
  renderInventoryPage();
};
window.toggleInventorySection=function(sectionKey){
  ensureInventoryUiState();
  const open=!Boolean(state.inventoryUi.sections[sectionKey]);
  state.inventoryUi.sections[sectionKey]=open;
  save();
  const element=disclosureElement("inventory-section",sectionKey);
  if(element)animatePolishDisclosure(element,open);
  else renderInventoryPage();
};
window.toggleInventoryItem=function(itemId){
  ensureInventoryUiState();
  const open=!Boolean(state.inventoryUi.expandedItems[itemId]);
  state.inventoryUi.expandedItems[itemId]=open;
  save();
  const element=disclosureElement("inventory-item",itemId);
  if(element)animatePolishDisclosure(element,open);
  else renderInventoryPage();
};

window.editItem=function(index){openItemEditor(index);};
window.showItemDetails=function(index){
  const item=state.inventory[index];
  if(!item)return;
  const category=itemCategory(item);
  const he=appLanguage==="he";
  const status=item.destroyed?(he?"הרוס":"Destroyed"):(he?"פעיל":"Active");
  let details=`<div class="summary" data-localized-content dir="${he?"rtl":"ltr"}">
    <b>${he?"קטגוריה":"Category"}:</b> ${escapeHtml(term(category))}<br>
    <b>${he?"כמות":"Quantity"}:</b> x${item.qty}
    ${item.weight!==""?`<br><b>${he?"משקל":"Weight"}:</b> ${item.weight} ${he?"ליברות":"lb"}`:""}<br>
    <b>${he?"מצב":"Status"}:</b> ${status}
  </div>`;
  if(category==="Weapon"){
    details+=`<div class="magic-detail"><h3>${term("Weapon")}</h3>
      <p class="formula weapon-formula"><b>${phrase("To Hit")}:</b> ${escapeHtml(weaponAttackFormula(item))}</p>
      <p class="formula weapon-formula"><b>${phrase("Damage")}:</b> ${escapeHtml(weaponDamageDisplay(item))}</p>
      <p>${escapeHtml(weaponTag(item))}</p></div>`;
  }else if(category==="Armor"){
    const a=item.armor||{};
    details+=`<div class="summary" data-localized-content>
      <b>${he?"סוג":"Type"}:</b> ${escapeHtml(term(a.armorType))}<br>
      <b>${he?"דרג שריון בסיסי":"Base AC"}:</b> ${a.baseAC}<br>
      <b>${he?"תוסף לדרג השריון":"AC Bonus"}:</b> ${signed(a.acBonus||0)}<br>
      <b>${he?"הוספת זריזות":"Add DEX"}:</b> ${a.addDex?phrase("Yes"):phrase("No")}<br>
      <b>${he?"חיסרון בהתגנבות":"Stealth Disadvantage"}:</b> ${a.stealthDisadvantage?phrase("Yes"):phrase("No")}
    </div>`;
  }else if(category==="Consumable"){
    const c=item.consumable||{};
    details+=`<div class="summary" data-localized-content>
      <b>${he?"הפעלה":"Activation"}:</b> ${escapeHtml(term(c.activation))}<br>
      <b>${he?"השפעה":"Effect"}:</b> ${escapeHtml([term(c.effectType),c.formula||""].filter(Boolean).join(" "))}<br>
      ${escapeHtml(c.effect||"")}
    </div>`;
  }
  if(item.isMagical){
    const powers=item.magicalProperties||[];
    details+=`<h3 style="margin-top:15px">${he?"תכונות קסומות":"Magical Properties"}</h3>`+
      (powers.length?powers.map((p,powerIndex)=>`<div class="magic-detail ${p.lost?"power-lost":""}" data-localized-content>
        <h3>${bidiAutoHtml(p.name)}</h3>
        <div class="tiny">${escapeHtml(term(p.kind))} · ${escapeHtml(term(p.activation))}</div>
        <p>${escapeHtml(p.description||(he?"לא הוזן תיאור.":"No description provided."))}</p>
        ${p.effectFormula||p.effectType?`<p class="formula">${escapeHtml([p.effectFormula,term(p.effectType)].filter(Boolean).join(" "))}</p>`:""}
        <p><b>${he?"שימושים":"Uses"}:</b> ${powerUsesText(p)}<br>
        <b>${he?"חידוש":"Recharge"}:</b> ${escapeHtml(combatPowerRechargeText(p))}</p>
        ${powerUseTracker(p)}
        ${p.depletionRisk.enabled?`<p><b>${he?"סיכון בשימוש האחרון":"Last-use risk"}:</b> ${he?"גלגל":"Roll"} ${p.depletionRisk.die}; ${he?"ב־":"on "}${p.depletionRisk.failOn}, ${escapeHtml(depletionOutcomeLabel(p.depletionRisk.outcome))}.</p>`:""}
        ${p.showInCombat&&!p.lost&&p.kind!=="Passive"?`<button class="small-btn primary" onclick="useMagicPower(${index},${powerIndex})" ${powerCanUse(p)?"":"disabled"}>${phrase("Use")}</button>`:""}
      </div>`).join(""):`<div class="tiny">${he?"אין כוחות מוגדרים.":"No powers are defined."}</div>`);
  }
  details+=item.desc?`<h3 style="margin-top:15px">${phrase("Description")}</h3><p data-localized-content>${escapeHtml(item.desc)}</p>`:"";
  document.getElementById("infoTitle").textContent=item.name;
  document.getElementById("infoBody").innerHTML=details;
  openEl("infoModal");
};
window.showWeaponItem=function(index){showItemDetails(index);};

let pendingDepletion=null;
window.useMagicPower=function(itemIndex,powerIndex){
  const item=state.inventory[itemIndex];
  const power=item?.magicalProperties?.[powerIndex];
  if(!item||!power||item.destroyed||power.lost){
    toast(appLanguage==="he"?"הכוח אינו זמין":"The power is unavailable");
    return;
  }
  const max=Number(power.maxUses)||0;
  const cost=Math.max(1,Number(power.useCost)||1);
  if(max>0&&Number(power.currentUses)<cost){
    toast(appLanguage==="he"?"לא נשארו מספיק שימושים":"Not enough uses remain");
    return;
  }
  const before=Number(power.currentUses)||0;
  if(max>0)power.currentUses=Math.max(0,before-cost);
  state.hpLastChange=appLanguage==="he"
    ?`נעשה שימוש ב־${power.name} מתוך ${item.name}${max>0?`; נשארו ${power.currentUses}/${power.maxUses}`:""}.`
    :`${power.name} from ${item.name} was used${max>0?`; ${power.currentUses}/${power.maxUses} remain`:""}.`;
  save();render();
  closeEl("infoModal");
  if(max>0&&before>0&&power.currentUses===0&&power.depletionRisk?.enabled){
    pendingDepletion={itemId:item.id,powerId:power.id};
    const die=power.depletionRisk.die||"d20";
    depletionTitle.textContent=appLanguage==="he"
      ?`השימוש האחרון: ${power.name}`
      :`Final Use: ${power.name}`;
    depletionText.innerHTML=appLanguage==="he"?`
      <p data-localized-content>השתמשת בשימוש האחרון של <b>${escapeHtml(power.name)}</b> מתוך <b>${escapeHtml(item.name)}</b>.</p>
      <div class="summary" data-localized-content>גלגל <b>${die}</b>. אם התוצאה היא <b>${power.depletionRisk.failOn}</b>, לחץ על <b>הפעל את העונש</b>.</div>
      <p data-localized-content><b>העונש שהוגדר:</b> ${escapeHtml(depletionOutcomeLabel(power.depletionRisk.outcome))}.</p>`
      :`<p data-localized-content>You used the final charge of <b>${escapeHtml(power.name)}</b> from <b>${escapeHtml(item.name)}</b>.</p>
      <div class="summary" data-localized-content>Roll <b>${die}</b>. If the result is <b>${power.depletionRisk.failOn}</b>, press <b>Apply Penalty</b>.</div>
      <p data-localized-content><b>Configured penalty:</b> ${escapeHtml(depletionOutcomeLabel(power.depletionRisk.outcome))}.</p>`;
    openEl("depletionModal");
  }else{
    toast(appLanguage==="he"?`${power.name} הופעל`:`${power.name} activated`);
  }
};
function resolveDepletion(applyPenalty=false){
  if(!pendingDepletion){closeEl("depletionModal");return;}
  const found=findPowerByIds(pendingDepletion.itemId,pendingDepletion.powerId);
  pendingDepletion=null;
  if(!found){closeEl("depletionModal");return;}
  const {item,power}=found;

  if(!applyPenalty){
    closeEl("depletionModal");
    toast(appLanguage==="he"?"העונש לא הופעל":"The penalty was not applied");
    return;
  }

  const outcome=power.depletionRisk.outcome;
  let message="";
  if(outcome==="property"){
    power.lost=true;
    message=appLanguage==="he"?`${power.name} נעלם מהחפץ.`:`${power.name} disappeared from the item.`;
  }else if(outcome==="allMagic"){
    (item.magicalProperties||[]).forEach(entry=>entry.lost=true);
    message=appLanguage==="he"
      ?`כל הכוחות הקסומים של ${item.name} נעלמו.`
      :`All magical powers of ${item.name} disappeared.`;
  }else if(outcome==="destroyItem"){
    item.destroyed=true;
    message=appLanguage==="he"
      ?`${item.name} מסומן כהרוס.`
      :`${item.name} is marked as Destroyed.`;
  }else{
    message=appLanguage==="he"
      ?"העונש הועבר להחלטת המנחה."
      :"The penalty is left to the Game Master.";
  }

  save();render();closeEl("depletionModal");toast(message);
}
let rechargeQueue=[];
function eligibleRecharge(power,restType){
  if(power.lost||(Number(power.maxUses)||0)<=0||power.currentUses>=power.maxUses)return false;
  if(restType==="Short Rest")return ["Short Rest","Short or Long Rest"].includes(power.recharge);
  if(restType==="Long Rest")return ["Long Rest","Short or Long Rest","Short Rest"].includes(power.recharge);
  return false;
}
function rechargeMagicPowers(restType){
  let changed=0;
  state.inventory.forEach(item=>{
    if(item.destroyed)return;
    (item.magicalProperties||[]).forEach(power=>{
      if(!eligibleRecharge(power,restType))return;
      if(power.rechargeMode==="Dice"){
        rechargeQueue.push({itemId:item.id,powerId:power.id,formula:power.rechargeFormula||"custom roll"});
      }else{
        const before=power.currentUses;
        if(power.rechargeMode==="Fixed")power.currentUses=Math.min(power.maxUses,power.currentUses+Math.max(0,Number(power.rechargeValue)||0));
        else power.currentUses=power.maxUses;
        if(power.currentUses!==before)changed++;
      }
    });
  });
  return changed;
}
function openNextRechargePrompt(){
  if(!rechargeQueue.length){closeEl("rechargeModal");save();render();return;}
  const entry=rechargeQueue[0];
  const found=findPowerByIds(entry.itemId,entry.powerId);
  if(!found){rechargeQueue.shift();openNextRechargePrompt();return;}
  const {item,power}=found;
  rechargeAmountInput.value="";
  rechargePromptText.innerHTML=appLanguage==="he"?`
    <p data-localized-content><b>${escapeHtml(power.name)}</b> מתוך ${escapeHtml(item.name)} מתחדש לפי:</p>
    <div class="summary formula">${escapeHtml(entry.formula)}</div>
    <p data-localized-content>גלגל פיזית והזן כמה שימושים חזרו.</p>`
    :`<p data-localized-content><b>${escapeHtml(power.name)}</b> from ${escapeHtml(item.name)} recharges according to:</p>
    <div class="summary formula">${escapeHtml(entry.formula)}</div>
    <p data-localized-content>Physically roll and enter how many uses were restored.</p>`;
  rechargePreview.textContent=appLanguage==="he"
    ?`כרגע: ${power.currentUses}/${power.maxUses}`
    :`Current: ${power.currentUses}/${power.maxUses}`;
  openEl("rechargeModal");
}



let editingTraitIndex=-1;

function refreshTraitResourceOptions(selectedId=""){
  const select=document.getElementById("traitExistingResource");
  if(!select)return;
  select.innerHTML=state.resources
    .filter(resource=>resource.systemKey!=="hitDice")
    .map(resource=>`<option value="${escapeHtml(resource.id)}" ${resource.id===selectedId?"selected":""}>${escapeHtml(resource.name)} — ${resource.current}/${resource.max}</option>`)
    .join("");
  if(!select.innerHTML)select.innerHTML=`<option value="">${appLanguage==="he"?"אין משאבים זמינים":"No Resources are available"}</option>`;
}

function renderTraitManager(){
  const list=document.getElementById("traitManagerList");
  if(!list)return;
  list.innerHTML=state.traits.length?state.traits.map((trait,index)=>{
    const linked=traitLinkedResource(trait);
    return `<div class="trait-manager-row">
      <div>
        <b>${escapeHtml(trait.name)}</b>
        <div><span class="trait-category ${traitCategoryClass(trait.category)}">${escapeHtml(term(trait.category))}</span></div>
        <div class="resource-meta-line">${escapeHtml(term(trait.activation))} · ${escapeHtml(traitSourceText(trait))}</div>
        ${linked?`<span class="trait-linked-resource">${escapeHtml(linked.name)} ${linked.current}/${linked.max}</span>`:""}
      </div>
      <div class="trait-manager-actions">
        <button class="small-btn" onclick="openTraitEditor(${index})">${phrase("Edit")}</button>
        <button class="danger-btn" onclick="deleteTrait(${index})">${phrase("Delete")}</button>
      </div>
    </div>`;
  }).join(""):`<div class="empty-state">${appLanguage==="he"
    ?"עדיין לא הוספת Feats או Features."
    :"No Feats or Features have been added yet."}</div>`;
}

function openTraitManager(){
  renderTraitManager();
  openEl("traitManagerModal");
}

function ensureTraitUiState(){
  state.traitUi=state.traitUi||{};
  state.traitUi.search=String(state.traitUi.search||"");
  state.traitUi.filter=state.traitUi.filter||"All";
  state.traitUi.sections={feat:true,"class feature":true,"subclass feature":false,"racial trait":false,homebrew:false,other:false,...(state.traitUi.sections||{})};
  state.traitUi.expanded=state.traitUi.expanded||{};
}
function traitCategoryMeta(category){
  const key=String(category||'Other').toLowerCase();
  const he=appLanguage==="he";
  const meta={
    'feat':{title:'Feats',subtitle:he?'יכולות שנבחרו בנפרד':'Abilities chosen separately',icon:'🛡️',filter:'Feats'},
    'class feature':{title:he?'יכולות מקצוע':'Class Features',subtitle:he?'יכולות שמגיעות מהמקצוע':'Abilities granted by the class',icon:'⚔️',filter:'Class'},
    'subclass feature':{title:he?'יכולות תת־מקצוע':'Subclass Features',subtitle:he?'יכולות שמגיעות מתת־המקצוע':'Abilities granted by the subclass',icon:'✦',filter:'Subclass'},
    'racial trait':{title:he?'תכונות גזע':'Racial Traits',subtitle:he?'יכולות שמגיעות מהגזע':'Abilities granted by the race',icon:'🐾',filter:'Racial'},
    'homebrew':{title:he?'תוכן ביתי':'Homebrew',subtitle:he?'תוכן מותאם אישית לקמפיין':'Custom campaign content',icon:'📘',filter:'Homebrew'},
    'other':{title:he?'אחר':'Other',subtitle:he?'יכולות נוספות':'Additional abilities',icon:'⋯',filter:'Other'}
  };
  return meta[key]||meta.other;
}
function traitSectionKey(category){
  return String(category||'Other').toLowerCase();
}
function traitActivationClassName(activation){
  return 'activation-'+String(activation||'Special').toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-+|-+$/g,'');
}
function traitCardIconClass(category){
  return 'trait-icon-'+String(category||'Other').toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-+|-+$/g,'');
}
function traitFilterMatches(trait){
  const filter=state.traitUi.filter||'All';
  if(filter==='All')return true;
  if(filter==='Feats')return trait.category==='Feat';
  if(filter==='Class')return trait.category==='Class Feature';
  if(filter==='Subclass')return trait.category==='Subclass Feature';
  if(filter==='Racial')return trait.category==='Racial Trait';
  if(filter==='Homebrew')return trait.category==='Homebrew';
  if(filter==='Passive')return trait.activation==='Passive';
  if(filter==='Action')return trait.activation==='Action';
  if(filter==='Bonus Action')return trait.activation==='Bonus Action';
  if(filter==='Reaction')return trait.activation==='Reaction';
  return true;
}
function traitSearchMatches(trait){
  const q=state.traitUi.search.trim().toLowerCase();
  if(!q)return true;
  const linked=traitLinkedResource(trait);
  const haystack=[
    trait.name,trait.category,trait.activation,trait.shortDesc,trait.description,trait.trigger,
    trait.sourceType,trait.sourceName,linked?.name||'',
    ...Object.values(trait.localized?.he||{}),
    ...Object.values(trait.localized?.en||{})
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}
function traitIsCombat(trait){
  return Boolean(trait.showInCombat)||['Action','Bonus Action','Reaction'].includes(trait.activation);
}
function traitSummaryStats(traits){
  return {
    total:traits.length,
    passive:traits.filter(t=>t.activation==='Passive').length,
    combat:traits.filter(traitIsCombat).length,
    linked:traits.filter(t=>!!traitLinkedResource(t)).length
  };
}
function renderTraitSummary(stats){
  const summary=document.getElementById('traitPageSummary');
  if(!summary)return;
  const cards=appLanguage==="he"?[
    {icon:'🛡️',value:stats.total,label:'סך היכולות',sub:'כל ה־Feats וה־Features'},
    {icon:'✨',value:stats.passive,label:'יכולות סבילות',sub:'אינן דורשות הפעלה'},
    {icon:'⚔️',value:stats.combat,label:'יכולות קרב',sub:'מוצגות במסך הקרב'},
    {icon:'📖',value:stats.linked,label:'משאבים מקושרים',sub:'יכולות שמחוברות למונה'}
  ]:[
    {icon:'🛡️',value:stats.total,label:'Total Features',sub:'All Feats and Features'},
    {icon:'✨',value:stats.passive,label:'Passive Abilities',sub:'No activation required'},
    {icon:'⚔️',value:stats.combat,label:'Combat Abilities',sub:'Shown in Combat'},
    {icon:'📖',value:stats.linked,label:'Linked Resources',sub:'Abilities connected to a counter'}
  ];
  summary.innerHTML=cards.map(card=>`<div class="feats-summary-card">
    <div class="feats-summary-icon">${card.icon}</div>
    <div class="feats-summary-copy">
      <b class="feats-summary-value">${card.value}</b>
      <span class="feats-summary-label">${card.label}</span>
      <small class="feats-summary-sub">${card.sub}</small>
    </div>
  </div>`).join('');
}
function renderTraitFilterChips(){
  const wrap=document.getElementById('traitFilterChips');
  if(!wrap)return;
  const filters=['All','Feats','Class','Subclass','Racial','Homebrew','Passive','Action','Bonus Action','Reaction'];
  const labels={
    All:appLanguage==="he"?"הכול":"All",
    Feats:"Feats",
    Class:appLanguage==="he"?"מקצוע":"Class",
    Subclass:appLanguage==="he"?"תת־מקצוע":"Subclass",
    Racial:appLanguage==="he"?"גזע":"Racial",
    Homebrew:appLanguage==="he"?"תוכן ביתי":"Homebrew",
    Passive:term("Passive"),Action:term("Action"),
    "Bonus Action":term("Bonus Action"),Reaction:term("Reaction")
  };
  wrap.innerHTML=filters.map(filter=>`<button class="feats-filter-chip ${state.traitUi.filter===filter?'active':''}" onclick="setTraitFilter('${filter.replace(/'/g,"\'")}')">${labels[filter]||filter}</button>`).join('');
}
function traitDetailLines(trait){
  const linked=traitLinkedResource(trait);
  return appLanguage==="he"?[
    ["תנאי הפעלה",trait.trigger||"בעת הצורך"],
    ["סוג הפעלה",term(trait.activation)],
    ["מקור",traitSourceText(trait)],
    ["רמת פתיחה",trait.unlockLevel?formatLevel(trait.unlockLevel):"—"],
    ["רמות שדרוג",trait.upgradeLevels||"—"],
    ["הצגה בקרב",trait.showInCombat?"כן":"לא"],
    ["משאב מקושר",linked?linked.name:"ללא משאב"]
  ]:[
    ["Trigger",trait.trigger||"As needed"],
    ["Activation",term(trait.activation)],
    ["Source",traitSourceText(trait)],
    ["Unlock Level",trait.unlockLevel?formatLevel(trait.unlockLevel):"—"],
    ["Upgrade Levels",trait.upgradeLevels||"—"],
    ["Show in Combat",trait.showInCombat?"Yes":"No"],
    ["Linked Resource",linked?linked.name:"No Resource"]
  ];
}
function renderTraitResourceCard(linked){
  if(!linked)return '';
  return `<div class="trait-resource-box">
    <div class="trait-resource-head">
      <div>
        <div class="trait-resource-name">${bidiAutoHtml(linked.name)}</div>
        <div class="trait-resource-sub" data-localized-content>${escapeHtml([term(linked.sourceType),linked.sourceName].filter(Boolean).join(' · ')||(appLanguage==="he"?"משאב שמקושר ליכולת הזאת":"Resource linked to this Feature"))}</div>
      </div>
      <div class="trait-resource-uses">${linked.current} / ${linked.max}</div>
    </div>
    <div class="resource-bubbles">${resourceBubbles(linked)}</div>
    <div class="trait-resource-recharge">
      <span class="trait-recharge-pill">${ltrHtml(resourceRechargeText(linked))}</span>
      <span class="trait-recharge-pill">${bidiAutoHtml(formatCost(linked.useCost))}</span>
      <span class="trait-recharge-pill">${bidiAutoHtml(term(linked.action||'Special'))}</span>
    </div>
  </div>`;
}
function traitCardHtml(trait,index){
  const linked=traitLinkedResource(trait);
  const expanded=Boolean(state.traitUi.expanded?.[trait.id]);
  const icon=traitCategoryMeta(trait.category).icon;
  return `<article class="trait-page-card ${expanded?'open':''}" data-polish-disclosure data-disclosure-type="trait-card" data-disclosure-key="${escapeHtml(trait.id)}">
    <div class="trait-card-header">
      <div class="trait-card-main">
        <div class="trait-card-top">
          <div class="trait-card-title-wrap">
            <div class="trait-card-icon ${traitCardIconClass(trait.category)}">${icon}</div>
            <div class="trait-card-name-wrap">
              <h4>${bidiAutoHtml(trait.name)}</h4>
              <div class="trait-card-badges">
                <span class="trait-badge">${escapeHtml(term(trait.category))}</span>
                <span class="trait-badge ${traitActivationClassName(trait.activation)}">${escapeHtml(term(trait.activation))}</span>
                ${traitIsCombat(trait)?`<span class="trait-badge combat">${appLanguage==="he"?"קרב":"Combat"}</span>`:''}
                ${linked?`<span class="trait-badge resource">${appLanguage==="he"?"משאב מקושר":"Linked Resource"}</span>`:''}
              </div>
            </div>
          </div>
        </div>
        <div class="trait-card-desc" data-localized-content>${escapeHtml(trait.shortDesc||trait.description||(appLanguage==="he"?"לא הוזן תקציר.":"No summary provided."))}</div>
        <div class="trait-page-meta" data-localized-content>${escapeHtml(traitSourceText(trait))}${linked?` · ${escapeHtml(linked.name)} ${linked.current}/${linked.max}`:''}</div>
        ${trait.trigger?`<div class="trait-page-trigger" data-localized-content><b>${appLanguage==="he"?"תנאי הפעלה:":"Trigger:"}</b> ${escapeHtml(trait.trigger)}</div>`:''}
      </div>
      <div class="trait-card-actions">
        <button class="small-btn trait-toggle-btn" aria-expanded="${expanded}" onclick="toggleTraitCard('${trait.id}')">${expanded?phrase("Close"):phrase("Open")}</button>
        <button class="small-btn" onclick="openTraitEditor(${index})">${phrase("Edit")}</button>
      </div>
    </div>
    <div class="trait-card-body">
      <div class="trait-card-content">
        <div class="trait-detail-layout">
          <div>
            <div class="trait-detail-box">
              <h5>${appLanguage==="he"?"תקציר קצר":"Short Summary"}</h5>
              <p data-localized-content>${escapeHtml(trait.shortDesc||(appLanguage==="he"?"לא הוזן תקציר.":"No summary provided."))}</p>
            </div>
            <div class="trait-detail-box">
              <h5>${appLanguage==="he"?"תיאור מלא":"Full Description"}</h5>
              <p data-localized-content>${escapeHtml(trait.description||trait.shortDesc||(appLanguage==="he"?"לא הוזן תיאור.":"No description provided."))}</p>
            </div>
          </div>
          <div>
            <div class="trait-detail-box">
              <h5>${phrase("Details")}</h5>
              <div class="trait-detail-list">
                ${traitDetailLines(trait).map(([label,val])=>`<div class="trait-detail-line"><span>${ltrHtml(label)}</span><b dir="auto">${mixedTextHtml(String(val))}</b></div>`).join('')}
              </div>
            </div>
            ${renderTraitResourceCard(linked)}
          </div>
        </div>
      </div>
    </div>
  </article>`;
}
function renderTraitPage(){
  ensureTraitUiState();
  const input=document.getElementById('traitSearchInput');
  if(input && input.value!==state.traitUi.search)input.value=state.traitUi.search;

  const visibleTraits=state.traits.filter(trait=>traitSearchMatches(trait) && traitFilterMatches(trait));
  renderTraitSummary(traitSummaryStats(state.traits));
  renderTraitFilterChips();

  const container=document.getElementById('traitPageGroups');
  if(!container)return;
  const orderedCategories=['Feat','Class Feature','Subclass Feature','Racial Trait','Homebrew','Other'];
  const grouped=orderedCategories.map(category=>({
    category,
    key:traitSectionKey(category),
    meta:traitCategoryMeta(category),
    entries:state.traits.map((trait,index)=>({trait,index})).filter(entry=>entry.trait.category===category && traitSearchMatches(entry.trait) && traitFilterMatches(entry.trait))
  })).filter(group=>group.entries.length);

  if(!grouped.length){
    container.innerHTML=`<div class="trait-empty-state"><b>${appLanguage==="he"
      ?"לא נמצאו Feats או Features תואמים."
      :"No matching Feats or Features were found."}</b><div class="tiny" style="margin-top:6px">${appLanguage==="he"
      ?"נסה לנקות את החיפוש או לשנות את המסננים."
      :"Clear the search or change the filters."}</div></div>`;
    return;
  }

  container.innerHTML=grouped.map(group=>{
    const open=Boolean(state.traitUi.sections?.[group.key]);
    const combatCount=group.entries.filter(entry=>traitIsCombat(entry.trait)).length;
    return `<section class="trait-page-section ${open?'open':''}" data-polish-disclosure data-disclosure-type="trait-section" data-disclosure-key="${group.key}">
      <button class="trait-page-section-toggle" aria-expanded="${open}" onclick="toggleTraitSection('${group.key}')">
        <div class="trait-page-section-head">
          <div class="trait-page-section-icon">${group.meta.icon}</div>
          <div class="trait-page-section-title-wrap">
            <h3>${group.meta.title}</h3>
            <span>${group.meta.subtitle}</span>
          </div>
        </div>
        <div class="trait-page-section-meta">
          <span class="quantity-pill">${group.entries.length}</span>
          <span class="tiny">${appLanguage==="he"?"בקרב":"Combat"} ${combatCount}</span>
          <span class="trait-page-chevron">⌄</span>
        </div>
      </button>
      <div class="trait-page-section-body">
        <div class="trait-page-section-content">
          <div class="trait-page-grid">${group.entries.map(({trait,index})=>traitCardHtml(trait,index)).join('')}</div>
          <div class="trait-section-foot">${appLanguage==="he"
            ?`${group.entries.length} רשומות · ${combatCount} מוצגות בקרב`
            :`${group.entries.length} entries · ${combatCount} visible in Combat`}</div>
        </div>
      </div>
    </section>`;
  }).join('');
  syncPolishDisclosureTree(container);
}
window.setTraitSearch=function(value){
  ensureTraitUiState();
  state.traitUi.search=String(value||'');
  scheduleDeferredSave();
  queueTraitPageRender();
};
window.setTraitFilter=function(filter){
  ensureTraitUiState();
  state.traitUi.filter=String(filter||'All');
  save();
  renderTraitPage();
};
window.toggleTraitSection=function(sectionKey){
  ensureTraitUiState();
  const open=!Boolean(state.traitUi.sections[sectionKey]);
  state.traitUi.sections[sectionKey]=open;
  save();
  const element=disclosureElement("trait-section",sectionKey);
  if(element)animatePolishDisclosure(element,open);
  else renderTraitPage();
};
window.toggleTraitCard=function(traitId){
  ensureTraitUiState();
  const open=!Boolean(state.traitUi.expanded[traitId]);
  state.traitUi.expanded[traitId]=open;
  save();
  const element=disclosureElement("trait-card",traitId);
  if(element)animatePolishDisclosure(element,open);
  else renderTraitPage();
};


function updateTraitResourceFields(){
  const mode=traitResourceMode.value;
  traitExistingResourceWrap.classList.toggle("hidden",mode!=="existing");
  traitNewResourceWrap.classList.toggle("hidden",mode!=="create");
  updateTraitRechargeFields();
  updateTraitEditorPreview();
}

function updateTraitRechargeFields(){
  const hidden=traitResourceRechargeMode.value!=="Fixed"||["Manual","None"].includes(traitResourceRecharge.value);
  traitResourceRechargeValueWrap.classList.toggle("hidden",hidden);
}

window.openTraitEditor=function(index=-1){
  editingTraitIndex=index;
  const trait=index>=0?state.traits[index]:normalizeTrait({
    name:"",category:"Class Feature",activation:"Passive",shortDesc:"",description:"",
    trigger:"",showInCombat:true,sourceType:"Class",sourceName:"",unlockLevel:"",upgradeLevels:"",resourceId:""
  });
  traitEditorTitle.textContent=index>=0
    ?`${appLanguage==="he"?"עריכת":"Edit"} ${trait.name}`
    :(appLanguage==="he"?"הוספת כישרון / יכולת":"Add Feat / Feature");
  traitNameHe.value=trait.localized?.he?.name||"";
  traitNameEn.value=trait.localized?.en?.name||trait.localized?.he?.name||"";
  traitUseHebrewName.checked=Boolean(trait.useHebrewName);
  traitCategory.value=trait.category;
  traitActivation.value=trait.activation;
  traitShortDescHe.value=trait.localized?.he?.shortDesc||"";
  traitShortDescEn.value=trait.localized?.en?.shortDesc||trait.localized?.he?.shortDesc||"";
  traitDescriptionHe.value=trait.localized?.he?.description||"";
  traitDescriptionEn.value=trait.localized?.en?.description||trait.localized?.he?.description||"";
  traitTriggerHe.value=trait.localized?.he?.trigger||"";
  traitTriggerEn.value=trait.localized?.en?.trigger||trait.localized?.he?.trigger||"";
  traitShowCombat.checked=trait.showInCombat;
  traitSourceType.value=trait.sourceType;
  traitSourceNameHe.value=trait.localized?.he?.sourceName||"";
  traitSourceNameEn.value=trait.localized?.en?.sourceName||trait.localized?.he?.sourceName||"";
  traitUnlockLevel.value=trait.unlockLevel;
  traitUpgradeLevels.value=trait.upgradeLevels||"";
  refreshTraitResourceOptions(trait.resourceId);
  traitResourceMode.value=trait.resourceId?"existing":"none";
  traitResourceCurrent.value=1;
  traitResourceMax.value=1;
  traitResourceCost.value=1;
  traitResourceRecharge.value="Long Rest";
  traitResourceRechargeMode.value="All";
  traitResourceRechargeValue.value=1;
  updateTraitResourceFields();
  openEl("traitEditModal");
  requestAnimationFrame(updateTraitEditorPreview);
};

window.deleteTrait=function(index){
  const trait=state.traits[index];
  if(!trait)return;
  if(!confirm(appLanguage==="he"
    ?`למחוק את ${trait.name}? המשאב המקושר, אם קיים, יישאר.`
    :`Delete ${trait.name}? The linked Resource, if one exists, will remain.`))return;
  state.traits.splice(index,1);
  save();render();renderTraitManager();toast(appLanguage==="he"
    ?"ה־Feat או ה־Feature נמחקו"
    :"The Feat or Feature was deleted");
};

let editingResourceIndex=-1;
function renderResourceManager(){
  const list=document.getElementById("resourceManagerList");
  if(!list)return;
  list.innerHTML=state.resources.map((resource,index)=>`
    <div class="resource-manager-row">
      <div>
        <b>${escapeHtml(resource.name)}${resource.systemKey?`<span class="system-badge">${phrase("System")}</span>`:""}</b>
        <div class="resource-meta-line">${escapeHtml(term(resource.action))} · ${escapeHtml(resourceRechargeText(resource))} · ${escapeHtml(formatCost(resource.useCost))}</div>
        <div class="resource-bubbles">${resourceBubbles(resource)}</div>
      </div>
      <div class="resource-manager-actions">
        <button class="small-btn" onclick="openResourceEditor(${index})">${phrase("Edit")}</button>
        <button class="danger-btn" onclick="deleteResource(${index})" ${resource.systemKey==="hitDice"?"disabled":""}>${phrase("Delete")}</button>
      </div>
    </div>`).join("") || `<div class="empty-state">${appLanguage==="he"
      ?"עדיין לא הוספת משאבים."
      :"No Resources have been added yet."}</div>`;
}
function openResourceManager(){
  renderResourceManager();
  openEl("resourceManagerModal");
}
window.openResourceEditor=function(index=-1){
  editingResourceIndex=index;
  const resource=index>=0?state.resources[index]:normalizeResource({
    name:"",current:1,max:1,useCost:1,recharge:"Long Rest",rechargeMode:"All",
    rechargeValue:1,action:"Special",showInCombat:true,desc:"",
    sourceType:"Homebrew",sourceName:"",unlockLevel:"",upgradeLevels:""
  });
  resourceEditorTitle.textContent=index>=0
    ?`${appLanguage==="he"?"עריכת":"Edit"} ${resource.name}`
    :(appLanguage==="he"?"הוספת משאב":"Add Resource");
  resourceNameHe.value=resource.localized?.he?.name||"";
  resourceNameEn.value=resource.localized?.en?.name||resource.localized?.he?.name||"";
  resourceUseHebrewName.checked=Boolean(resource.useHebrewName);
  resourceDescHe.value=resource.localized?.he?.desc||"";
  resourceDescEn.value=resource.localized?.en?.desc||resource.localized?.he?.desc||"";
  resourceAction.value=resource.action;
  resourceUseCost.value=resource.useCost;
  resourceCurrent.value=resource.current;
  resourceMax.value=resource.max;
  resourceShowCombat.checked=resource.showInCombat;
  resourceRecharge.value=resource.recharge;
  resourceRechargeMode.value=resource.rechargeMode;
  resourceRechargeValue.value=resource.rechargeValue;
  resourceSourceType.value=resource.sourceType;
  resourceSourceNameHe.value=resource.localized?.he?.sourceName||"";
  resourceSourceNameEn.value=resource.localized?.en?.sourceName||resource.localized?.he?.sourceName||"";
  resourceUnlockLevel.value=resource.unlockLevel;
  resourceUpgradeLevels.value=resource.upgradeLevels;
  updateResourceRechargeFields();
  openEl("resourceEditModal");
};
window.deleteResource=function(index){
  const resource=state.resources[index];
  if(!resource)return;
  if(resource.systemKey==="hitDice"){
    toast(appLanguage==="he"
      ?"קוביות פגיעה הן משאב מערכת ולא ניתן למחוק אותן"
      :"Hit Dice are a system Resource and cannot be deleted");
    return;
  }
  if(!confirm(appLanguage==="he"?`למחוק את ${resource.name}?`:`Delete ${resource.name}?`))return;
  const deletedId=resource.id;
  state.resources.splice(index,1);
  state.traits.forEach(trait=>{if(trait.resourceId===deletedId)trait.resourceId="";});
  save();render();renderResourceManager();toast(appLanguage==="he"
    ?"המשאב נמחק והקישורים אליו הוסרו"
    :"The Resource was deleted and its links were removed");
};
function updateResourceRechargeFields(){
  const hidden=resourceRechargeMode.value!=="Fixed"||["Manual","None"].includes(resourceRecharge.value);
  resourceRechargeValueWrap.classList.toggle("hidden",hidden);
}


function weaponMagicSummary(item){
  if(!item?.isMagical)return "";
  const attack=passiveMagicBonus(item,"attackBonus");
  const damage=passiveMagicBonus(item,"damageBonus");
  const active=(item.magicalProperties||[]).filter(power=>!power.lost&&power.kind!=="Passive");
  const parts=[appLanguage==="he"?"קסום":"Magical"];
  if(attack||damage){
    if(attack===damage){
      parts.push(appLanguage==="he"
        ?`${signed(attack)} לגלגול פגיעה ולנזק`
        :`${signed(attack)} to hit and damage`);
    }else{
      if(attack)parts.push(appLanguage==="he"?`${signed(attack)} לגלגול פגיעה`:`${signed(attack)} to hit`);
      if(damage)parts.push(appLanguage==="he"?`${signed(damage)} לנזק`:`${signed(damage)} damage`);
    }
  }
  if(active.length){
    parts.push(appLanguage==="he"
      ?`${active.length} ${active.length===1?"כוח פעיל":"כוחות פעילים"}`
      :`${active.length} active ${active.length===1?"power":"powers"}`);
  }
  return parts.join(" · ");
}


function combatActivationLabel(value){
  const raw=(value||"Special").toString().trim();
  return term(raw||"Special");
}

function combatActivationBucket(value){
  const raw=(value||"Special").toString().toLowerCase();
  if(raw.includes("bonus")||raw.includes("בונוס"))return "bonus";
  if(raw.includes("reaction")||raw.includes("תגובה"))return "reaction";
  if(raw.includes("passive")||raw.includes("סביל"))return "passive";
  if(raw.includes("action")||raw.includes("פעולה"))return "action";
  return "passive";
}

function combatGroupMeta(bucket){
  const he=appLanguage==="he";
  const meta={
    action:{title:he?"פעולות":"Actions",subtitle:he?"יכולות שדורשות פעולה":"Abilities that require an Action",order:1},
    bonus:{title:he?"פעולות בונוס":"Bonus Actions",subtitle:he?"יכולות שדורשות פעולת בונוס":"Abilities that require a Bonus Action",order:2},
    reaction:{title:he?"תגובות":"Reactions",subtitle:he?"יכולות שמופעלות בתגובה לתנאי":"Abilities triggered in response to an event",order:3},
    passive:{title:he?"סביל ומיוחד":"Passive & Special",subtitle:he?"יכולות סבילות או בעלות הפעלה מיוחדת":"Passive abilities and special activations",order:4}
  };
  return meta[bucket]||meta.passive;
}

function linkedCombatTrait(resource){
  return state.traits.find(trait=>trait.resourceId===resource.id&&trait.showInCombat)||null;
}

const combatAccordionMotion={
  duration:320,
  easing:"cubic-bezier(.22,.8,.22,1)"
};

function prefersReducedCombatMotion(){
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

function syncCombatSection(section,open){
  if(!section)return;
  const body=section.querySelector(".combat-section-body");
  const content=section.querySelector(".combat-section-content");
  const toggle=section.querySelector(".combat-section-toggle");
  section.classList.toggle("open",Boolean(open));
  section.classList.remove("accordion-animating");
  delete section.dataset.animating;
  toggle?.setAttribute("aria-expanded",String(Boolean(open)));
  if(body){
    body.style.transition="";
    body.style.height=open?"auto":"0px";
    body.style.opacity=open?"1":"0";
    body.style.willChange="";
  }
  if(content){
    content.style.transition="";
    content.style.opacity="";
    content.style.transform="";
    content.style.willChange="";
  }
}

function finishCombatSectionAnimation(section,open,token){
  if(!section||section.dataset.animationToken!==token)return;
  const body=section.querySelector(".combat-section-body");
  const content=section.querySelector(".combat-section-content");
  section.classList.toggle("open",Boolean(open));
  section.classList.remove("accordion-animating");
  delete section.dataset.animating;
  delete section.dataset.animationToken;
  if(body){
    body.style.transition="";
    body.style.height=open?"auto":"0px";
    body.style.opacity=open?"1":"0";
    body.style.willChange="";
  }
  if(content){
    content.style.transition="";
    content.style.opacity="";
    content.style.transform="";
    content.style.willChange="";
  }
}

function animateCombatSection(section,open){
  if(!section||section.dataset.animating==="true")return false;
  const body=section.querySelector(".combat-section-body");
  const content=section.querySelector(".combat-section-content");
  const toggle=section.querySelector(".combat-section-toggle");
  if(!body||!content){
    syncCombatSection(section,open);
    return true;
  }

  if(prefersReducedCombatMotion()){
    syncCombatSection(section,open);
    return true;
  }

  const token=`accordion_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const currentHeight=Math.max(0,body.getBoundingClientRect().height);
  const wasOpen=section.classList.contains("open");

  section.dataset.animating="true";
  section.dataset.animationToken=token;
  section.classList.add("accordion-animating");
  toggle?.setAttribute("aria-expanded",String(Boolean(open)));

  body.style.transition="none";
  content.style.transition="none";
  body.style.height=`${currentHeight}px`;
  body.style.opacity=wasOpen?"1":"0";
  content.style.opacity=wasOpen?"1":"0";
  content.style.transform=wasOpen?"translate3d(0,0,0)":"translate3d(0,-8px,0)";

  let targetHeight=0;
  if(open){
    section.classList.add("open");
    body.style.height="auto";
    targetHeight=Math.max(body.scrollHeight||0,body.getBoundingClientRect().height);
    body.style.height=`${currentHeight}px`;
  }else{
    targetHeight=0;
    section.classList.remove("open");
  }

  // Flush once, then let the browser animate without JS work on every frame.
  void body.offsetHeight;

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      if(section.dataset.animationToken!==token)return;
      body.style.transition=[
        `height ${combatAccordionMotion.duration}ms ${combatAccordionMotion.easing}`,
        `opacity 190ms ease`
      ].join(",");
      content.style.transition=[
        `opacity 190ms ease`,
        `transform 300ms ${combatAccordionMotion.easing}`
      ].join(",");
      body.style.height=`${open?targetHeight:0}px`;
      body.style.opacity=open?"1":"0";
      content.style.opacity=open?"1":"0";
      content.style.transform=open?"translate3d(0,0,0)":"translate3d(0,-8px,0)";
    });
  });

  const onTransitionEnd=event=>{
    if(event.target!==body||event.propertyName!=="height")return;
    body.removeEventListener("transitionend",onTransitionEnd);
    finishCombatSectionAnimation(section,open,token);
  };
  body.addEventListener("transitionend",onTransitionEnd);
  setTimeout(()=>finishCombatSectionAnimation(section,open,token),combatAccordionMotion.duration+90);
  return true;
}

function applyCombatSectionStates(){
  const downed=state.hpCurrent===0;
  document.querySelectorAll(".combat-section[data-combat-section]").forEach(section=>{
    if(section.dataset.animating==="true")return;
    const key=section.dataset.combatSection;
    const forcedOpen=downed&&key==="status";
    const open=forcedOpen||Boolean(state.combatSections?.[key]);
    syncCombatSection(section,open);
  });
}

function setCombatSectionOpen(key,open,{saveState=true,animate=true}={}){
  state.combatSections={...combatSectionDefaults,...(state.combatSections||{})};
  state.combatSections[key]=Boolean(open);
  if(saveState)save();
  const section=document.querySelector(`.combat-section[data-combat-section="${key}"]`);
  if(animate&&section)return animateCombatSection(section,Boolean(open));
  applyCombatSectionStates();
  return true;
}

function render(){
  document.getElementById("charName").textContent=state.name;
  document.getElementById("charRace").textContent=term(state.race);
  document.getElementById("charClass").textContent=term(state.className);
  document.getElementById("charLevel").textContent=state.level;
  const desktopName=document.getElementById("desktopCharName");
  const desktopMeta=document.getElementById("desktopCharMeta");
  if(desktopName)desktopName.textContent=state.name;
  if(desktopMeta)desktopMeta.textContent=`${term(state.race)} ${term(state.className)} · ${formatLevel(state.level)}`;
  document.getElementById("hpCurrent").textContent=state.hpCurrent;
  document.getElementById("hpMax").textContent=state.hpMax;
  document.getElementById("tempHp").textContent=state.tempHp;
  document.getElementById("ac").textContent=state.ac;
  document.getElementById("initiative").textContent=signed(state.initiative);
  document.getElementById("speed").textContent=state.speed;
  document.getElementById("prof").textContent=signed(state.proficiency);
  document.querySelectorAll("[data-bind]").forEach(el=>{
    const key=el.dataset.bind;
    const stateKey=key==="prof"?"proficiency":key;
    const value=state[stateKey];
    el.textContent=["initiative","prof"].includes(key)?signed(Number(value)||0):value;
  });
  document.querySelectorAll(".portrait").forEach(p=>{
    const initials=state.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
    const image=p.querySelector("img");
    const label=p.querySelector("span");
    p.dataset.level=state.level;
    p.classList.toggle("has-image",Boolean(state.portraitImage));
    if(image){image.hidden=!state.portraitImage;image.src=state.portraitImage||"";}
    if(label){label.hidden=Boolean(state.portraitImage);label.textContent=initials;}
  });



  document.getElementById("coinsGrid").innerHTML=Object.entries(state.coins).map(([coin,value])=>`
    <div class="coin coin-${coin.toLowerCase()}">
      <i class="coin-icon" aria-hidden="true">${coin.charAt(0)}</i>
      <span>${coin}</span><b>${value}</b>
    </div>`).join("");

  const abilityOrder=["STR","DEX","CON","INT","WIS","CHA"];
  const abilitySymbols={STR:"✊",DEX:"◉",CON:"♥",INT:"▤",WIS:"◇",CHA:"◈"};

  document.getElementById("savingThrowsList").innerHTML=abilityOrder.map(ability=>{
    const saveDef=saveDefs.find(def=>def.ability===ability);
    const saveValue=saveTotal(saveDef);
    const proficient=Boolean(state.saveProficiencies?.[ability]);
    return `<div class="saving-throw-row" onclick="showCheckDetail('save','${saveDef.key}')">
      <span class="saving-throw-name">${appLanguage==="he"?abilityDisplayName(ability,true):ability}</span>
      <span class="saving-throw-total ${saveValue<0?"negative":saveValue===0?"neutral":"bonus"}">${signed(saveValue)}</span>
      <span class="saving-throw-mobile-prof" aria-label="${proficient?phrase("Proficient"):phrase("Not Proficient")}"><i class="save-prof-dot ${proficient?"proficient":""}"></i></span>
      <span class="saving-throw-prof"><i class="save-prof-dot ${proficient?"proficient":""}"></i>${proficient?phrase("Proficient"):phrase("Not Proficient")}</span>
      <button class="check-info-btn" aria-label="${appLanguage==="he"?"פירוט גלגול הצלה":"Saving Throw details"}: ${abilityDisplayName(ability,true)}" onclick="showCheckDetail('save','${saveDef.key}');event.stopPropagation()">!</button>
    </div>`;
  }).join("");

  document.getElementById("skillsAbilityGroups").innerHTML=`<div class="skills-ability-track">${abilityOrder.map(ability=>{
    const [score,modifier]=state.abilities[ability];
    const relatedSkills=skillDefs.filter(def=>def.ability===ability);

    return `<section class="skills-ability-card" data-ability="${ability}">
      <div class="skills-ability-head">
        <div class="skills-ability-title">
          <h4>${escapeHtml(abilityDisplayName(ability))}</h4>
          <span class="skills-ability-code">${ability}</span>
        </div>
        <div class="skills-ability-values">
          <span class="skills-ability-score">${score}</span>
          <span class="skills-ability-mod">${signed(modifier)}</span>
        </div>
        <span class="ability-symbol" aria-hidden="true">${abilitySymbols[ability]}</span>
      </div>
      <div class="skills-card-body">
        <div class="skills-subtitle">${phrase("Skills")}</div>
        ${relatedSkills.length?relatedSkills.map(def=>{
          const total=skillTotal(def);
          const status=state.skillProficiencies?.[def.key]||"none";
          return `<div class="skills-check-row">
            <div class="skills-check-label">
              <b>${escapeHtml(skillDisplayName(def))}</b>
              <span>${escapeHtml(proficiencyLabel(status))}</span>
            </div>
            <span class="skills-check-total">${signed(total)}</span>
            <button class="check-info-btn" aria-label="${appLanguage==="he"?"פירוט":"Details for"} ${escapeHtml(skillDisplayName(def))}" onclick="showCheckDetail('skill','${def.key}');event.stopPropagation()">!</button>
          </div>`;
        }).join(""):`<div class="skills-empty">${appLanguage==="he"
          ?`אין מיומנויות רשמיות שמבוססות על ${abilityDisplayName(ability)}.`
          :`No official Skills are based on ${abilityDisplayName(ability)}.`}</div>`}
      </div>
    </section>`;
  }).join("")}</div>`;


  const downed=state.hpCurrent===0;
  const combatPage=document.getElementById("combat");
  combatPage.classList.toggle("downed-mode",downed);

  document.getElementById("combatHpCurrent").textContent=state.hpCurrent;
  document.getElementById("combatHpMax").textContent=state.hpMax;
  document.getElementById("combatHpBar").style.width=`${Math.max(0,Math.min(100,(state.hpCurrent/state.hpMax)*100))}%`;
  document.getElementById("hpLastChange").textContent=localizedHpLastChange();
  document.getElementById("combatStatusSummary").textContent=appLanguage==="he"
    ?`נק״פ ${state.hpCurrent}/${state.hpMax} · דרג״ש ${state.ac} · יוזמה ${signed(state.initiative)}`
    :`HP ${state.hpCurrent}/${state.hpMax} · AC ${state.ac} · Initiative ${signed(state.initiative)}`;

  const combatStatusBar=document.getElementById("combatStatusBar");
  const combatStatusText=document.getElementById("combatStatusText");
  const combatToggleBtn=document.getElementById("combatToggleBtn");
  const combatModeBadge=document.getElementById("combatModeBadge");
  combatStatusBar.classList.toggle("active",state.combatActive);
  combatStatusText.textContent=state.combatActive?phrase("Combat Active"):phrase("Exploration");
  combatToggleBtn.textContent=state.combatActive?phrase("End Combat"):phrase("Start Combat");
  combatToggleBtn.classList.toggle("active",state.combatActive);
  combatModeBadge.textContent=downed
    ?(appLanguage==="he"?"מובס":"Downed")
    :state.combatActive?phrase("Active"):phrase("Ready");

  document.getElementById("combatConditions").innerHTML=
    `<span class="combat-empty-chip">${phrase("No active conditions")}</span>`;

  const restLocked=state.combatActive||downed;
  const restReason=downed
    ?(appLanguage==="he"?"לא ניתן לנוח כאשר הדמות ב־0 נק״פ.":"You cannot rest while the character is at 0 HP.")
    :(appLanguage==="he"?"לא ניתן לנוח בזמן קרב פעיל.":"You cannot rest during active combat.");
  const shortRestButton=document.getElementById("shortRestBtn");
  const longRestButton=document.getElementById("longRestBtn");
  shortRestButton.disabled=restLocked;
  longRestButton.disabled=restLocked;
  shortRestButton.classList.toggle("locked",restLocked);
  longRestButton.classList.toggle("locked",restLocked);
  document.getElementById("shortRestLockedNote").textContent=restReason;
  document.getElementById("longRestLockedNote").textContent=restReason;
  document.getElementById("shortRestLockedNote").classList.toggle("show",restLocked);
  document.getElementById("longRestLockedNote").classList.toggle("show",restLocked);
  document.getElementById("recoveryStatus").textContent=restLocked
    ?(appLanguage==="he"?"לא זמין":"Unavailable")
    :phrase("Available");
  document.getElementById("combatRecoverySection").classList.toggle("locked-section",restLocked);

  const deathPanel=document.getElementById("deathPanel");
  deathPanel.classList.toggle("active",downed);
  document.getElementById("deathSuccesses").innerHTML=Array.from(
    {length:3},(_,i)=>`<span class="death-bubble success ${i<state.deathSaves.successes?"filled":""}"></span>`
  ).join("");
  document.getElementById("deathFailures").innerHTML=Array.from(
    {length:3},(_,i)=>`<span class="death-bubble failure ${i<state.deathSaves.failures?"filled":""}"></span>`
  ).join("");
  let deathText=appLanguage==="he"
    ?"מחוסר הכרה — גלגל גלגול הצלה ממוות בתחילת התור."
    :"Unconscious — roll a Death Saving Throw at the start of your turn.";
  if(state.deathSaves.dead){
    deathText=state.deathSaves.cause==="massive"
      ?(appLanguage==="he"?"מת — נזק עצום.":"Dead — Massive Damage.")
      :(appLanguage==="he"?"מת — סומנו שלושה כישלונות.":"Dead — three failures were marked.");
  }else if(state.deathSaves.stabilized){
    deathText=appLanguage==="he"
      ?"מיוצב — אין צורך בגלגולים נוספים עד שהמצב משתנה."
      :"Stabilized — no additional rolls are needed until the situation changes.";
  }
  document.getElementById("deathStatus").textContent=deathText;

  document.getElementById("actionSurgeBanner").classList.toggle("active",state.extraActionActive);

  const actions=appLanguage==="he"?[
    {group:"פעולות בסיסיות",items:[
      {name:"התקפה",desc:"בצע את מספר ההתקפות שהדמות שלך רשאית לבצע."},
      {name:"מאמץ",desc:"הוסף את המהירות שלך לתנועה הזמינה בתור."},
      {name:"התנתקות",desc:"התנועה שלך אינה מעוררת התקפות הזדמנות בתור הזה."},
      {name:"מגננה",desc:"התקפות נגדך נעשות בחיסרון, בהתאם לחוקים."},
      {name:"סיוע",desc:"הענק יתרון לבעל ברית או סייע לו בהתאם למצב."},
      {name:"הסתתרות / חיפוש / הכנה / שימוש בחפץ",desc:"פעולות בסיסיות נוספות בהתאם לחוקי המשחק ולמצב."}
    ]},
    {group:"תגובות",items:[
      {name:"התקפת הזדמנות",desc:"תגובה אפשרית כאשר אויב עוזב את טווח ההגעה שלך."}
    ]},
    {group:"תנועה",items:[
      {name:`תנועה של עד ${state.speed} רגל`,desc:"אפשר לפצל את התנועה לפני ואחרי פעולות."},
      {name:"קימה משכיבה",desc:"בדרך כלל עולה מחצית מהמהירות שלך."}
    ]}
  ]:[
    {group:"Core Actions",items:[
      {name:"Attack",desc:"Make the number of attacks your character is allowed to make."},
      {name:"Dash",desc:"Add your Speed to the movement available during this turn."},
      {name:"Disengage",desc:"Your movement does not provoke Opportunity Attacks this turn."},
      {name:"Dodge",desc:"Attacks against you are made with Disadvantage, subject to the rules."},
      {name:"Help",desc:"Grant Advantage to an ally or assist as the situation allows."},
      {name:"Hide / Search / Ready / Use an Object",desc:"Additional core actions according to the rules and situation."}
    ]},
    {group:"Reactions",items:[
      {name:"Opportunity Attack",desc:"A possible Reaction when an enemy leaves your reach."}
    ]},
    {group:"Movement",items:[
      {name:`Move up to ${state.speed} ft.`,desc:"You may split your movement before and after Actions."},
      {name:"Stand from Prone",desc:"Usually costs half of your Speed."}
    ]}
  ];
  document.getElementById("turnActions").innerHTML=actions.map(section=>`
    <div class="action-section">
      <h4>${section.group}<span class="action-type">${section.items.length}</span></h4>
      <div class="action-grid">
        ${section.items.map(item=>`
          <div class="action-option">
            <div><b>${escapeHtml(item.name)}</b><p>${escapeHtml(item.desc)}</p></div>
          </div>`).join("")}
      </div>
    </div>`).join("");

  const hitDice=resourceByKey("hitDice");
  document.getElementById("hitDiceValue").textContent=`${hitDice.current}/${hitDice.max} ${state.hitDieType||"d10"}`;
  document.getElementById("hitDiceBubbles").innerHTML=Array.from(
    {length:hitDice.max},(_,i)=>`<span class="hit-die ${i<hitDice.current?"":"empty"}"></span>`
  ).join("");

  const combatWeapons=getCombatWeapons();
  document.getElementById("attackCount").textContent=combatWeapons.length;
  document.getElementById("weaponsList").innerHTML=combatWeapons.length
    ?combatWeapons.map(({item,index})=>renderCombatWeaponCard(item,index,downed)).join("")
    :`<div class="empty-state">${appLanguage==="he"?"אין נשקים פעילים במלאי.":"There are no active weapons in the inventory."}</div>`;

  const linkedResourceIds=new Set();
  const combatResourceList=state.resources.filter(resource=>{
    if(resource.systemKey==="hitDice")return false;
    const linked=linkedCombatTrait(resource);
    if(linked)linkedResourceIds.add(resource.id);
    return resource.showInCombat||Boolean(linked);
  });

  const combatIdentityKey=value=>String(value||"").trim().toLocaleLowerCase("en").replace(/[^a-z0-9]+/g,"");
  const representedCombatNames=new Set();
  combatResourceList.forEach(resource=>{
    const linked=linkedCombatTrait(resource);
    [resource.name,linked?.name].forEach(name=>{
      const key=combatIdentityKey(name);
      if(key)representedCombatNames.add(key);
    });
  });

  const resourceCards=combatResourceList.map(resource=>{
    const actualIndex=state.resources.indexOf(resource);
    const linked=linkedCombatTrait(resource);
    const activation=combatActivationLabel(linked?.activation||resource.action||"Special");
    const bucket=combatActivationBucket(activation);
    const canUse=resource.current>=resource.useCost&&!downed;
    const description=linked?.shortDesc||linked?.description||resource.desc||"";
    return {
      bucket,
      html:`<article class="combat-ability-card ${downed?"active-disabled":""}">
        <div>
          <h4>${bidiAutoHtml(linked?.name||resource.name)} <span class="inline-tag">${ltrHtml(activation)}</span></h4>
          <div class="combat-ability-description mixed-copy" data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(description||(appLanguage==="he"?"משאב קרבי.":"Combat Resource."))}</div>
          <div class="combat-ability-meta">
            <span class="action-type">${bidiAutoHtml(activation)}</span>
            <span class="tiny bidi-ltr" dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(resourceRechargeText(resource))} · ${escapeHtml(formatCost(resource.useCost))}</span>
          </div>
          <div class="resource-bubbles">${resourceBubbles(resource)}</div>
        </div>
        <div class="combat-ability-actions">
          <span class="quantity-pill">${resource.current}/${resource.max}</span>
          <button class="small-btn primary" onclick="useResource(${actualIndex})" ${!canUse?"disabled":""}>${phrase("Use")}</button>
          <button class="magic-info-btn" onclick="showResource(${actualIndex});event.stopPropagation()">!</button>
        </div>
      </article>`
    };
  });



  const seenUnlinkedTraitNames=new Set();
  const unlinkedTraits=state.traits
    .map((trait,index)=>({trait,index}))
    .filter(({trait})=>{
      if(!trait.showInCombat)return false;
      const identityKey=combatIdentityKey(trait.name);
      if(identityKey&&representedCombatNames.has(identityKey))return false;
      if(identityKey&&seenUnlinkedTraitNames.has(identityKey))return false;
      if(identityKey)seenUnlinkedTraitNames.add(identityKey);
      if(!trait.resourceId)return true;
      return !state.resources.some(resource=>resource.id===trait.resourceId);
    });

  const traitCards=unlinkedTraits.map(({trait,index})=>{
    const passive=trait.activation==="Passive";
    const activation=combatActivationLabel(trait.activation||"Special");
    const bucket=combatActivationBucket(activation);
    return {
      bucket,
      html:`<article class="combat-ability-card ${passive?"passive":""}">
        <div>
          <h4>${bidiAutoHtml(trait.name)} <span class="inline-tag">${bidiAutoHtml(activation)}</span></h4>
          <div class="combat-ability-description mixed-copy" data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${escapeHtml(trait.shortDesc||trait.description||"")}</div>
          <div class="combat-ability-meta">
            ${passive?"":`<span class="action-type">${bidiAutoHtml(activation)}</span>`}
            <span class="tiny">${bidiAutoHtml(term(trait.category))}</span>
          </div>
          ${trait.trigger&&!/^english description not provided$/i.test(String(trait.trigger).trim())?`<div class="trait-trigger mixed-copy" data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}"><b>${appLanguage==="he"?"תנאי הפעלה:":"Trigger:"}</b> ${escapeHtml(trait.trigger)}</div>`:""}
        </div>
        <div class="combat-ability-actions">
          ${passive?"":`<span class="quantity-pill">${appLanguage==="he"?"מידע":"Info"}</span>`}
          <button class="magic-info-btn" onclick="showTrait(${index});event.stopPropagation()">!</button>
        </div>
      </article>`
    };
  });

  const allAbilityCards=[...resourceCards,...traitCards];
  document.getElementById("combatAbilityCount").textContent=allAbilityCards.length;
  if(allAbilityCards.length){
    const groupedCards=allAbilityCards.reduce((acc,item)=>{
      (acc[item.bucket]||(acc[item.bucket]=[])).push(item.html);
      return acc;
    },{});
    const groupOrder=["action","bonus","reaction","passive"];
    document.getElementById("combatResources").innerHTML=`<div class="combat-ability-groups">${groupOrder
      .filter(bucket=>(groupedCards[bucket]||[]).length)
      .map(bucket=>{
        const meta=combatGroupMeta(bucket);
        return `<section class="combat-ability-group">
          <div class="combat-ability-group-head">
            <div>
              <b>${meta.title}</b>
              <span>${meta.subtitle}</span>
            </div>
            <span class="quantity-pill">${groupedCards[bucket].length}</span>
          </div>
          <div class="combat-ability-grid grouped">${groupedCards[bucket].join("")}</div>
        </section>`;
      }).join("")}</div>`;
  }else{
    document.getElementById("combatResources").innerHTML=`<div class="empty-state">${appLanguage==="he"
      ?"אין משאבים או יכולות שמוגדרים להצגה בקרב."
      :"No Resources or Abilities are configured for Combat."}</div>`;
  }

  const consumables=state.inventory.filter(item=>itemCategory(item)==="Consumable"&&!item.destroyed);
  document.getElementById("consumableCount").textContent=consumables.length;
  document.getElementById("combatConsumables").innerHTML=consumables.length?consumables.map(item=>{
    const inventoryIndex=state.inventory.indexOf(item);
    const c=item.consumable||{};
    return `<article class="combat-quick-item">
      <div>
        <b>${escapeHtml(item.name)}</b>
        <p data-localized-content>${escapeHtml([term(c.activation),c.formula,c.effect||item.desc].filter(Boolean).join(" · ")||(appLanguage==="he"?"ללא פירוט":"No details provided"))}</p>
      </div>
      <div style="text-align:center">
        <span class="quantity-pill">x${item.qty}</span><br>
        <button class="small-btn primary" style="margin-top:7px" onclick="openConsumable(${inventoryIndex})" ${item.qty<=0||downed?"disabled":""}>${phrase("Use")}</button>
      </div>
    </article>`;
  }).join(""):`<div class="empty-state">${appLanguage==="he"?"אין חפצים מהירים זמינים.":"No Quick Items are available."}</div>`;

  applyCombatSectionStates();

  renderInventoryPage();

  document.getElementById("abilityGrid").innerHTML=Object.entries(state.abilities).map(([k,v])=>`
    <div class="ability" data-ability="${k}"><small>${k}</small><b>${v[0]}</b><small class="${v[1]<0?"negative":v[1]===0?"neutral":"bonus"}">(${signed(v[1])})</small></div>`).join("");

  document.getElementById("skillsBody").innerHTML=skillDefs.map(def=>checkRow("skill",def,skillTotal(def))).join("");
  document.getElementById("savesBody").innerHTML=saveDefs.map(def=>checkRow("save",def,saveTotal(def))).join("");

  document.getElementById("levelFrom").textContent=state.level;
  document.getElementById("levelTo").textContent=state.level+1;
  document.getElementById("autoGains").innerHTML=appLanguage==="he"?`
    <div class="resource-row"><div><b>קוביית פגיעה נוספת</b><div class="tiny">לפי המקצוע: d10</div></div><strong>+1</strong></div>
    <div class="resource-row"><div><b>עדכון תוסף השליטה</b><div class="tiny">לפי טבלת הרמות</div></div><strong>${signed(state.proficiency)}</strong></div>
    <div class="resource-row"><div><b>יכולות מקצוע</b><div class="tiny">כל יכולת אוטומטית תתווסף עם הסבר.</div></div><strong>אוטומטי</strong></div>`
    :`<div class="resource-row"><div><b>Additional Hit Die</b><div class="tiny">By class: d10</div></div><strong>+1</strong></div>
    <div class="resource-row"><div><b>Proficiency Bonus Update</b><div class="tiny">According to the level table</div></div><strong>${signed(state.proficiency)}</strong></div>
    <div class="resource-row"><div><b>Class Features</b><div class="tiny">Every automatic Feature will be added with an explanation.</div></div><strong>Automatic</strong></div>`;
  updateLevelPreview();
  renderTraitPage();
  requestAnimationFrame(()=>syncAbilityTransformCarousel());
  if(document.getElementById("resourceManagerModal")?.classList.contains("open"))renderResourceManager();
  if(document.getElementById("traitManagerModal")?.classList.contains("open"))renderTraitManager();
  updateThemeControls();
  updateLanguageControls();
  localizeDocument(document.body);
}
function checkRow(type,def,total){
  const cls=total<0?"negative":total===0?"neutral":"bonus";
  const label=type==="skill"?skillDisplayName(def):saveDisplayName(def);
  return `<tr>
    <td>${escapeHtml(label)}</td>
    <td>${escapeHtml(abilityDisplayName(def.ability,true))}</td>
    <td class="${cls}">${signed(total)}</td>
    <td><button class="check-info-btn" aria-label="${appLanguage==="he"?"פירוט":"Details"}: ${escapeHtml(label)}" onclick="showCheckDetail('${type}','${def.key}');event.stopPropagation()">!</button></td>
  </tr>`;
}
window.showCheckDetail=function(type,key){
  const def=(type==="skill"?skillDefs:saveDefs).find(x=>x.key===key);
  if(!def)return;
  const score=state.abilities[def.ability][0];
  const modifier=state.abilities[def.ability][1];
  let status,profContribution,override,total;
  if(type==="skill"){
    status=state.skillProficiencies?.[key]||"none";
    const multiplier=status==="expertise"?2:status==="proficient"?1:0;
    profContribution=state.proficiency*multiplier;
    override=state.skillOverrides?.[key];
    total=skillTotal(def);
  }else{
    status=state.saveProficiencies?.[key]?"proficient":"none";
    profContribution=state.saveProficiencies?.[key]?state.proficiency:0;
    override=state.saveOverrides?.[key];
    total=saveTotal(def);
  }
  const hasOverride=override!==undefined&&override!==null&&override!=="";
  const label=type==="skill"?skillDisplayName(def):saveDisplayName(def);
  document.getElementById("infoTitle").textContent=`${label} — ${signed(total)}`;
  const proficiencyText=type==="skill"
    ?proficiencyLabel(status)
    :(status==="proficient"?phrase("Yes"):phrase("No"));
  const rows=appLanguage==="he"?[
    ["מבוסס על",abilityDisplayName(def.ability,true)],
    ["ערך התכונה",score],
    ["מתאם התכונה",signed(modifier)],
    ["שליטה",proficiencyText],
    ["תרומת השליטה",signed(profContribution)],
    ["עקיפה ידנית",hasOverride?signed(Number(override)):phrase("None")]
  ]:[
    ["Based On",abilityDisplayName(def.ability,true)],
    ["Ability Score",score],
    ["Ability Modifier",signed(modifier)],
    ["Proficiency",proficiencyText],
    ["Proficiency Contribution",signed(profContribution)],
    ["Manual Override",hasOverride?signed(Number(override)):phrase("None")]
  ];
  document.getElementById("infoBody").innerHTML=`
    <div class="check-breakdown" data-localized-content>
      ${rows.map(([rowLabel,value])=>`<div class="line"><span>${escapeHtml(rowLabel)}</span><b>${escapeHtml(value)}</b></div>`).join("")}
    </div>
    <div class="check-total">${appLanguage==="he"?"סך הכול":"Total"}: ${signed(total)}</div>
    ${hasOverride?`<p class="tiny" data-localized-content>${appLanguage==="he"
      ?"העקיפה הידנית מחליפה את החישוב האוטומטי."
      :"The manual Override replaces the automatic calculation."}</p>`:""}`;
  openEl("infoModal");
};
window.removeItem=function(idx){
  const item=state.inventory[idx];
  if(!item)return;
  const question=appLanguage==="he"?`למחוק את ${item.name}?`:`Delete ${item.name}?`;
  if(confirm(question)){
    state.inventory.splice(idx,1);
    save();render();
    toast(appLanguage==="he"?"החפץ נמחק מכל המסכים":"The item was removed from every screen");
  }
};




function resolveDamageAtZero(isCritical){
  let damage=Math.max(0,Number(state.pendingZeroDamage)||0);
  state.pendingZeroDamage=0;
  closeEl("zeroDamageModal");
  if(state.deathSaves.dead){
    toast(appLanguage==="he"?"הדמות כבר מסומנת כמתה":"The character is already marked as dead");
    return;
  }
  const tempUsed=Math.min(state.tempHp,damage);
  state.tempHp-=tempUsed;
  damage-=tempUsed;
  if(damage<=0){
    state.hpLastChange=appLanguage==="he"
      ?"כל הנזק נספג בנקודות הפגיעה הזמניות; לא נוסף כישלון בגלגול הצלה ממוות."
      :"All damage was absorbed by Temporary HP; no Death Saving Throw failure was added.";
    save();render();
    toast(appLanguage==="he"?"הנזק נספג בנקודות הפגיעה הזמניות":"The damage was absorbed by Temporary HP");
    return;
  }
  if(damage>=state.hpMax){
    state.deathSaves.dead=true;
    state.deathSaves.stabilized=false;
    state.deathSaves.cause="massive";
    state.hpLastChange=appLanguage==="he"
      ?"נזק עצום בזמן 0 נק״פ: הדמות מסומנת כמתה."
      :"Massive Damage at 0 HP: the character is marked as dead.";
    save();render();
    toast(appLanguage==="he"?"נזק עצום":"Massive Damage");
    return;
  }
  if(state.deathSaves.stabilized)state.deathSaves.stabilized=false;
  const failures=isCritical?2:1;
  state.deathSaves.failures+=failures;
  updateDeathState();
  state.hpLastChange=appLanguage==="he"
    ?`נזק בזמן 0 נק״פ: נוספו ${failures} ${failures===1?"כישלון":"כישלונות"} בגלגולי הצלה ממוות.`
    :`Damage at 0 HP: ${failures} Death Saving Throw ${failures===1?"failure was":"failures were"} added.`;
  save();render();
  toast(appLanguage==="he"
    ?(failures===2?"נוספו שני כישלונות":"נוסף כישלון")
    :(failures===2?"Two failures were added":"One failure was added"));
}


function startCombat(){
  state.combatActive=true;
  state.hpLastChange=appLanguage==="he"
    ?"הקרב התחיל. המנוחות נעולות עד לסיום הקרב."
    :"Combat started. Rests are locked until Combat ends.";
  save();render();toast(phrase("Combat Active"));
}

function endCombat(){
  state.combatActive=false;
  state.extraActionActive=false;
  state.hpLastChange=appLanguage==="he"
    ?"הקרב הסתיים. נקודות הפגיעה והמשאבים שנוצלו נשארו כפי שהם."
    :"Combat ended. Spent HP and Resources remain unchanged.";
  save();render();
  toast(appLanguage==="he"?"הקרב הסתיים":"Combat ended");
}

function toggleCombat(){
  if(state.combatActive){
    document.getElementById("infoTitle").textContent=appLanguage==="he"?"סיום קרב":"End Combat";
    document.getElementById("infoBody").innerHTML=appLanguage==="he"?`
      <p data-localized-content>סיום הקרב יבטל את מצב הקרב הפעיל וינקה רק מצבים זמניים של התור, כגון פעולה נוספת שכבר הופעלה.</p>
      <div class="summary" data-localized-content>נקודות פגיעה, שיקויים, פרץ פעולה ומשאבים אחרים שכבר נוצלו <b>לא</b> יתחדשו.</div>
      <button class="primary-btn" id="confirmEndCombat" style="width:100%;margin-top:10px">אישור סיום הקרב</button>`
      :`<p data-localized-content>Ending Combat disables the active Combat state and clears only temporary turn effects, such as an already-active additional Action.</p>
      <div class="summary" data-localized-content>HP, potions, Action Surge and other spent Resources will <b>not</b> recharge.</div>
      <button class="primary-btn" id="confirmEndCombat" style="width:100%;margin-top:10px">Confirm End Combat</button>`;
    openEl("infoModal");
    document.getElementById("confirmEndCombat").onclick=()=>{closeEl("infoModal");endCombat();};
  }else{
    startCombat();
  }
}


window.activateActionSurge=function(){
  const resource=resourceByKey("actionSurge");
  if(!resource||resource.current<resource.useCost||state.extraActionActive){
    toast(appLanguage==="he"?"פרץ פעולה אינו זמין":"Action Surge is unavailable");
    return;
  }
  resource.current-=resource.useCost;
  state.extraActionActive=true;
  state.hpLastChange=appLanguage==="he"
    ?"פרץ פעולה הופעל: פעולה נוספת זמינה בתור הזה."
    :"Action Surge activated: one additional Action is available this turn.";
  save();render();
  toast(appLanguage==="he"?"פעולה נוספת זמינה":"An additional Action is available");
};
window.useSecondWind=function(){
  const resource=resourceByKey("secondWind");
  if(!resource||resource.current<resource.useCost){
    toast(appLanguage==="he"?"רוח שנייה אינה זמינה":"Second Wind is unavailable");
    return;
  }
  document.getElementById("infoTitle").textContent=localizedValue(resource,"name","name");
  document.getElementById("infoBody").innerHTML=appLanguage==="he"?`
    <p data-localized-content>גלגל פיזית d10. האפליקציה תוסיף את רמת הלוחם (${state.level}). השימוש יופחת רק לאחר אישור.</p>
    <div class="form-group"><label>תוצאת d10</label><input id="secondWindRoll" type="number" min="1" max="10" inputmode="numeric"></div>
    <div class="summary" id="secondWindCalc">הזן תוצאה.</div>
    <button class="primary-btn" id="confirmSecondWind" style="width:100%;margin-top:10px">אישור שימוש וריפוי</button>`
    :`<p data-localized-content>Physically roll d10. The app adds your Fighter level (${state.level}). The use is spent only after confirmation.</p>
    <div class="form-group"><label>d10 Result</label><input id="secondWindRoll" type="number" min="1" max="10" inputmode="numeric"></div>
    <div class="summary" id="secondWindCalc">Enter a result.</div>
    <button class="primary-btn" id="confirmSecondWind" style="width:100%;margin-top:10px">Confirm Use and Healing</button>`;
  openEl("infoModal");
  const input=document.getElementById("secondWindRoll");
  const calculate=()=>{
    const roll=Math.max(0,Number(input.value)||0);
    document.getElementById("secondWindCalc").innerHTML=roll
      ?`${roll} + ${appLanguage==="he"?"רמה":"Level"} ${state.level} = <b class="bonus">${roll+state.level} ${appLanguage==="he"?"נק״פ":"HP"}</b>`
      :(appLanguage==="he"?"הזן תוצאה.":"Enter a result.");
  };
  input.oninput=calculate;
  document.getElementById("confirmSecondWind").onclick=()=>{
    const roll=Number(input.value)||0;
    if(roll<1||roll>10){
      toast(appLanguage==="he"?"הזן תוצאה בין 1 ל־10":"Enter a result between 1 and 10");
      return;
    }
    resource.current=Math.max(0,resource.current-resource.useCost);
    applyHealing(roll+state.level,localizedValue(resource,"name","name"));
    save();render();closeEl("infoModal");
    toast(appLanguage==="he"?"רוח שנייה נוצלה":"Second Wind was used");
  };
};
function openShortRest(){
  if(state.combatActive||state.hpCurrent===0){
    toast(state.hpCurrent===0
      ?(appLanguage==="he"?"אי אפשר לבצע מנוחה קצרה ב־0 נק״פ":"A Short Rest cannot be taken at 0 HP")
      :(appLanguage==="he"?"אי אפשר לבצע מנוחה קצרה בזמן קרב":"A Short Rest cannot be taken during Combat"));
    return;
  }
  shortRestSnapshot=structuredClone(state);
  state.shortRestSession={healed:0,diceSpent:0,entries:[]};
  document.getElementById("shortRestRoll").value="";
  updateShortRestModal();
  openEl("shortRestModal");
}

function updateShortRestModal(){
  const hitDice=resourceByKey("hitDice");
  const con=state.abilities.CON[1];
  document.getElementById("srHp").textContent=`${state.hpCurrent}/${state.hpMax}`;
  document.getElementById("srDice").textContent=`${hitDice.current}/${hitDice.max} ${state.hitDieType||"d10"}`;
  document.getElementById("srCon").textContent=signed(con);
  const dieMax=Number((state.hitDieType||"d10").replace("d",""))||10;
  const roll=Math.max(0,Math.min(dieMax,Number(document.getElementById("shortRestRoll").value)||0));
  document.getElementById("shortRestCalculation").innerHTML=roll
    ?`${roll} + ${appLanguage==="he"?"חוסן":"CON"} (${signed(con)}) = <b class="bonus">${Math.max(0,roll+con)} ${appLanguage==="he"?"נק״פ":"HP"}</b>`
    :(appLanguage==="he"?"הזן תוצאה כדי לראות את הריפוי.":"Enter a result to preview the healing.");
  const entries=state.shortRestSession?.entries||[];
  document.getElementById("shortRestLog").innerHTML=entries.length
    ?entries.map(entry=>`<div>${escapeHtml(entry)}</div>`).join("")
    :`<div>${appLanguage==="he"
      ?"עדיין לא בוזבזו קוביות פגיעה במנוחה הזאת."
      :"No Hit Dice have been spent during this rest yet."}</div>`;
  document.getElementById("spendHitDieBtn").disabled=hitDice.current<=0||state.hpCurrent>=state.hpMax;
}

window.showResource=function(index){
  const resource=state.resources[index];
  if(!resource)return;
  const he=appLanguage==="he";
  document.getElementById("infoTitle").textContent=resource.name;
  document.getElementById("infoBody").innerHTML=`
    <p data-localized-content>${escapeHtml(resource.desc||(he?"לא הוזן תיאור.":"No description provided."))}</p>
    <div class="summary" data-localized-content>
      <b>${he?"סוג שימוש":"Action Type"}:</b> ${escapeHtml(term(resource.action||"Special"))}<br>
      <b>${he?"זמין כרגע":"Currently Available"}:</b> ${resource.current}/${resource.max}<br>
      <b>${he?"עלות הפעלה":"Use Cost"}:</b> ${resource.useCost}<br>
      <b>${he?"חידוש":"Recharge"}:</b> ${escapeHtml(resourceRechargeText(resource))}<br>
      <b>${he?"מקור":"Source"}:</b> ${escapeHtml([term(resource.sourceType),resource.sourceName].filter(Boolean).join(" · ")||(he?"לא הוגדר":"Not defined"))}
    </div>`;
  openEl("infoModal");
};
window.useResource=function(index){
  const resource=state.resources[index];
  if(!resource)return;
  if(resource.systemKey==="actionSurge"){activateActionSurge();return;}
  if(resource.systemKey==="secondWind"){useSecondWind();return;}
  if(resource.systemKey==="hitDice"){openShortRest();return;}
  if(resource.current<resource.useCost){
    toast(appLanguage==="he"?"אין מספיק שימושים להפעלה":"There are not enough uses to activate this Resource");
    return;
  }
  resource.current-=resource.useCost;
  save();render();
  toast(appLanguage==="he"
    ?`${resource.name}: נשארו ${resource.current}/${resource.max}`
    :`${resource.name}: ${resource.current}/${resource.max} remaining`);
};
window.showTrait=function(index){
  const trait=state.traits[index];
  if(!trait)return;
  const linked=traitLinkedResource(trait);
  const he=appLanguage==="he";
  document.getElementById("infoTitle").textContent=trait.name;
  document.getElementById("infoBody").innerHTML=`
    <p data-localized-content>${escapeHtml(trait.description||trait.shortDesc||(he?"לא הוזן תיאור.":"No description provided."))}</p>
    ${trait.trigger?`<div class="trait-trigger" data-localized-content><b>${he?"תנאי הפעלה:":"Trigger:"}</b><br>${escapeHtml(trait.trigger)}</div>`:""}
    <div class="trait-detail-grid" data-localized-content>
      <div><span class="tiny">${he?"קטגוריה":"Category"}</span><br><b>${escapeHtml(term(trait.category))}</b></div>
      <div><span class="tiny">${he?"סוג הפעלה":"Activation"}</span><br><b>${escapeHtml(term(trait.activation))}</b></div>
      <div><span class="tiny">${he?"מקור":"Source"}</span><br><b>${escapeHtml(traitSourceText(trait))}</b></div>
      <div><span class="tiny">${he?"קרב":"Combat"}</span><br><b>${trait.showInCombat?(he?"מוצג":"Shown"):(he?"מוסתר":"Hidden")}</b></div>
    </div>
    ${linked?`<div class="summary" data-localized-content>
      <b>${he?"משאב מקושר":"Linked Resource"}:</b> ${escapeHtml(linked.name)}<br>
      <b>${he?"שימושים":"Uses"}:</b> ${linked.current}/${linked.max}<br>
      <b>${he?"חידוש":"Recharge"}:</b> ${escapeHtml(resourceRechargeText(linked))}
    </div>`:""}`;
  openEl("infoModal");
};
window.showFeature=function(index){showTrait(index);};
window.showFeat=function(index){showTrait(index);};
let activeConsumableIndex=null;
window.openConsumable=function(index){
  const item=state.inventory[index];
  if(!item||itemCategory(item)!=="Consumable"||item.qty<=0||item.destroyed){
    toast(appLanguage==="he"?"החפץ אינו זמין":"The item is unavailable");
    return;
  }
  activeConsumableIndex=index;
  const consumable=item.consumable||{};
  const healing=consumable.effectType==="Healing";
  const he=appLanguage==="he";
  document.getElementById("consumableTitle").textContent=he?`שימוש: ${item.name}`:`Use: ${item.name}`;
  document.getElementById("consumableDetails").innerHTML=`
    <div class="summary" data-localized-content>
      <b>${he?"כמות נוכחית":"Current Quantity"}:</b> x${item.qty}<br>
      <b>${he?"הפעלה":"Activation"}:</b> ${escapeHtml(term(consumable.activation||"Action"))}<br>
      <b>${he?"השפעה":"Effect"}:</b> ${escapeHtml([consumable.formula,consumable.effect||item.desc].filter(Boolean).join(" · ")||(he?"ללא פירוט":"No details provided"))}
    </div>
    ${healing
      ?`<p data-localized-content>${he?"גלגל את קוביות הריפוי ידנית לפי הנוסחה והזן את התוצאה.":"Physically roll the healing dice according to the formula and enter the result."}</p>`
      :`<p data-localized-content>${consumable.consumedOnUse===false
        ?(he?"החפץ לא יופחת מהמלאי.":"The item will not be removed from the inventory.")
        :(he?"השימוש יפחית יחידה אחת מהמלאי בכל מסכי האפליקציה.":"Using the item removes one unit from the inventory on every screen.")}</p>`}`;
  document.getElementById("healingEntry").style.display=healing?"block":"none";
  document.getElementById("healingAmount").value="";
  openEl("consumableModal");
};
function applyHealing(amount,source){
  if(state.deathSaves.dead){
    state.hpLastChange=appLanguage==="he"
      ?`${source}: הריפוי לא הוחל כי הדמות מסומנת כמתה. אפס את מצב המוות ידנית אם המנחה קובע אחרת.`
      :`${source}: healing was not applied because the character is marked as dead. Reset the death state manually if the Game Master rules otherwise.`;
    toast(appLanguage==="he"?"אי אפשר לרפא דמות שמסומנת כמתה":"A character marked as dead cannot be healed");
    return 0;
  }
  const before=state.hpCurrent;
  state.hpCurrent=Math.min(state.hpMax,state.hpCurrent+Math.max(0,amount));
  const actual=state.hpCurrent-before;
  if(state.hpCurrent>0)resetDeathSaves();
  state.hpLastChange=appLanguage==="he"
    ?`${source}: הוחזרו ${actual} נק״פ.`
    :`${source}: restored ${actual} HP.`;
  return actual;
}


function showInfo(key){
  let title, body;
  if (key === "attackroll") {
    const ability = state.attackAbility || "STR";
    const abilityModifier = state.abilities[ability]?.[1] ?? 0;
    const total = abilityModifier + state.proficiency;
    title = appLanguage==="he"?"גלגול פגיעה":"Attack Roll";
    body = appLanguage==="he"?`
      <p data-localized-content>זהו גלגול הפגיעה הבסיסי לנשק שמבוסס על <b>${abilityDisplayName(ability)}</b> ושבו הדמות בעלת שליטה.</p>
      <div class="summary" dir="ltr">
        <b class="weapon-formula" dir="ltr">1d20${signed(total)}</b><br>
        מתאם ${abilityDisplayName(ability)}: ${signed(abilityModifier)}<br>
        תוסף שליטה: ${signed(state.proficiency)}<br>
        <b>תוסף פגיעה כולל: ${signed(total)}</b>
      </div>
      <p class="tiny" data-localized-content>לנשק קסום עשוי להיות תוסף נוסף. פתח את פרטי הנשק כדי לראות אותו.</p>`
      :`<p data-localized-content>This is the basic attack roll for a proficient weapon based on <b>${abilityDisplayName(ability)}</b>.</p>
      <div class="summary" dir="ltr">
        <b class="weapon-formula">1d20${signed(total)}</b><br>
        ${abilityDisplayName(ability)} Modifier: ${signed(abilityModifier)}<br>
        Proficiency Bonus: ${signed(state.proficiency)}<br>
        <b>Total Attack Bonus: ${signed(total)}</b>
      </div>
      <p class="tiny" data-localized-content>A magical weapon may provide an additional bonus. Open the weapon details to view it.</p>`;
  } else {
    [title,body]=getInfoMap()[key]||[
      appLanguage==="he"?"מידע":"Information",
      appLanguage==="he"?"עדיין אין הסבר זמין.":"No explanation is available yet."
    ];
    body = `<p data-localized-content dir="${appLanguage==="he"?"rtl":"ltr"}">${body}</p>`;
  }
  document.getElementById("infoTitle").textContent=title;
  document.getElementById("infoBody").innerHTML=body;
  openEl("infoModal");
}
window.showMagic=function(index){showItemDetails(index);};
function renderAdvancedEdit(){
  document.getElementById("editAbilities").innerHTML=Object.entries(state.abilities).map(([key,value])=>`
    <div class="ability-edit">
      <label>${abilityDisplayName(key,true)}</label>
      <input id="editAbility_${key}" type="number" min="1" max="30" value="${value[0]}">
      <small>${appLanguage==="he"?"מתאם":"Modifier"}: ${signed(abilityMod(value[0]))}</small>
    </div>`).join("");

  document.getElementById("editSkills").innerHTML=skillDefs.map(def=>{
    const status=state.skillProficiencies?.[def.key]||"none";
    const override=state.skillOverrides?.[def.key];
    return `<div class="prof-edit-row">
      <div><b>${escapeHtml(skillDisplayName(def))}</b><div class="tiny">${abilityDisplayName(def.ability,true)} · ${appLanguage==="he"?"אוטומטי":"Auto"} ${signed(skillTotal(def))}</div></div>
      <select id="editSkillStatus_${def.key}">
        <option value="none" ${status==="none"?"selected":""}>${phrase("None")}</option>
        <option value="proficient" ${status==="proficient"?"selected":""}>${phrase("Proficiency")}</option>
        <option value="expertise" ${status==="expertise"?"selected":""}>${phrase("Expertise")}</option>
      </select>
      <input id="editSkillOverride_${def.key}" type="number" placeholder="${appLanguage==="he"?"עקיפה":"Override"}" value="${override??""}">
    </div>`;
  }).join("");

  document.getElementById("editSaves").innerHTML=saveDefs.map(def=>{
    const proficient=Boolean(state.saveProficiencies?.[def.key]);
    const override=state.saveOverrides?.[def.key];
    return `<div class="prof-edit-row">
      <div><b>${escapeHtml(saveDisplayName(def))}</b><div class="tiny">${abilityDisplayName(def.ability,true)} · ${appLanguage==="he"?"אוטומטי":"Auto"} ${signed(saveTotal(def))}</div></div>
      <select id="editSaveStatus_${def.key}">
        <option value="none" ${!proficient?"selected":""}>${phrase("None")}</option>
        <option value="proficient" ${proficient?"selected":""}>${phrase("Proficiency")}</option>
      </select>
      <input id="editSaveOverride_${def.key}" type="number" placeholder="${appLanguage==="he"?"עקיפה":"Override"}" value="${override??""}">
    </div>`;
  }).join("");
}
let pendingPortraitImage="";
function portraitInitials(){return state.name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase();}
function updatePortraitEditorPreview(){
  const preview=document.getElementById("editPortraitPreview");
  if(!preview)return;
  preview.classList.toggle("has-image",Boolean(pendingPortraitImage));
  preview.style.backgroundImage=pendingPortraitImage?`url("${pendingPortraitImage}")`:"";
  preview.querySelector("span").textContent=pendingPortraitImage?"":portraitInitials();
}
function resizePortraitFile(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Could not read the selected image."));
    reader.onload=()=>{
      const image=new Image();
      image.onerror=()=>reject(new Error("The selected file is not a valid image."));
      image.onload=()=>{
        const max=900;
        const scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight));
        const width=Math.max(1,Math.round(image.naturalWidth*scale));
        const height=Math.max(1,Math.round(image.naturalHeight*scale));
        const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
        canvas.getContext("2d").drawImage(image,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg",.86));
      };
      image.src=String(reader.result||"");
    };
    reader.readAsDataURL(file);
  });
}
function openEdit(){
  pendingPortraitImage=state.portraitImage||"";updatePortraitEditorPreview();
  editName.value=state.name;editRace.value=state.race;editClass.value=state.className;editSubclass.value=state.subclass||"";
  editLevel.value=state.level;editHpCurrent.value=state.hpCurrent;editHpMax.value=state.hpMax;editTempHp.value=state.tempHp;
  editAc.value=state.ac;editInitiative.value=state.initiative;editSpeed.value=state.speed;editProf.value=state.proficiency;
  editAttackAbility.value=state.attackAbility||"STR";
  const hitDice=resourceByKey("hitDice");
  editHitDiceCurrent.value=hitDice?.current||0;editHitDiceMax.value=hitDice?.max||state.level;editHitDieType.value=state.hitDieType||"d10";
  renderAdvancedEdit();
  openEl("editModal");
}
function openLevel(){ hpRoll.value=7;state.selectedAdvancement="asi";document.querySelectorAll(".choice").forEach(c=>c.classList.toggle("selected",c.dataset.choice==="asi"));updateLevelPreview();openEl("levelModal");}
function updateLevelPreview(){
  const roll=Number(document.getElementById("hpRoll")?.value||7);
  const con=state.abilities.CON[1];
  const gain=Math.max(1,roll+con);
  const calc=document.getElementById("hpCalculation");
  if(calc){
    calc.innerHTML=appLanguage==="he"
      ?`${roll} + חוסן (${signed(con)}) = <b class="bonus">${gain} נק״פ נוספות</b>`
      :`${roll} + CON (${signed(con)}) = <b class="bonus">${gain} additional HP</b>`;
  }
  const advancement=state.selectedAdvancement==="asi"
    ?(appLanguage==="he"
      ?"<b>שיפור ערכי תכונה</b><br><span class='tiny'>באב־הטיפוס: כוח +1 וחוסן +1.</span>"
      :"<b>Ability Score Improvement</b><br><span class='tiny'>In the prototype: Strength +1 and Constitution +1.</span>")
    :(appLanguage==="he"
      ?"<b>Feat</b><br><span class='tiny'>במערכת המלאה ייפתח מסך בחירה עם הסבר לכל כישרון זמין.</span>"
      :"<b>Feat</b><br><span class='tiny'>The full system will open a selection screen with an explanation for every available Feat.</span>");
  const advancementElement=document.getElementById("advancementDetails");
  if(advancementElement)advancementElement.innerHTML=advancement;
  const preview=document.getElementById("levelPreview");
  if(preview){
    preview.innerHTML=appLanguage==="he"
      ?`<b>תצוגה מקדימה לרמה ${state.level+1}</b><br>נק״פ חדשות: ${state.hpMax+gain}<br>בחירה: ${state.selectedAdvancement==="asi"?"שיפור תכונות":"כישרון"}<br><span class="tiny">השינויים נשמרים רק לאחר אישור.</span>`
      :`<b>Preview for Level ${state.level+1}</b><br>New HP: ${state.hpMax+gain}<br>Choice: ${state.selectedAdvancement==="asi"?"Ability Score Improvement":"Feat"}<br><span class="tiny">Changes are saved only after confirmation.</span>`;
  }
}


const ABILITY_CAROUSEL_DURATION=430;
const ABILITY_SWIPE_THRESHOLD=32;
const ABILITY_VELOCITY_THRESHOLD=.24;
const ABILITY_EDGE_RESISTANCE=.28;

function abilityCarouselIsMobile(){
  return window.matchMedia("(max-width:959px)").matches;
}

function abilityCarouselParts(){
  const viewport=document.getElementById("skillsAbilityGroups");
  const track=viewport?.querySelector(".skills-ability-track");
  const cards=track?[...track.querySelectorAll(".skills-ability-card")]:[];
  return {viewport,track,cards};
}

function abilityCarouselTargetX(viewport,card){
  return appLanguage==="he"
    ?viewport.clientWidth-card.offsetLeft-card.offsetWidth
    :-card.offsetLeft;
}

function abilityCarouselTargets(viewport,cards){
  return cards.map(card=>abilityCarouselTargetX(viewport,card));
}

function abilityCarouselCurrentX(track){
  const transform=getComputedStyle(track).transform;
  if(!transform||transform==="none")return 0;
  if(typeof DOMMatrixReadOnly!=="undefined"){
    try{return new DOMMatrixReadOnly(transform).m41;}catch{}
  }
  const match=transform.match(/matrix(?:3d)?\((.+)\)/);
  if(!match)return 0;
  const values=match[1].split(",").map(Number);
  return values.length===16?values[12]:values[4]||0;
}

function setAbilityTrackX(track,x,{animate=false,duration=ABILITY_CAROUSEL_DURATION}={}){
  track.style.transition=animate
    ?`transform ${duration}ms cubic-bezier(.22,.78,.24,1)`
    :"none";
  track.style.transform=`translate3d(${x}px,0,0)`;
}

function clampAbilityIndex(index,count){
  return Math.max(0,Math.min(count-1,index));
}

function syncAbilityTransformCarousel({animate=false}={}){
  const {viewport,track,cards}=abilityCarouselParts();
  if(!viewport||!track||!cards.length)return;

  if(!abilityCarouselIsMobile()){
    track.style.transition="none";
    track.style.transform="";
    viewport.classList.remove("is-dragging","is-animating");
    return;
  }

  const index=clampAbilityIndex(Number(viewport.dataset.carouselIndex)||0,cards.length);
  viewport.dataset.carouselIndex=String(index);
  const targets=abilityCarouselTargets(viewport,cards);
  setAbilityTrackX(track,targets[index],{animate});
}

function initNaturalAbilityCarousel(){
  const {viewport}=abilityCarouselParts();
  if(!viewport||viewport.dataset.naturalCarousel==="true")return;
  viewport.dataset.naturalCarousel="true";
  viewport.dataset.carouselIndex=viewport.dataset.carouselIndex||"0";

  let startFingerX=0;
  let startFingerY=0;
  let lastFingerX=0;
  let startTrackX=0;
  let startIndex=0;
  let gestureStartedAt=0;
  let horizontalGesture=false;

  viewport.addEventListener("touchstart",event=>{
    if(!abilityCarouselIsMobile()||event.touches.length!==1)return;
    const {track,cards}=abilityCarouselParts();
    if(!track||!cards.length)return;

    const touch=event.touches[0];
    startFingerX=lastFingerX=touch.clientX;
    startFingerY=touch.clientY;
    startIndex=clampAbilityIndex(Number(viewport.dataset.carouselIndex)||0,cards.length);
    gestureStartedAt=performance.now();
    horizontalGesture=false;

    startTrackX=abilityCarouselCurrentX(track);
    setAbilityTrackX(track,startTrackX);
    viewport.classList.remove("is-animating");
  },{passive:true});

  viewport.addEventListener("touchmove",event=>{
    if(!abilityCarouselIsMobile()||event.touches.length!==1)return;
    const {track,cards}=abilityCarouselParts();
    if(!track||!cards.length)return;

    const touch=event.touches[0];
    const dx=touch.clientX-startFingerX;
    const dy=touch.clientY-startFingerY;

    if(!horizontalGesture){
      if(Math.abs(dx)<6)return;
      if(Math.abs(dy)>Math.abs(dx))return;
      horizontalGesture=true;
      viewport.classList.add("is-dragging");
    }

    event.preventDefault();
    lastFingerX=touch.clientX;

    const targets=abilityCarouselTargets(viewport,cards);
    const minimum=Math.min(...targets);
    const maximum=Math.max(...targets);
    let nextX=startTrackX+dx; // The card follows the finger in the same direction.

    if(nextX<minimum)nextX=minimum+(nextX-minimum)*ABILITY_EDGE_RESISTANCE;
    if(nextX>maximum)nextX=maximum+(nextX-maximum)*ABILITY_EDGE_RESISTANCE;

    setAbilityTrackX(track,nextX);
  },{passive:false});

  function finishGesture(cancelled=false){
    if(!abilityCarouselIsMobile())return;
    const {track,cards}=abilityCarouselParts();
    if(!track||!cards.length)return;

    if(!horizontalGesture){
      viewport.classList.remove("is-dragging");
      return;
    }

    const dx=lastFingerX-startFingerX;
    const elapsed=Math.max(1,performance.now()-gestureStartedAt);
    const velocity=dx/elapsed;
    let targetIndex=startIndex;

    if(!cancelled&&(Math.abs(dx)>=ABILITY_SWIPE_THRESHOLD||Math.abs(velocity)>=ABILITY_VELOCITY_THRESHOLD)){
      targetIndex=appLanguage==="he"
        ?(dx>0?startIndex+1:startIndex-1)
        :(dx<0?startIndex+1:startIndex-1);
    }

    targetIndex=clampAbilityIndex(targetIndex,cards.length);
    viewport.dataset.carouselIndex=String(targetIndex);
    const targets=abilityCarouselTargets(viewport,cards);

    viewport.classList.remove("is-dragging");
    viewport.classList.add("is-animating");
    setAbilityTrackX(track,targets[targetIndex],{animate:true});
  }

  viewport.addEventListener("touchend",()=>finishGesture(false),{passive:true});
  viewport.addEventListener("touchcancel",()=>finishGesture(true),{passive:true});

  viewport.addEventListener("transitionend",event=>{
    if(event.propertyName!=="transform")return;
    viewport.classList.remove("is-animating");
  });

  let resizeTimer=0;
  window.addEventListener("resize",()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>syncAbilityTransformCarousel(),80);
  });

  requestAnimationFrame(()=>syncAbilityTransformCarousel());
}

function pageTitle(page){
  const titles={
    home:{en:"Character Hub",he:"Character Hub"},
    combat:{en:"Combat",he:"קרב"},
    inventory:{en:"Inventory",he:"מלאי"},
    skills:{en:"Skills & Abilities",he:"מיומנויות ותכונות"},
    feats:{en:"Feats & Features",he:"Feats & Features"},
    more:{en:"More",he:"עוד"}
  };
  return titles[page]?.[appLanguage]||page;
}
function navigateToPage(page){
  const target=document.getElementById(page);
  if(!target)return;
  document.querySelectorAll(".nav-btn").forEach(button=>button.classList.toggle("active",button.dataset.page===page));
  document.querySelectorAll(".page").forEach(section=>section.classList.remove("active"));
  target.classList.add("active");
  document.getElementById("screenTitle").textContent=pageTitle(page);
  if(page==="skills")requestAnimationFrame(()=>syncAbilityTransformCarousel());
  window.scrollTo?.({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>navigateToPage(btn.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>navigateToPage(button.dataset.go)));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeEl(b.dataset.close)));
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;
  const openOverlays=[...document.querySelectorAll(".modal-backdrop.open,.sheet-backdrop.open")];
  const top=openOverlays.at(-1);
  if(top?.id)closeEl(top.id);
});
document.querySelectorAll(".sheet-backdrop,.modal-backdrop").forEach(x=>x.addEventListener("click",e=>{if(e.target===x)x.classList.remove("open")}));
document.querySelectorAll("[data-info]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();showInfo(el.dataset.info)}));
document.querySelectorAll(".stat-card").forEach(el=>{
  el.addEventListener("click",()=>showInfo(el.dataset.info));
  el.addEventListener("keydown",event=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    event.preventDefault();showInfo(el.dataset.info);
  });
});
document.querySelectorAll(".accordion>button").forEach(b=>b.addEventListener("click",()=>b.parentElement.classList.toggle("open")));

document.querySelectorAll(".combat-section-toggle").forEach(button=>{
  button.addEventListener("click",()=>{
    const section=button.closest(".combat-section");
    const key=section?.dataset.combatSection;
    if(!key)return;
    if(section.dataset.animating==="true")return;
    if(key==="status"&&state.hpCurrent===0){
      toast(appLanguage==="he"?"אזור מצב הקרב נשאר פתוח בזמן גלגולי הצלה ממוות":"Combat Status remains open during Death Saving Throws");
      return;
    }
    const currentlyOpen=section.classList.contains("open");
    setCombatSectionOpen(key,!currentlyOpen);
  });
});

document.getElementById("manageResourcesBtn")?.addEventListener("click",openResourceManager);
document.getElementById("manageTraitsBtn")?.addEventListener("click",openTraitManager);
moreTraits.onclick=openTraitManager;
mobileMoreBtn.onclick=()=>navigateToPage("more");
skillsEditBtn.onclick=openEdit;
traitsManageBtn.onclick=openTraitManager;
traitsAddBtn.onclick=()=>openTraitEditor(-1);
addTraitBtn.onclick=()=>openTraitEditor(-1);
traitResourceMode.addEventListener("change",updateTraitResourceFields);
traitResourceRecharge.addEventListener("change",updateTraitRechargeFields);
traitResourceRechargeMode.addEventListener("change",updateTraitRechargeFields);
saveTraitBtn.onclick=()=>{
  const localized={
    he:{
      name:traitNameHe.value.trim(),
      shortDesc:traitShortDescHe.value.trim(),
      description:traitDescriptionHe.value.trim(),
      trigger:traitTriggerHe.value.trim(),
      sourceName:traitSourceNameHe.value.trim()
    },
    en:{
      name:traitNameEn.value.trim(),
      shortDesc:traitShortDescEn.value.trim(),
      description:traitDescriptionEn.value.trim(),
      trigger:traitTriggerEn.value.trim(),
      sourceName:traitSourceNameEn.value.trim()
    },
    legacy:{...(editingTraitIndex>=0?state.traits[editingTraitIndex]?.localized?.legacy||{}:{})}
  };
  const name=canonicalLocalizedValue(localized,"name","");
  if(!name){toast(appLanguage==="he"?"יש להזין שם בעברית או באנגלית":"Enter a name in Hebrew or English");return;}

  let resourceId="";
  if(traitResourceMode.value==="existing"){
    resourceId=traitExistingResource.value||"";
    if(!resourceId){
      toast(appLanguage==="he"?"יש לבחור משאב קיים":"Select an existing Resource");
      return;
    }
  }else if(traitResourceMode.value==="create"){
    const max=Math.max(1,Number(traitResourceMax.value)||1);
    const current=Math.max(0,Math.min(max,Number(traitResourceCurrent.value)||0));
    const resource=normalizeResource({
      name,current,max,
      useCost:Math.max(1,Number(traitResourceCost.value)||1),
      recharge:traitResourceRecharge.value,
      rechargeMode:traitResourceRechargeMode.value,
      rechargeValue:Math.max(0,Number(traitResourceRechargeValue.value)||0),
      action:traitActivation.value,
      showInCombat:true,
      localized:{
        he:{name:`${localized.he.name||"יכולת"} — משאב`,desc:localized.he.description||localized.he.shortDesc,sourceName:localized.he.sourceName},
        en:{name:`${localized.en.name||"Feature"} Resource`,desc:localized.en.description||localized.en.shortDesc,sourceName:localized.en.sourceName}
      },
      useHebrewName:traitUseHebrewName.checked,
      desc:localized.en.description||localized.en.shortDesc||localized.he.description||localized.he.shortDesc,
      sourceType:traitSourceType.value,
      sourceName:localized.en.sourceName||localized.he.sourceName,
      unlockLevel:traitUnlockLevel.value.trim(),
      upgradeLevels:""
    },state.resources.length);
    state.resources.push(resource);
    resourceId=resource.id;
  }

  const existing=editingTraitIndex>=0?state.traits[editingTraitIndex]:null;
  const trait=normalizeTrait({
    ...existing,
    localized,
    useHebrewName:traitUseHebrewName.checked,
    name,
    category:traitCategory.value,
    activation:traitActivation.value,
    shortDesc:canonicalLocalizedValue(localized,"shortDesc",""),
    description:canonicalLocalizedValue(localized,"description",""),
    trigger:canonicalLocalizedValue(localized,"trigger",""),
    showInCombat:traitShowCombat.checked,
    sourceType:traitSourceType.value,
    sourceName:canonicalLocalizedValue(localized,"sourceName",""),
    unlockLevel:traitUnlockLevel.value.trim(),
    upgradeLevels:traitUpgradeLevels.value.trim(),
    resourceId
  },editingTraitIndex);

  if(editingTraitIndex>=0)state.traits[editingTraitIndex]=trait;
  else state.traits.push(trait);
  save();render();closeEl("traitEditModal");renderTraitManager();
  toast(appLanguage==="he"?"ה־Feat או ה־Feature נשמרו":"The Feat or Feature was saved");
};
moreResources.onclick=openResourceManager;
addResourceBtn.onclick=()=>openResourceEditor(-1);
resourceRecharge.addEventListener("change",updateResourceRechargeFields);
resourceRechargeMode.addEventListener("change",updateResourceRechargeFields);
saveResourceBtn.onclick=()=>{
  const localized={
    he:{name:resourceNameHe.value.trim(),desc:resourceDescHe.value.trim(),sourceName:resourceSourceNameHe.value.trim()},
    en:{name:resourceNameEn.value.trim(),desc:resourceDescEn.value.trim(),sourceName:resourceSourceNameEn.value.trim()},
    legacy:{...(editingResourceIndex>=0?state.resources[editingResourceIndex]?.localized?.legacy||{}:{})}
  };
  const name=canonicalLocalizedValue(localized,"name","");
  if(!name){toast(appLanguage==="he"?"יש להזין שם בעברית או באנגלית":"Enter a name in Hebrew or English");return;}
  const max=Math.max(1,Number(resourceMax.value)||1);
  const current=Math.max(0,Math.min(max,Number(resourceCurrent.value)||0));
  const existing=editingResourceIndex>=0?state.resources[editingResourceIndex]:null;
  const resource=normalizeResource({
    ...existing,
    localized,
    useHebrewName:resourceUseHebrewName.checked,
    name,
    desc:canonicalLocalizedValue(localized,"desc",""),
    action:resourceAction.value,
    useCost:Math.max(1,Number(resourceUseCost.value)||1),
    current,max,
    showInCombat:resourceShowCombat.checked,
    recharge:resourceRecharge.value,
    rechargeMode:resourceRechargeMode.value,
    rechargeValue:Math.max(0,Number(resourceRechargeValue.value)||0),
    sourceType:resourceSourceType.value,
    sourceName:canonicalLocalizedValue(localized,"sourceName",""),
    unlockLevel:resourceUnlockLevel.value.trim(),
    upgradeLevels:resourceUpgradeLevels.value.trim()
  },editingResourceIndex);
  if(editingResourceIndex>=0)state.resources[editingResourceIndex]=resource;
  else state.resources.push(resource);
  save();render();closeEl("resourceEditModal");renderResourceManager();
  toast(appLanguage==="he"?"המשאב נשמר":"The Resource was saved");
};
editBtn.onclick=openEdit;moreEdit.onclick=openEdit;
levelBtn.onclick=openLevel;
addItemBtn.onclick=()=>openItemEditor();
newCharacterBtn.onclick=()=>openEl("newCharModal");
editCoinsBtn.onclick=()=>{
  coinCP.value=state.coins.CP;coinSP.value=state.coins.SP;coinEP.value=state.coins.EP;coinGP.value=state.coins.GP;coinPP.value=state.coins.PP;
  openEl("coinsModal");
};
saveCoinsBtn.onclick=()=>{
  state.coins={CP:Math.max(0,Number(coinCP.value)||0),SP:Math.max(0,Number(coinSP.value)||0),EP:Math.max(0,Number(coinEP.value)||0),GP:Math.max(0,Number(coinGP.value)||0),PP:Math.max(0,Number(coinPP.value)||0)};
  save();render();closeEl("coinsModal");
  toast(appLanguage==="he"?"המטבעות עודכנו":"Coins were updated");
};
damageBtn.onclick=()=>{
  let amount=Math.max(0,Number(hpChangeAmount.value)||0);
  if(amount<=0){
    toast(appLanguage==="he"?"הזן כמות נזק":"Enter a damage amount");
    return;
  }

  if(state.hpCurrent===0){
    state.pendingZeroDamage=amount;
    document.getElementById("zeroDamageText").innerHTML=appLanguage==="he"
      ?`הדמות נמצאת ב־0 נק״פ ועומדת לספוג <b>${amount}</b> נזק. האם זו הייתה פגיעה קריטית?`
      :`The character is at 0 HP and is about to take <b>${amount}</b> damage. Was the hit a Critical Hit?`;
    hpChangeAmount.value="";
    openEl("zeroDamageModal");
    return;
  }

  const original=amount;
  const tempUsed=Math.min(state.tempHp,amount);
  state.tempHp-=tempUsed;
  amount-=tempUsed;
  const hpBefore=state.hpCurrent;
  state.hpCurrent=Math.max(0,hpBefore-amount);
  const overflow=Math.max(0,amount-hpBefore);

  if(state.hpCurrent===0&&overflow>=state.hpMax){
    state.deathSaves.dead=true;
    state.deathSaves.stabilized=false;
    state.deathSaves.cause="massive";
    state.hpLastChange=appLanguage==="he"
      ?`נגרמו ${original} נזק (${tempUsed} נספגו בנקודות הפגיעה הזמניות). נזק עצום: הדמות מסומנת כמתה.`
      :`${original} damage was dealt (${tempUsed} absorbed by Temporary HP). Massive Damage: the character is marked as dead.`;
  }else if(state.hpCurrent===0){
    state.hpLastChange=appLanguage==="he"
      ?`נגרמו ${original} נזק (${tempUsed} נספגו בנקודות הפגיעה הזמניות). הדמות ירדה ל־0 נק״פ.`
      :`${original} damage was dealt (${tempUsed} absorbed by Temporary HP). The character dropped to 0 HP.`;
  }else{
    state.hpLastChange=appLanguage==="he"
      ?`נגרמו ${original} נזק (${tempUsed} נספגו בנקודות הפגיעה הזמניות).`
      :`${original} damage was dealt (${tempUsed} absorbed by Temporary HP).`;
  }
  hpChangeAmount.value="";
  save();render();
  toast(appLanguage==="he"?"הנזק עודכן":"Damage was applied");
};
healBtn.onclick=()=>{
  const amount=Math.max(0,Number(hpChangeAmount.value)||0);
  if(amount<=0){
    toast(appLanguage==="he"?"הזן כמות ריפוי":"Enter a healing amount");
    return;
  }
  applyHealing(amount,appLanguage==="he"?"ריפוי ידני":"Manual Healing");
  hpChangeAmount.value="";
  save();render();
  toast(appLanguage==="he"?"נקודות הפגיעה עודכנו":"HP was updated");
};

zeroNormalDamageBtn.onclick=()=>resolveDamageAtZero(false);
zeroCriticalDamageBtn.onclick=()=>resolveDamageAtZero(true);
combatToggleBtn.onclick=toggleCombat;
editTempHpBtn.onclick=()=>{
  tempHpInput.value=state.tempHp;
  openEl("tempHpModal");
};
clearTempHpBtn.onclick=()=>{
  state.tempHp=0;
  state.hpLastChange=appLanguage==="he"
    ?"נקודות הפגיעה הזמניות אופסו ידנית."
    :"Temporary HP were reset manually.";
  save();render();toast(appLanguage==="he"?"נקודות הפגיעה הזמניות אופסו":"Temporary HP were reset");
};
saveTempHpBtn.onclick=()=>{
  state.tempHp=Math.max(0,Number(tempHpInput.value)||0);
  state.hpLastChange=appLanguage==="he"
    ?`נקודות הפגיעה הזמניות עודכנו ל־${state.tempHp}.`
    :`Temporary HP were updated to ${state.tempHp}.`;
  save();render();closeEl("tempHpModal");
  toast(appLanguage==="he"?"נקודות הפגיעה הזמניות עודכנו":"Temporary HP were updated");
};

endTurnBtn.onclick=()=>{
  state.extraActionActive=false;
  state.hpLastChange=appLanguage==="he"
    ?"התור הסתיים; הפעולה הנוספת מפרץ פעולה נוקתה."
    :"The turn ended; the additional Action from Action Surge was cleared.";
  save();render();toast(appLanguage==="he"?"התור הסתיים":"Turn ended");
};
deathSuccessBtn.onclick=()=>{
  if(state.hpCurrent!==0 || state.deathSaves.dead || state.deathSaves.stabilized)return;
  state.deathSaves.successes+=1;updateDeathState();save();render();
};
deathFailureBtn.onclick=()=>{
  if(state.hpCurrent!==0 || state.deathSaves.dead || state.deathSaves.stabilized)return;
  state.deathSaves.failures+=1;updateDeathState();save();render();
};
deathNat20Btn.onclick=()=>{
  state.hpCurrent=1;
  resetDeathSaves();
  state.hpLastChange=appLanguage==="he"
    ?"20 טבעי בגלגול הצלה ממוות: חזרת ל־1 נק״פ."
    :"Natural 20 on a Death Saving Throw: you returned to 1 HP.";
  save();render();
  toast(appLanguage==="he"?"חזרת ל־1 נק״פ":"You returned to 1 HP");
};
deathNat1Btn.onclick=()=>{
  if(state.hpCurrent!==0 || state.deathSaves.dead || state.deathSaves.stabilized)return;
  state.deathSaves.failures+=2;updateDeathState();save();render();
};
deathStableBtn.onclick=()=>{
  if(state.hpCurrent!==0)return;
  state.deathSaves.stabilized=true;state.deathSaves.dead=false;save();render();
};
deathHealingBtn.onclick=()=>{
  setCombatSectionOpen("status",true);
  hpChangeAmount.focus();
  hpChangeAmount.scrollIntoView?.({behavior:"smooth",block:"center"});
  toast(appLanguage==="he"?"הזן את כמות הריפוי ולחץ על ריפוי":"Enter the healing amount and press Heal");
};
deathResetBtn.onclick=()=>{
  resetDeathSaves();save();render();
  toast(appLanguage==="he"?"גלגולי ההצלה ממוות אופסו":"Death Saving Throws were reset");
};

shortRestBtn.onclick=openShortRest;
shortRestRoll.addEventListener("input",updateShortRestModal);
spendHitDieBtn.onclick=()=>{
  const hitDice=resourceByKey("hitDice");
  const dieMax=Number((state.hitDieType||"d10").replace("d",""))||10;
  const roll=Math.max(1,Math.min(dieMax,Number(shortRestRoll.value)||0));
  if(!roll){
    toast(appLanguage==="he"?`הזן תוצאה בין 1 ל־${dieMax}`:`Enter a result between 1 and ${dieMax}`);
    return;
  }
  if(hitDice.current<=0){
    toast(appLanguage==="he"?"לא נשארו קוביות פגיעה":"No Hit Dice remain");
    return;
  }
  const con=state.abilities.CON[1];
  const before=state.hpCurrent;
  const healing=Math.max(0,roll+con);
  state.hpCurrent=Math.min(state.hpMax,state.hpCurrent+healing);
  const actual=state.hpCurrent-before;
  hitDice.current-=1;
  state.shortRestSession.diceSpent+=1;
  state.shortRestSession.healed+=actual;
  state.shortRestSession.entries.unshift(appLanguage==="he"
    ?`${state.hitDieType||"d10"}: ${roll} + חוסן ${signed(con)} = ${healing}; בפועל הוחזרו ${actual} נק״פ.`
    :`${state.hitDieType||"d10"}: ${roll} + CON ${signed(con)} = ${healing}; ${actual} HP were actually restored.`);
  shortRestRoll.value="";
  updateShortRestModal();save();render();
};
cancelShortRestBtn.onclick=()=>{
  if(shortRestSnapshot){state=structuredClone(shortRestSnapshot);save();render();}
  state.shortRestSession=null;shortRestSnapshot=null;closeEl("shortRestModal");
  toast(appLanguage==="he"?"המנוחה הקצרה בוטלה":"The Short Rest was cancelled");
};
completeShortRestBtn.onclick=()=>{
  const resourcesRecharged=rechargeCharacterResources("Short Rest");
  rechargeQueue=[];
  const magicRecharged=rechargeMagicPowers("Short Rest");
  const healed=state.shortRestSession?.healed||0;
  const spent=state.shortRestSession?.diceSpent||0;
  state.hpLastChange=appLanguage==="he"
    ?`המנוחה הקצרה הושלמה: בוזבזו ${spent} קוביות פגיעה, הוחזרו ${healed} נק״פ, חודשו ${resourcesRecharged} משאבים ו־${magicRecharged} כוחות קסומים.`
    :`Short Rest completed: ${spent} Hit Dice were spent, ${healed} HP were restored, ${resourcesRecharged} Resources and ${magicRecharged} magical powers recharged.`;
  state.shortRestSession=null;shortRestSnapshot=null;save();render();closeEl("shortRestModal");
  toast(appLanguage==="he"?"המנוחה הקצרה הושלמה":"Short Rest completed");
  if(rechargeQueue.length)openNextRechargePrompt();
};

confirmConsumableBtn.onclick=()=>{
  const item=state.inventory[activeConsumableIndex];
  if(!item||item.qty<=0||item.destroyed){closeEl("consumableModal");return;}
  const c=item.consumable||{};
  if(c.effectType==="Healing"){
    const amount=Math.max(0,Number(healingAmount.value)||0);
    if(amount<=0){toast(appLanguage==="he"?"הזן את תוצאת הריפוי":"Enter the healing result");return;}
    applyHealing(amount,item.name);
  } else {
    state.hpLastChange=appLanguage==="he"
      ?`נעשה שימוש ב־${item.name}.`
      :`${item.name} was used.`;
  }
  if(c.consumedOnUse!==false)item.qty=Math.max(0,item.qty-1);
  save();render();closeEl("consumableModal");
  toast(appLanguage==="he"
    ?`${item.name}: נשארו x${item.qty}`
    :`${item.name}: x${item.qty} remaining`);
};

document.getElementById("editPortraitFile")?.addEventListener("change",async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    pendingPortraitImage=await resizePortraitFile(file);
    state.portraitImage=pendingPortraitImage;
    updatePortraitEditorPreview();render();
    const stored=save();
    toast(stored?"Character image updated":"Image shown, but local storage is full. Try a smaller image.");
  }catch(error){toast(error.message||"Could not process the selected image. Use PNG, JPG or WebP.");}
  event.target.value="";
});
document.getElementById("editPortraitRemoveBtn")?.addEventListener("click",()=>{
  pendingPortraitImage="";state.portraitImage="";updatePortraitEditorPreview();render();save();
  toast("Character image removed");
});

saveEditBtn.onclick=()=>{
  state.name=editName.value.trim()||state.name;
  state.portraitImage=pendingPortraitImage||"";
  state.race=editRace.value;state.className=editClass.value;state.subclass=editSubclass.value.trim();
  state.level=Math.max(1,Number(editLevel.value)||1);
  state.hpMax=Math.max(1,Number(editHpMax.value)||1);
  state.hpCurrent=Math.max(0,Math.min(state.hpMax,Number(editHpCurrent.value)||0));
  state.tempHp=Math.max(0,Number(editTempHp.value)||0);
  state.ac=Number(editAc.value)||10;
  state.initiative=Number(editInitiative.value)||0;
  state.speed=Math.max(0,Number(editSpeed.value)||0);
  state.proficiency=Number(editProf.value)||0;
  state.attackAbility=editAttackAbility.value;

  Object.keys(state.abilities).forEach(key=>{
    const value=Math.max(1,Math.min(30,Number(document.getElementById(`editAbility_${key}`).value)||10));
    state.abilities[key]=[value,abilityMod(value)];
  });

  const hitDice=resourceByKey("hitDice");
  hitDice.max=Math.max(0,Number(editHitDiceMax.value)||0);
  hitDice.current=Math.max(0,Math.min(hitDice.max,Number(editHitDiceCurrent.value)||0));
  state.hitDieType=editHitDieType.value;

  skillDefs.forEach(def=>{
    state.skillProficiencies[def.key]=document.getElementById(`editSkillStatus_${def.key}`).value;
    const raw=document.getElementById(`editSkillOverride_${def.key}`).value.trim();
    if(raw==="") delete state.skillOverrides[def.key];
    else state.skillOverrides[def.key]=Number(raw);
  });
  saveDefs.forEach(def=>{
    state.saveProficiencies[def.key]=document.getElementById(`editSaveStatus_${def.key}`).value==="proficient";
    const raw=document.getElementById(`editSaveOverride_${def.key}`).value.trim();
    if(raw==="") delete state.saveOverrides[def.key];
    else state.saveOverrides[def.key]=Number(raw);
  });

  if(state.hpCurrent>0) resetDeathSaves();
  state.schemaVersion=995;
  save();render();closeEl("editModal");
  toast(appLanguage==="he"?"הדמות עודכנה":"The character was updated");
};
saveItemBtn.onclick=()=>{
  const item=collectItemFromEditor();
  if(!canonicalLocalizedValue(item.localized,"name","")){
    toast(appLanguage==="he"?"צריך להזין שם בעברית או באנגלית":"Enter an item name in Hebrew or English");
    return;
  }
  if(itemCategory(item)==="Weapon"&&!item.weapon?.damageDice){
    toast(appLanguage==="he"?"צריך להזין נוסחת נזק":"Enter a damage formula");
    return;
  }
  if(editingItemIndex===null)state.inventory.push(item);
  else state.inventory[editingItemIndex]=item;
  state.schemaVersion=995;
  const wasNew=editingItemIndex===null;
  save();render();closeEl("itemModal");
  toast(appLanguage==="he"
    ?(wasNew?"החפץ נוסף":"החפץ עודכן בכל המסכים")
    :(wasNew?"The item was added":"The item was updated on every screen"));
  editingItemIndex=null;itemDraftSource=null;itemDraftPowers=[];itemDraftPowerOpen=new Set();
};

itemType.addEventListener("change",()=>{
  renderItemCategoryFields();
  scheduleItemEditorPreview();
});
itemMagical.addEventListener("change",updateMagicalVisibility);
document.getElementById("itemModal").addEventListener("input",scheduleItemEditorPreview);
document.getElementById("itemModal").addEventListener("change",scheduleItemEditorPreview);
document.getElementById("traitEditModal").addEventListener("input",updateTraitEditorPreview);
document.getElementById("traitEditModal").addEventListener("change",updateTraitEditorPreview);
traitExistingResource.addEventListener("change",updateTraitEditorPreview);
addMagicPropertyBtn.onclick=()=>{
  syncPowerDraftFromDom();
  itemDraftPowers.push(blankMagicPower());
  itemDraftPowerOpen=new Set([itemDraftPowers.length-1]);
  renderMagicPropertiesEditor();
};
confirmDepletionBtn.onclick=()=>resolveDepletion(true);
skipDepletionBtn.onclick=()=>resolveDepletion(false);
rechargeAmountInput.addEventListener("input",()=>{
  const entry=rechargeQueue[0];
  if(!entry)return;
  const found=findPowerByIds(entry.itemId,entry.powerId);
  if(!found)return;
  const amount=Math.max(0,Number(rechargeAmountInput.value)||0);
  rechargePreview.textContent=`${found.power.currentUses}/${found.power.maxUses} → ${Math.min(found.power.maxUses,found.power.currentUses+amount)}/${found.power.maxUses}`;
});
confirmRechargeBtn.onclick=()=>{
  const entry=rechargeQueue.shift();
  if(!entry){closeEl("rechargeModal");return;}
  const found=findPowerByIds(entry.itemId,entry.powerId);
  if(found){
    const amount=Math.max(0,Number(rechargeAmountInput.value)||0);
    found.power.currentUses=Math.min(found.power.maxUses,found.power.currentUses+amount);
    state.hpLastChange=appLanguage==="he"
      ?`${found.power.name} חודש ב־${amount} שימושים לפי גלגול ידני.`
      :`${found.power.name} recharged by ${amount} uses from a manual roll.`;
  }
  save();render();openNextRechargePrompt();
};
skipRechargeBtn.onclick=()=>{rechargeQueue.shift();openNextRechargePrompt();};

document.querySelectorAll(".choice").forEach(c=>c.addEventListener("click",()=>{
  state.selectedAdvancement=c.dataset.choice;document.querySelectorAll(".choice").forEach(x=>x.classList.toggle("selected",x===c));updateLevelPreview();
}));
hpRoll.addEventListener("input",updateLevelPreview);
confirmLevelBtn.onclick=()=>{
  const roll=Math.max(1,Math.min(10,Number(hpRoll.value)||1));const gain=Math.max(1,roll+state.abilities.CON[1]);
  state.level+=1;state.hpMax+=gain;state.hpCurrent=state.hpMax;
  if(state.selectedAdvancement==="asi"){state.abilities.STR[0]+=1;state.abilities.CON[0]+=1;syncAbilityModifiers();}
  save();render();closeEl("levelModal");
  toast(appLanguage==="he"?`עלית לרמה ${state.level}`:`Advanced to level ${state.level}`);
};

function updateDeathState(){
  state.deathSaves.successes=Math.max(0,Math.min(3,Number(state.deathSaves.successes)||0));
  state.deathSaves.failures=Math.max(0,Math.min(3,Number(state.deathSaves.failures)||0));
  if(state.deathSaves.failures>=3){
    state.deathSaves.failures=3;state.deathSaves.dead=true;state.deathSaves.stabilized=false;state.deathSaves.cause="failures";
  }else if(state.deathSaves.successes>=3){
    state.deathSaves.successes=3;state.deathSaves.stabilized=true;state.deathSaves.dead=false;state.deathSaves.cause="";
  }
}
function handleDeathSaveAction(action){
  if(action==="healing"){
    const combatPage=document.getElementById("combat");
    if(!combatPage.classList.contains("combat-tools-open"))document.getElementById("combatToolsToggle")?.click();
    document.getElementById("hpChangeAmount")?.focus();
    document.getElementById("hpChangeAmount")?.scrollIntoView?.({behavior:"smooth",block:"center"});
    toast("Enter the healing amount and press Heal");
    return;
  }
  if(action==="reset"){
    resetDeathSaves();save();render();toast("Death Saving Throws were reset");return;
  }
  if(state.hpCurrent!==0)return;
  if(action==="nat20"){
    state.hpCurrent=1;resetDeathSaves();
    state.hpLastChange="Natural 20 on a Death Saving Throw: you returned to 1 HP.";
    save();render();toast("You returned to 1 HP");return;
  }
  if(state.deathSaves.dead||state.deathSaves.stabilized)return;
  if(action==="success")state.deathSaves.successes+=1;
  if(action==="failure")state.deathSaves.failures+=1;
  if(action==="nat1")state.deathSaves.failures+=2;
  if(action==="stable"){state.deathSaves.stabilized=true;state.deathSaves.dead=false;}
  updateDeathState();save();render();
}

function resetDeathSaves(){
  state.deathSaves={successes:0,failures:0,stabilized:false,dead:false,cause:""};
}
function performLongRest(){
  if(state.combatActive||state.hpCurrent===0){
    toast(state.hpCurrent===0?"A Long Rest cannot be taken at 0 HP":"A Long Rest cannot be taken during Combat");
    return;
  }
  const hpBefore=state.hpCurrent;
  const hitDice=resourceByKey("hitDice");
  let hitDiceRestored=0;
  if(hitDice){
    const before=hitDice.current;
    const regain=Math.max(1,Math.floor(hitDice.max/2));
    hitDice.current=Math.min(hitDice.max,hitDice.current+regain);
    hitDiceRestored=hitDice.current-before;
  }
  const resourcesRecharged=rechargeCharacterResources("Long Rest");
  rechargeQueue=[];
  const magicRecharged=rechargeMagicPowers("Long Rest");
  state.hpCurrent=state.hpMax;
  state.tempHp=0;
  state.extraActionActive=false;
  resetDeathSaves();
  state.hpLastChange=`Long Rest completed: HP ${hpBefore} → ${state.hpMax}; ${hitDiceRestored} Hit Dice, ${resourcesRecharged} Resources and ${magicRecharged} magical powers restored.`;
  save();
  render();
  toast("Long Rest completed");
  if(rechargeQueue.length)openNextRechargePrompt();
}
createNewBtn.onclick=()=>{
  state=structuredClone(defaultState);
  state.resources=normalizeResources(state.resources);
  state.inventory=state.inventory.map(normalizeInventoryItem);
  state.name=newName.value.trim()||(appLanguage==="he"?"גיבור חדש":"New Hero");
  state.race=newRace.value;
  state.className=newClass.value;
  state.subclass=newSubclass.value.trim();
  state.level=1;
  state.schemaVersion=995;
  state.inventoryUi={search:"",filter:"All",magicalOnly:false,sections:{weapons:true,armor:false,consumables:true,tools:false,general:false,destroyed:false},expandedItems:{}};
  state.traitUi={search:"",filter:"All",sections:{feat:true,"class feature":true,"subclass feature":false,"racial trait":false,homebrew:false,other:false},expanded:{}};
  state.hpCurrent=12;state.hpMax=12;state.tempHp=0;state.proficiency=2;
  state.traits=[];

  if(state.className==="Cleric"){
    state.traits.push(normalizeTrait({
      localized:{
        he:{name:"הטלת לחשים",shortDesc:"ניהול לחשים בהתאם לחוקי הקמפיין.",description:"השתמש בחוקי הטלת הלחשים ובאפשרויות שהוגדרו עבור הדמות בקמפיין.",trigger:"כאשר מטילים או מכינים לחש.",sourceName:"כוהן"},
        en:{name:"Spellcasting",shortDesc:"Manage spells according to the campaign rules.",description:"Use the spellcasting rules and options defined for the character in the campaign.",trigger:"When casting or preparing a spell.",sourceName:"Cleric"}
      },
      category:"Class Feature",activation:"Special",showInCombat:true,sourceType:"Class",unlockLevel:1
    }));
    state.traits.push(normalizeTrait({
      localized:{
        he:{name:"תיעול קדושה",shortDesc:"יכולת מקצוע שמשתנה לפי התחום הקדוש.",description:"השתמש באפשרות תיעול הקדושה המדויקת שמעניקים המקצוע ותת־המקצוע של הדמות.",trigger:"בהתאם לאפשרות שנבחרה.",sourceName:"כוהן"},
        en:{name:"Channel Divinity",shortDesc:"A Class Feature that changes according to the Divine Domain.",description:"Use the exact Channel Divinity option granted by the character's Class and Subclass.",trigger:"According to the selected option.",sourceName:"Cleric"}
      },
      category:"Class Feature",activation:"Special",showInCombat:true,sourceType:"Class",unlockLevel:2
    }));
  }
  if(state.race==="Dragonborn"){
    state.traits.push(normalizeTrait({
      localized:{
        he:{name:"נשק נשיפה",shortDesc:"התקפת נשיפה גזעית.",description:"השתמש בסוג המוצא, הנזק וגלגול ההצלה שנבחרו בקמפיין.",trigger:"כאשר מפעילים את נשק הנשיפה.",sourceName:"דרקוניד"},
        en:{name:"Breath Weapon",shortDesc:"A racial breath attack.",description:"Use the ancestry, damage and Saving Throw details selected by the campaign.",trigger:"When activating the Breath Weapon.",sourceName:"Dragonborn"}
      },
      category:"Racial Trait",activation:"Action",showInCombat:true,sourceType:"Race",unlockLevel:1
    }));
  }

  applyLocalizedStateView();
  save();render();closeEl("newCharModal");navigateToPage("home");
  toast(appLanguage==="he"?"נוצרה דמות חדשה":"A new character was created");
};
resetBtn.onclick=()=>{
  localStorage.removeItem("characterHubState");
  state=structuredClone(defaultState);
  state.resources=normalizeResources(state.resources);
  state.traits=normalizeTraits(state.traits);
  state.inventory=state.inventory.map(normalizeInventoryItem);
  state.inventoryUi={search:"",filter:"All",magicalOnly:false,sections:{weapons:true,armor:false,consumables:true,tools:false,general:false,destroyed:false},expandedItems:{}};
  state.traitUi={search:"",filter:"All",sections:{feat:true,"class feature":true,"subclass feature":false,"racial trait":false,homebrew:false,other:false},expanded:{}};
  applyLocalizedStateView();
  save();render();
  toast(appLanguage==="he"?"אב־הטיפוס אופס":"The prototype was reset");
};

document.querySelectorAll("[data-theme-choice]").forEach(button=>{
  button.addEventListener("click",()=>chooseTheme(button.dataset.themeChoice));
});
document.querySelectorAll("[data-language-choice]").forEach(button=>{
  button.addEventListener("click",()=>chooseLanguage(button.dataset.languageChoice));
});
applyTheme(themePreference,{persist:false});
applyLanguage(appLanguage,{persist:false,rerender:false});
applyLocalizedStateView();
render();
startLocalizationObserver();
localizeDocument(document.body);
initNaturalAbilityCarousel();
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js").catch(()=>{}); }

// v9.10.2 focused Combat workspace behavior
(function(){
  const combatPage=document.getElementById("combat");
  const tabs=[...document.querySelectorAll(".combat-tab")];
  const sectionMap={
    attacks:document.getElementById("combatAttacksSection"),
    abilities:document.getElementById("combatAbilitiesSection"),
    items:document.getElementById("combatQuickItemsSection"),
    recovery:document.getElementById("combatRecoverySection")
  };
  function selectCombatTab(name){
    if(!sectionMap[name])name="attacks";
    combatPage.dataset.activeCombatTab=name;
    tabs.forEach(button=>{
      const selected=button.dataset.combatTab===name;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-selected",String(selected));
    });
    Object.entries(sectionMap).forEach(([key,section])=>{
      section.classList.toggle("focused-combat-panel",key===name);
      if(key===name)syncCombatSection(section,true);
    });
  }
  tabs.forEach(button=>button.addEventListener("click",()=>selectCombatTab(button.dataset.combatTab)));
  document.getElementById("combatToolsToggle")?.addEventListener("click",()=>{
    const open=combatPage.classList.toggle("combat-tools-open");
    document.getElementById("combatToolsToggle").classList.toggle("active",open);
    document.getElementById("combatToolsToggle").setAttribute("aria-expanded",String(open));
    if(open)syncCombatSection(document.getElementById("combatStatusSection"),true);
  });
  document.querySelector("#combatStatusBar .combat-hp-tile")?.addEventListener("click",()=>document.getElementById("combatToolsToggle")?.click());
  selectCombatTab("attacks");
})();


// v9.10.3 — fit the Combat workspace to the available desktop viewport.
(function(){
  const combatPage=document.getElementById("combat");
  function updateCombatFit(){
    const widthScale=(window.innerWidth-220)/1320;
    const heightScale=(window.innerHeight-72)/910;
    const scale=Math.max(.74,Math.min(.94,widthScale,heightScale));
    combatPage.style.setProperty("--combat-fit",scale.toFixed(3));
  }
  updateCombatFit();
  window.addEventListener("resize",updateCombatFit,{passive:true});
})();
