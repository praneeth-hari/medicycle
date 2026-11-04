/* MediCycle app logic. Plain scripts, no build step, no backend. Data stays in this browser. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAY = 86400000;
  var KEY = "expirylens.v1";
  var SOON_DAYS = 60;
  var OPEN_DEFAULT = { drops: 28, liquid: 28, tablet: 0, cream: 0 };
  var OPEN_HINT = {
    drops: ["Most eye drops are thrown away about 28 days after opening. The leaflet overrides this.", "చాలా కంటి చుక్కలను తెరిచిన సుమారు 28 రోజుల తర్వాత పారవేయాలి. కరపత్రం చెప్పినదే ప్రధానం."],
    liquid: ["28 days is a common default. Check the label or leaflet and change the days if it says otherwise.", "28 రోజులు సాధారణ అంచనా. లేబుల్ లేదా కరపత్రం చూసి, వేరే చెబితే రోజులను మార్చండి."]
  };
  var SAMPLES = [
    { f: "carton.jpg", n: "Medicine carton" },
    { f: "strip-clear.jpg", n: "Clear strip" },
    { f: "strip-dim.jpg", n: "Dim light" },
    { f: "syrup.jpg", n: "Syrup bottle" },
    { f: "eyedrops.jpg", n: "Eye drops" },
    { f: "strip-blurred.jpg", n: "Blurred photo" }
  ];
  var MONTE = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"];
  var MONTE_S = ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జూలై", "ఆగ", "సెప్", "అక్టో", "నవం", "డిసెం"];
  var PTE = { day: "రోజులు", month: "నెలలు", medicine: "మందులు", item: "వస్తువులు", "expired medicine": "గడువు ముగిసిన మందులు" };
  var CATTE = { tablet: "మాత్రలు", liquid: "ద్రవం", drops: "చుక్కలు", cream: "క్రీమ్" };
  var L = function (en, te) { return state.lang === "te" ? te : en; };
  var MONN = function (m) { return state.lang === "te" ? MONTE[m - 1] : MON[m - 1]; };
  var TE = {
    safe: "సురక్షితం", soon: "త్వరగా వాడండి", expired: "గడువు ముగిసింది", expdate: "గడువు తేదీ",
    tabScan: "స్కాన్", tabCabinet: "అల్మారా", tabAsk: "అడగండి", tabReport: "నివేదిక"
  };
  var STATIC = {
    "How it works": "ఎలా పనిచేస్తుంది", "Try a sample": "నమూనా ప్రయత్నించండి", "About": "గురించి",
    "Check the date before you take it.": "వాడే ముందు తేదీ చూడండి.",
    "Scan a medicine pack. MediCycle reads the expiry date, remembers when you opened it, and tells you what to throw away.": "మందుల ప్యాక్‌ను స్కాన్ చేయండి. MediCycle గడువు తేదీని చదువుతుంది, మీరు ఎప్పుడు తెరిచారో గుర్తుంచుకుంటుంది, ఏది పారవేయాలో చెబుతుంది.",
    "Scan a medicine": "మందును స్కాన్ చేయండి", "Try a sample photo": "నమూనా ఫోటో ప్రయత్నించండి",
    "Runs in your browser. Nothing is uploaded. It helps you check dates and does not replace your pharmacist.": "ఇది మీ బ్రౌజర్‌లోనే పనిచేస్తుంది. ఏదీ అప్‌లోడ్ కాదు. తేదీలు చూసుకోవడానికి సహాయపడుతుంది, ఫార్మసిస్ట్ సలహాకు ప్రత్యామ్నాయం కాదు.",
    "Photograph the date.": "తేదీని ఫోటో తీయండి.", "Get close to the line that says EXP, in good light.": "EXP అని ఉన్న లైన్‌కు దగ్గరగా, మంచి వెలుతురులో తీయండి.",
    "Check what it read.": "అది చదివినదాన్ని చూడండి.", "MediCycle shows the date, how sure it is, and lets you fix it.": "MediCycle తేదీని, ఎంత నమ్మకంగా ఉందో చూపిస్తుంది, మీరు సరిచేయవచ్చు.",
    "Keep track.": "ట్రాక్ చేయండి.", "Save it to your cabinet. Opened syrups and drops get their own shorter deadline.": "మీ అల్మారాలో సేవ్ చేయండి. తెరిచిన సిరప్‌లు, చుక్కల మందులకు తక్కువ గడువు ఉంటుంది.",
    "MediCycle reads expiry dates from photos using OCR that runs on your device. Photos are not uploaded and your cabinet is saved only in this browser. The Ask tab answers from a small guide with a source for every answer, and it declines dosing and medical questions.": "MediCycle మీ పరికరంలోనే OCR ఉపయోగించి ఫోటోల నుండి గడువు తేదీలను చదువుతుంది. ఫోటోలు అప్‌లోడ్ కావు, మీ అల్మారా ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ అవుతుంది. అడగండి ట్యాబ్ చిన్న గైడ్ నుండి, ప్రతి సమాధానానికి మూలంతో జవాబిస్తుంది, మోతాదు, వైద్య ప్రశ్నలకు జవాబివ్వదు.",
    "MediCycle does not replace advice from your pharmacist or doctor. Always check the date on the pack yourself.": "MediCycle మీ ఫార్మసిస్ట్ లేదా డాక్టర్ సలహాకు ప్రత్యామ్నాయం కాదు. ప్యాక్ మీద తేదీని ఎల్లప్పుడూ మీరే చూసుకోండి.",
    "Photograph the printed date on the pack, close up and in good light.": "ప్యాక్ మీద ముద్రించిన తేదీని దగ్గరగా, మంచి వెలుతురులో ఫోటో తీయండి.",
    "Take a photo or upload": "ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి", "Point the camera at the line with EXP": "EXP ఉన్న లైన్ వైపు కెమెరా పెట్టండి",
    "Or try a demo sample": "లేదా డెమో నమూనా ప్రయత్నించండి", "Demo samples are illustrations made for this app.": "డెమో నమూనాలు ఈ యాప్ కోసం తయారుచేసిన చిత్రాలు.",
    "Medicine carton": "మందుల కార్టన్", "Clear strip": "స్పష్టమైన స్ట్రిప్", "Dim light": "తక్కువ వెలుతురు", "Syrup bottle": "సిరప్ సీసా", "Eye drops": "కంటి చుక్కలు", "Blurred photo": "మసకబారిన ఫోటో",
    "Month": "నెల", "Year": "సంవత్సరం", "Medicine name": "మందు పేరు", "Type": "రకం",
    "Tablets or capsules": "మాత్రలు లేదా క్యాప్సూల్స్", "Syrup or liquid": "సిరప్ లేదా ద్రవం", "Eye or ear drops": "కంటి లేదా చెవి చుక్కలు", "Cream, gel or ointment": "క్రీమ్, జెల్ లేదా లేపనం",
    "Already opened": "ఇప్పటికే తెరిచారు", "Opened on": "తెరిచిన తేదీ", "Use within (days)": "ఎన్ని రోజుల్లో వాడాలి",
    "Price paid, in rupees (optional)": "చెల్లించిన ధర, రూపాయల్లో (ఐచ్ఛికం)",
    "Save to cabinet": "అల్మారాలో సేవ్ చేయండి", "Fix date": "తేదీ సరిచేయండి", "Read aloud": "చదివి వినిపించు", "Scan another": "మరొకటి స్కాన్ చేయండి",
    "My cabinet": "నా అల్మారా", "Whose medicines?": "ఎవరి మందులు?", "Add person": "వ్యక్తిని చేర్చండి",
    "Cabinet score: share of medicines that are safe to use": "అల్మారా స్కోర్: వాడడానికి సురక్షితమైన మందుల శాతం",
    "All": "అన్నీ", "Use soon": "త్వరగా వాడండి", "Expired": "గడువు ముగిసింది",
    "Your cabinet is empty.": "మీ అల్మారా ఖాళీగా ఉంది.", "Scan a pack and save it here, or load demo data to see how it looks.": "ప్యాక్ స్కాన్ చేసి ఇక్కడ సేవ్ చేయండి, లేదా ఎలా ఉంటుందో చూడటానికి డెమో డేటా లోడ్ చేయండి.",
    "Load demo data": "డెమో డేటా లోడ్ చేయండి", "Print pharmacist report": "ఫార్మసిస్ట్ నివేదిక ప్రింట్ చేయండి", "Clear all data": "మొత్తం డేటా తొలగించండి",
    "Demo data is loaded. Clear all data removes it.": "డెమో డేటా లోడ్ అయింది. 'మొత్తం డేటా తొలగించండి' దానిని తొలగిస్తుంది.",
    "Ask about your medicines": "మీ మందుల గురించి అడగండి",
    "Ask about the medicines you scanned, or about storing and disposing of medicines. Dosing and medical questions are declined.": "మీరు స్కాన్ చేసిన మందుల గురించి, లేదా మందుల నిల్వ, పారవేయడం గురించి అడగండి. మోతాదు, వైద్య ప్రశ్నలకు జవాబు ఇవ్వదు.",
    "Send": "పంపండి", "Medicine wasted this year": "ఈ ఏడాది వృథా అయిన మందులు",
    "MediCycle helps you check dates. It does not replace advice from your pharmacist or doctor. Rupee totals use the prices you enter.": "MediCycle తేదీలు చూసుకోవడానికి సహాయపడుతుంది. ఇది మీ ఫార్మసిస్ట్ లేదా డాక్టర్ సలహాకు ప్రత్యామ్నాయం కాదు. రూపాయల మొత్తాలు మీరు ఇచ్చిన ధరలపై ఆధారపడతాయి.",
    "Scan": "స్కాన్", "Cabinet": "అల్మారా", "Ask": "అడగండి", "Report": "నివేదిక",
    "For example: Calcium tablets": "ఉదాహరణ: కాల్షియం మాత్రలు", "For the waste report": "వృథా నివేదిక కోసం", "Ask a question": "ప్రశ్న అడగండి"
  };
  var origText = new WeakMap(), origAttr = new WeakMap();
  function translateDom() {
    var te = state.lang === "te";
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, nodes = [];
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (n) {
      var p = n.parentElement; if (!p || p.closest("svg,script,style,#cabList,#chat,#printSheet,#toast")) return;
      var o = origText.has(n) ? origText.get(n) : n.nodeValue, key = o.trim();
      if (STATIC[key]) { origText.set(n, o); n.nodeValue = te ? o.replace(key, STATIC[key]) : o; }
    });
    document.querySelectorAll("[placeholder],[aria-label]").forEach(function (el) {
      ["placeholder", "aria-label"].forEach(function (a) {
        var v = el.getAttribute(a); if (v == null) return;
        var o = origAttr.get(el) || {}; if (!(a in o) && STATIC[v]) { o[a] = v; origAttr.set(el, o); }
        if (a in o) el.setAttribute(a, te ? STATIC[o[a]] : o[a]);
      });
    });
  }
  var KB_TE = {
    "expired-use": ["గడువు ముగిసిన మందు వాడటం", "గడువు తేదీ దాటిన మందును వాడకండి. దాని బలం లేదా మిశ్రమం మారవచ్చు, కాబట్టి అది సరిగా పనిచేయకపోవచ్చు లేదా ఎక్కువ ప్రమాదం కలిగించవచ్చు, కొన్ని మందుల్లో బ్యాక్టీరియా పెరగవచ్చు. బలహీనపడిన యాంటీబయాటిక్ ఇన్ఫెక్షన్‌ను తగ్గించకపోవచ్చు. గడువు ముగిసిన మందును ఫార్మసీకి తీసుకెళ్లండి."],
    "date-format": ["ముద్రించిన తేదీ అంటే ఏమిటి", "ప్యాక్ మీద EXP 08/2027 లాగా నెల, సంవత్సరం మాత్రమే ఉంటే, MediCycle ఆ నెల చివరి వరకు మందు వాడవచ్చని భావిస్తుంది. ప్యాక్ మీద వేరే విధంగా ఉంటే, ప్యాక్ చెప్పినట్లే చేయండి."],
    "eye-drops": ["తెరిచిన తర్వాత కంటి చుక్కలు", "చాలా కంటి చుక్కలను తెరిచిన సుమారు 28 రోజుల తర్వాత పారవేయాలి, తయారీదారు వేరే గడువు ఇస్తే తప్ప. కొన్ని ఉత్పత్తులు కొన్ని వారాల నుండి కొన్ని నెలల వరకు అనుమతిస్తాయి, కాబట్టి కరపత్రం చూడండి లేదా ఫార్మసిస్ట్‌ను అడగండి."],
    "liquids-open": ["తెరిచిన తర్వాత ద్రవ మందులు", "ద్రవ మందులకు తెరిచిన తర్వాత తరచుగా తక్కువ కాలం ఉంటుంది, అది ఉత్పత్తిని బట్టి మారుతుంది. లేబుల్ లేదా కరపత్రంలో ఉన్న రోజులను పాటించండి. లేకపోతే ఫార్మసిస్ట్‌ను అడగండి. ప్రతి మందుకు మీరు రోజులు నమోదు చేయవచ్చు."],
    "storage": ["మందులను ఎక్కడ ఉంచాలి", "మందులను చల్లని, పొడి చోట, నేరుగా సూర్యకాంతి, వేడి, తేమ లేని ప్రదేశంలో ఉంచండి. బాత్రూమ్, వంటగది, సింక్, రేడియేటర్ దగ్గర ఉంచకండి. వాటిని అసలు ప్యాకింగ్‌లోనే ఉంచి, లేబుల్ మీద ఉన్న నిల్వ సూచనలు పాటించండి."],
    "fridge": ["ఫ్రిజ్‌లో ఉంచే మందులు", "కొన్ని క్రీములు, కంటి చుక్కలు, ఇంజెక్షన్లు వంటి మందులను ఫ్రిజ్‌లో 2 నుండి 8 డిగ్రీల సెల్సియస్ వద్ద ఉంచుతారు. లేబుల్ పాటించండి: గడ్డకట్టకుండా వెనుక, పక్కల నుండి దూరంగా మధ్య అరలో, ఆహారానికి దూరంగా శుభ్రమైన డబ్బాలో ఉంచండి. కరెంటు పోతే మీ ఫార్మసీని సంప్రదించండి."],
    "looks-different": ["మందు భిన్నంగా కనిపించినప్పుడు లేదా వాసన వచ్చినప్పుడు", "తేదీ సరిగా ఉన్నా, మందు సాధారణంగా కంటే భిన్నంగా కనిపించినా, వాసన వచ్చినా, లేదా మాత్రలు పగిలినా, అతుక్కున్నా, ఆకారం మారినా వాడకండి. ఫార్మసిస్ట్‌ను అడగండి."],
    "dispose": ["వాడని లేదా గడువు ముగిసిన మందును పారవేయడం", "ఉత్తమ మార్గం వాడని లేదా గడువు ముగిసిన మందును ఫార్మసీ లేదా టేక్-బ్యాక్ కేంద్రానికి ఇవ్వడం. సూచనలు చెబితే తప్ప టాయిలెట్‌లో వేయకండి, ఇంటి చెత్తలో వేయకండి. టేక్-బ్యాక్ లేకపోతే, FDA పద్ధతి: మందును (పొడి చేయకుండా) మట్టి, పిల్లి ఇసుక లేదా కాఫీ పొడి వంటి అసహ్యకరమైన దానితో కలిపి, సంచిలో మూసి చెత్తలో వేయండి. లేబుల్‌పై వ్యక్తిగత వివరాలను కొట్టివేయండి. భారతదేశంలో నియమాలు వేరుగా ఉండవచ్చు, కాబట్టి మీ స్థానిక ఫార్మసీని అడగండి."],
    "dispose-liquid": ["సిరప్‌లు, ఇతర ద్రవాలను పారవేయడం", "నేను ఉపయోగించిన FDA పేజీ ద్రవాల గురించి చెప్పదు, కాబట్టి కరపత్రం చూడండి లేదా ఫార్మసిస్ట్‌ను అడగండి. జాగ్రత్తగా మొదలుపెట్టడానికి: మూత పెట్టి, సీసాను ప్లాస్టిక్ సంచిలో మూసి, పారబోయకుండా ఫార్మసీకి తిరిగి ఇవ్వండి."],
    "children": ["మందులను పిల్లలకు దూరంగా ఉంచడం", "మందులను పిల్లలకు, పెంపుడు జంతువులకు అందకుండా, పిల్లలు తెరవలేని చోట ఉంచండి. మందును ఎప్పుడూ మిఠాయి లేదా జ్యూస్ అని చెప్పకండి, చిన్న పిల్లలకు మందును మీరే ఇవ్వండి."],
    "original": ["అసలు ప్యాక్ ఉంచడం", "మందులను అసలు ప్యాకెట్ లేదా డబ్బాలోనే ఉంచండి, తద్వారా పేరు, బలం, నిల్వ సూచన, గడువు తేదీ ఎప్పుడూ కనిపిస్తాయి."],
    "accuracy": ["స్కాన్ ఎంత కచ్చితం", "MediCycle ఫోటోల నుండి తేదీలు చదువుతుంది, ముఖ్యంగా తక్కువ వెలుతురులో లేదా వంకర సీసాలపై తప్పుగా చదవవచ్చు. అది ఎంత నమ్మకంగా ఉందో చూపిస్తుంది, తేదీని మీరు సరిచేయవచ్చు. తేదీని ఎల్లప్పుడూ ప్యాక్‌తో సరిచూసుకోండి."],
    "privacy": ["గోప్యత", "ఫోటోలు మీ పరికరంలోనే చదవబడతాయి, అప్‌లోడ్ కావు. మీ అల్మారా ఈ పరికరంలో, ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ అవుతుంది."]
  };

  /* ---------------- state ---------------- */
  var state = load();
  function blank() { return { profiles: [{ id: "p1", name: "Me" }], cur: "p1", items: [], lang: "en", demo: false }; }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.items && s.profiles) return s; } catch (e) {}
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  var uid = function () { return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };

  /* ---------------- dates ---------------- */
  function endOfMonth(y, m) { return new Date(y, m, 0, 23, 59, 59); }
  function effExpiry(it) {
    var d = endOfMonth(it.expYear, it.expMonth);
    if (it.openedOn && it.openDays) {
      var o = new Date(it.openedOn + "T23:59:59");
      var lim = new Date(o.getTime() + it.openDays * DAY);
      if (lim < d) return { date: lim, byOpen: true };
    }
    return { date: d, byOpen: false };
  }
  function daysLeft(it) { return Math.ceil((effExpiry(it).date - new Date()) / DAY); }
  function statusOf(it) { var d = daysLeft(it); return d < 0 ? "expired" : d <= SOON_DAYS ? "soon" : "safe"; }
  var fmtMY = function (m, y) { return MONN(m) + " " + y; };
  var fmtD = function (d) { return d.getDate() + " " + MONN(d.getMonth() + 1) + " " + d.getFullYear(); };
  var plural = function (n, w) { return state.lang === "te" ? n + " " + (PTE[w] || w) : n + " " + w + (n === 1 ? "" : "s"); };
  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  function describe(it) {
    var st = statusOf(it), d = daysLeft(it), e = effExpiry(it);
    var txt;
    if (st === "expired") txt = L("Expired " + (e.byOpen ? "(opened too long ago): " : "") + plural(-d, "day") + " ago", "గడువు ముగిసింది " + (e.byOpen ? "(తెరిచి చాలా రోజులైంది): " : ": ") + (-d) + " రోజుల క్రితం");
    else if (st === "soon") txt = L("Use soon: " + plural(d, "day") + " left" + (e.byOpen ? " since opening" : ""), "త్వరగా వాడండి: " + plural(d, "day") + " మిగిలాయి" + (e.byOpen ? " (తెరిచిన తర్వాత)" : ""));
    else if (e.byOpen) txt = L("Opened: use within " + plural(d, "day"), "తెరిచారు: " + plural(d, "day") + " లోపు వాడండి");
    else txt = L("Sealed: " + plural(Math.floor(d / 30.4), "month") + " left", "మూత తెరవలేదు: " + plural(Math.floor(d / 30.4), "month") + " మిగిలాయి");
    return { st: st, days: d, text: txt, eff: e };
  }
  function dots(it) {
    var d = daysLeft(it), st = statusOf(it), out = "";
    var filled = Math.max(0, Math.min(12, Math.ceil(d / 30.44)));
    for (var i = 0; i < 12; i++) {
      var c;
      if (st === "expired") c = i === 0 ? "r" : "e";
      else c = i < filled ? (st === "soon" ? "y" : "k") : "e";
      out += '<i class="' + c + '"></i>';
    }
    return out;
  }
  var tr = function (k, en) { return state.lang === "te" && TE[k] ? TE[k] : en; };

  /* ---------------- views and tabs ---------------- */
  function showHome(anchor) {
    $("app").hidden = true; $("home").hidden = false;
    if (anchor && $(anchor)) $(anchor).scrollIntoView(); else window.scrollTo(0, 0);
  }
  function showApp(tab) { $("home").hidden = true; $("app").hidden = false; showTab(tab || "scan"); }
  function showTab(name) {
    ["scan", "cabinet", "ask", "report"].forEach(function (t) { $("tab-" + t).hidden = t !== name; });
    Array.prototype.forEach.call($("tabbar").children, function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === name); });
    if (name === "cabinet") renderCabinet();
    if (name === "report") renderReport();
    if (name === "ask") renderChips();
    window.scrollTo(0, 0);
  }
  var toastT;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 2200); }

  /* ---------------- scan ---------------- */
  var cur = null;       // { month, year, conf, name, cat }
  var worker = null, workerP = null;

  function abs(p) { return new URL(p, location.href).href; }
  function getWorker(onProg) {
    if (!workerP) {
      workerP = Tesseract.createWorker("eng", 1, {
        workerPath: abs("vendor/worker.min.js"), corePath: abs("vendor/core/"), langPath: abs("vendor/lang/"), gzip: true,
        logger: function (m) { if (m.status === "recognizing text" && getWorker.cb) getWorker.cb(m.progress); }
      }).then(function (w) { worker = w; return w; });
    }
    getWorker.cb = onProg;
    return workerP;
  }

  function toCanvas(img, mode) {
    var w0 = img.naturalWidth, h0 = img.naturalHeight, scale = 1;
    var target = mode === "big" ? 2200 : 1600;
    if (w0 > target) scale = target / w0; else if (w0 < 1200) scale = 1200 / w0;
    if (mode === "big" && w0 * scale < 1800) scale = 1800 / w0;
    var c = document.createElement("canvas");
    c.width = Math.round(w0 * scale); c.height = Math.round(h0 * scale);
    var x = c.getContext("2d", { willReadFrequently: true });
    x.imageSmoothingQuality = "high";
    x.drawImage(img, 0, 0, c.width, c.height);
    if (mode === "plain") return c;
    // grayscale then stretch contrast between the 2nd and 98th percentile
    var id = x.getImageData(0, 0, c.width, c.height), p = id.data, hist = new Array(256).fill(0), n = c.width * c.height, i, g;
    for (i = 0; i < p.length; i += 4) { g = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) | 0; p[i] = g; hist[g]++; }
    var lo = 0, hi = 255, a = 0;
    for (i = 0; i < 256; i++) { a += hist[i]; if (a > n * 0.02) { lo = i; break; } }
    a = 0; for (i = 255; i >= 0; i--) { a += hist[i]; if (a > n * 0.02) { hi = i; break; } }
    var span = Math.max(40, hi - lo);
    for (i = 0; i < p.length; i += 4) {
      g = Math.max(0, Math.min(255, ((p[i] - lo) * 255 / span) | 0));
      p[i] = p[i + 1] = p[i + 2] = g; p[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    return c;
  }

  var norm = function (s) { return (s || "").toUpperCase().replace(/[O]/g, "0").replace(/[LI|]/g, "1").replace(/[^A-Z0-9]/g, ""); };

  // Find the OCR words that make up the date so a red box can be drawn around the real thing.
  function locate(words, raw, W, H) {
    if (!words || !words.length || !raw) return null;
    var key = norm(raw), n, i, j, hit = null;
    for (n = 1; n <= 3 && !hit; n++) {
      for (i = 0; i + n <= words.length && !hit; i++) {
        var cat = "";
        for (j = 0; j < n; j++) cat += norm(words[i + j].text);
        if (cat.indexOf(key) >= 0 && cat.length <= key.length + 4) hit = { from: i, to: i + n - 1 };
      }
    }
    if (!hit) return null;
    var sel = words.slice(hit.from, hit.to + 1);
    // include a directly preceding EXP word on the same line
    var prev = words[hit.from - 1], f = sel[0];
    if (prev && /EXP|USE|BEST/i.test(prev.text) && Math.abs(prev.bbox.y1 - f.bbox.y1) < (f.bbox.y1 - f.bbox.y0)) sel.unshift(prev);
    var x0 = Math.min.apply(null, sel.map(function (w) { return w.bbox.x0; })), y0 = Math.min.apply(null, sel.map(function (w) { return w.bbox.y0; }));
    var x1 = Math.max.apply(null, sel.map(function (w) { return w.bbox.x1; })), y1 = Math.max.apply(null, sel.map(function (w) { return w.bbox.y1; }));
    var conf = sel.reduce(function (s, w) { return s + (w.confidence || 0); }, 0) / sel.length / 100;
    var padx = (x1 - x0) * 0.04 + 6, pady = (y1 - y0) * 0.25 + 4;
    return { l: (x0 - padx) / W * 100, t: (y0 - pady) / H * 100, w: (x1 - x0 + padx * 2) / W * 100, h: (y1 - y0 + pady * 2) / H * 100, conf: conf };
  }

  var scanToken = 0;
  function startScan(src) {
    var token = ++scanToken;
    $("scanStart").hidden = true; $("scanWork").hidden = false;
    $("result").hidden = true; $("progress").hidden = false; $("dateBox").hidden = true; $("beam").hidden = false;
    $("progressText").textContent = L("Reading the pack…", "ప్యాక్ చదువుతోంది…"); $("progressBar").style.width = "4%";
    var img = $("photo");
    img.onload = function () { img.onload = null; recognise(img, token); };
    img.src = src;
  }

  var PASSES = [
    { mode: "plain", psm: "11", label: ["Reading the pack…", "ప్యాక్ చదువుతోంది…"] },
    { mode: "gray", psm: "6", label: ["Looking closer…", "దగ్గరగా చూస్తోంది…"] },
    { mode: "big", psm: "11", label: ["One more careful look…", "మరోసారి జాగ్రత్తగా చూస్తోంది…"] }
  ];

  function recognise(img, token) {
    var best = null, allText = "", pi = 0;
    function done() {
      if (token !== scanToken) return;
      $("beam").hidden = true; $("progress").hidden = true;
      var name = "", cat = "tablet";
      if (allText) { name = ExpiryParse.guessName(allText); cat = ExpiryParse.guessCategory(allText); }
      if (best && best.hit) {
        var wc = best.box ? best.box.conf : 0.85;
        cur = { month: best.hit.month, year: best.hit.year, conf: Math.round(best.hit.confidence * (0.55 + 0.45 * wc) * 100) / 100, name: name, cat: cat };
        if (best.box) { var b = $("dateBox"); b.style.left = best.box.l + "%"; b.style.top = best.box.t + "%"; b.style.width = best.box.w + "%"; b.style.height = best.box.h + "%"; b.hidden = false; }
      } else {
        cur = { month: 0, year: 0, conf: 0, name: name, cat: cat };
      }
      showResult();
    }
    function fail(e) {
      if (token !== scanToken) return;
      if (window.console) console.warn("OCR failed", e);
      $("beam").hidden = true; $("progress").hidden = true;
      cur = { month: 0, year: 0, conf: 0, name: "", cat: "tablet", failed: true };
      showResult();
    }
    function next() {
      if (token !== scanToken) return;
      if (pi >= PASSES.length || (best && best.hit && best.hit.confidence >= 0.9 && best.box && best.box.conf >= 0.7)) return done();
      var P = PASSES[pi]; $("progressText").textContent = L(P.label[0], P.label[1]);
      var canvas = toCanvas(img, P.mode);
      getWorker(function (p) { $("progressBar").style.width = Math.round(((pi + p) / PASSES.length) * 92 + 4) + "%"; })
        .then(function (w) { return w.setParameters({ tessedit_pageseg_mode: P.psm }).then(function () { return w.recognize(canvas, {}, { text: true, blocks: true }); }); })
        .then(function (r) {
          var data = r.data, text = data.text || "";
          allText += "\n" + text;
          var hit = ExpiryParse.parseExpiry(text);
          var words = data.words || [];
          if (!words.length && data.blocks) {
            data.blocks.forEach(function (b) { (b.paragraphs || []).forEach(function (pp) { (pp.lines || []).forEach(function (ln) { (ln.words || []).forEach(function (w) { words.push(w); }); }); }); });
          }
          if (hit) {
            var box = locate(words, hit.raw, canvas.width, canvas.height);
            var score = hit.confidence + (box ? box.conf * 0.1 : 0);
            if (!best || score > best.score) best = { hit: hit, box: box, score: score };
          }
          pi++; next();
        })
        .catch(fail);
    }
    next();
  }

  function fillFixSelectors() {
    var sel = $("fixMonth");
    if (!sel.options.length) MON.forEach(function (m, i) { var o = document.createElement("option"); o.value = i + 1; o.textContent = m; sel.appendChild(o); });
    Array.prototype.forEach.call(sel.options, function (o, i) { o.textContent = MONN(i + 1); });
    sel.value = cur.month || (new Date().getMonth() + 1);
    $("fixYear").value = cur.year || "";
  }

  function showResult() {
    $("result").hidden = false;
    var found = cur.month > 0;
    $("itemName").value = cur.name || "";
    $("itemCat").value = cur.cat;
    $("itemPrice").value = "";
    $("isOpened").checked = false;
    $("fixRow").hidden = found;
    fillFixSelectors();
    var low = $("lowConf");
    if (cur.failed) { low.textContent = L("The reader could not start. Open this app from a web address, not by double-clicking the file, or enter the date from the pack.", "రీడర్ ప్రారంభం కాలేదు. ఈ యాప్‌ను వెబ్ అడ్రస్ నుండి తెరవండి (ఫైల్‌ను డబుల్ క్లిక్ చేయవద్దు), లేదా ప్యాక్‌పై ఉన్న తేదీని నమోదు చేయండి."); low.hidden = false; }
    else if (!found) { low.textContent = L("I could not read a date on this photo, and I will not guess. Enter the date printed on the pack, or take a closer photo.", "ఈ ఫోటోలో తేదీ చదవలేకపోయాను, నేను ఊహించను. ప్యాక్‌పై ముద్రించిన తేదీని నమోదు చేయండి, లేదా దగ్గరగా మరో ఫోటో తీయండి."); low.hidden = false; }
    else if (cur.conf < 0.75) { low.textContent = L("Not very sure about this one. Check the date against your pack and fix it if needed.", "ఇది ఎంత నమ్మకమో తెలియదు. తేదీని మీ ప్యాక్‌తో సరిచూసి, అవసరమైతే సరిచేయండి."); low.hidden = false; }
    else low.hidden = true;
    onCatChange(true);
    refreshResult();
    $("result").scrollIntoView({ block: "nearest" });
  }

  function formItem() {
    var cat = $("itemCat").value, opened = !$("openedBlock").hidden && $("isOpened").checked;
    return {
      name: $("itemName").value.trim() || L("Medicine", "మందు"), category: cat,
      expMonth: cur.month, expYear: cur.year,
      openedOn: opened ? ($("openedOn").value || iso(new Date())) : null,
      openDays: opened ? Math.max(1, parseInt($("openDays").value, 10) || OPEN_DEFAULT[cat] || 28) : 0,
      price: parseFloat($("itemPrice").value) || 0, conf: cur.conf
    };
  }

  function onCatChange(init) {
    var cat = $("itemCat").value, canOpen = cat === "drops" || cat === "liquid";
    $("openedBlock").hidden = !canOpen;
    if (canOpen) {
      $("openHint").textContent = L(OPEN_HINT[cat][0], OPEN_HINT[cat][1]);
      if (!init || !$("openDays").value) $("openDays").value = OPEN_DEFAULT[cat];
      if (!$("openedOn").value) $("openedOn").value = iso(new Date());
    }
    $("openedFields").hidden = !(canOpen && $("isOpened").checked);
    refreshResult();
  }

  function refreshResult() {
    if (!cur) return;
    var ok = cur.month > 0 && cur.year > 0;
    $("saveBtn").disabled = !ok; $("saveBtn").style.opacity = ok ? 1 : .4;
    if (!ok) {
      $("resDate").textContent = L("Not found", "కనబడలేదు"); $("resStatus").textContent = L("Enter the date to continue", "కొనసాగడానికి తేదీని నమోదు చేయండి"); $("resStatusTe").hidden = true;
      $("resCells").innerHTML = ""; $("resAxis").innerHTML = ""; $("confText").textContent = L("No date read", "తేదీ చదవలేదు"); $("confBar").style.width = "0";
      $("openNote").hidden = true; return;
    }
    var it = formItem(), d = describe(it);
    $("resLabel").textContent = L("Printed expiry date", "ముద్రించిన గడువు తేదీ");
    $("resDate").textContent = fmtMY(cur.month, cur.year);
    $("resStatus").textContent = d.text;
    var te = $("resStatusTe");
    te.hidden = true;
    $("resCells").innerHTML = dots(it);
    $("resAxis").innerHTML = L("<span>Now</span><span>12 months</span>", "<span>ఇప్పుడు</span><span>12 నెలలు</span>");
    var pct = Math.round(cur.conf * 100);
    $("confText").textContent = cur.conf ? L("Read " + pct + "% sure", "చదివిన నమ్మకం " + pct + "%") : L("Entered by you", "మీరు నమోదు చేశారు");
    $("confBar").style.width = (cur.conf ? pct : 100) + "%";
    var on = $("openNote");
    if (it.openedOn) {
      on.hidden = false;
      on.textContent = L("Opened " + fmtD(new Date(it.openedOn + "T12:00:00")) + ". Use by " + fmtD(d.eff.date) + (d.eff.byOpen ? ", which is sooner than the printed date." : "."), fmtD(new Date(it.openedOn + "T12:00:00")) + " న తెరిచారు. " + fmtD(d.eff.date) + " లోపు వాడండి" + (d.eff.byOpen ? ", ఇది ముద్రించిన తేదీ కంటే ముందు." : "."));
    } else on.hidden = true;
  }

  function onFix() {
    cur.month = parseInt($("fixMonth").value, 10);
    cur.year = parseInt($("fixYear").value, 10) || 0;
    if (cur.year && (cur.year < 2015 || cur.year > 2045)) cur.year = 0;
    cur.conf = 0;
    $("lowConf").hidden = true;
    refreshResult();
  }

  function saveItem() {
    if (!(cur && cur.month && cur.year)) return;
    var it = formItem(); it.id = uid(); it.profile = state.cur; it.disposedAt = null;
    state.items.push(it); save(); renderAlert();
    toast(L("Saved to cabinet", "అల్మారాలో సేవ్ అయింది"));
    resetScan();
    showTab("cabinet");
  }
  function resetScan() {
    scanToken++; cur = null;
    $("scanWork").hidden = true; $("scanStart").hidden = false; $("dateBox").hidden = true; $("file").value = "";
  }

  /* ---------------- read aloud ---------------- */
  function speak() {
    if (!cur || !cur.month) return;
    if (!("speechSynthesis" in window)) { toast(L("Read aloud is not supported in this browser", "ఈ బ్రౌజర్‌లో చదివి వినిపించడం పనిచేయదు")); return; }
    var it = formItem(), d = describe(it);
    var msg = it.name + ". Expires " + MON[cur.month - 1] + " " + cur.year + ". " + d.text + ".";
    var u = new SpeechSynthesisUtterance(msg); u.lang = "en-IN"; u.rate = 0.92;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }

  /* ---------------- cabinet ---------------- */
  var filter = "all", openId = null;
  function mine() { return state.items.filter(function (i) { return i.profile === state.cur && !i.disposedAt; }); }
  function renderProfiles() {
    var s = $("profileSel"); s.innerHTML = "";
    state.profiles.forEach(function (p) { var o = document.createElement("option"); o.value = p.id; o.textContent = p.name; s.appendChild(o); });
    s.value = state.cur;
  }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  function renderCabinet() {
    renderProfiles();
    var items = mine(), n = items.length;
    var ex = items.filter(function (i) { return statusOf(i) === "expired"; }).length;
    var so = items.filter(function (i) { return statusOf(i) === "soon"; }).length;
    $("cabSummary").textContent = n ? plural(n, "medicine") + " · " + ex + L(" expired", " గడువు ముగిసినవి") + " · " + so + L(" use soon", " త్వరగా వాడాలి") : L("No medicines yet", "మందులు లేవు");
    $("score").hidden = !n;
    if (n) $("scoreNum").textContent = Math.round(100 * (n - ex - so) / n);
    $("cabEmpty").hidden = n > 0;
    $("demoTag").hidden = !state.demo;
    var list = items.filter(function (i) { return filter === "all" || statusOf(i) === filter; });
    var order = { expired: 0, soon: 1, safe: 2 };
    list.sort(function (a, b) { return order[statusOf(a)] - order[statusOf(b)] || daysLeft(a) - daysLeft(b); });
    var html = "";
    list.forEach(function (it) {
      var d = describe(it), open = openId === it.id;
      var tag = d.st === "expired" ? '<span class="tg r">' + esc(tr("expired", "Expired")) + "</span>"
        : d.st === "soon" ? '<span class="tg y">' + esc(tr("soon", "Use soon")) + " · " + plural(d.days, "day") + "</span>"
        : '<span class="tg">' + esc(tr("safe", "Safe")) + "</span>";
      html += '<div class="item" data-id="' + it.id + '"><div class="nm"><span>' + esc(it.name) + "</span>" + tag + '</div><div class="cells">' + dots(it) + "</div>";
      if (open) {
        html += '<p class="sm" style="margin-top:8px">' + L("Printed date ", "ముద్రించిన తేదీ ") + fmtMY(it.expMonth, it.expYear) + ". " + esc(d.text) + ".</p>";
        if (it.openedOn) html += '<p class="sm">' + L("Opened " + fmtD(new Date(it.openedOn + "T12:00:00")) + ", use within " + it.openDays + " days.", fmtD(new Date(it.openedOn + "T12:00:00")) + " న తెరిచారు, " + it.openDays + " రోజుల్లో వాడండి.") + "</p>";
        html += '<div class="more"><button data-act="ics" type="button">' + L("Add reminder", "రిమైండర్ జోడించండి") + '</button>' +
          (d.st === "expired" ? '<button data-act="dispose" type="button">' + L("I returned or threw it away", "తిరిగి ఇచ్చాను లేదా పారవేశాను") + '</button>' : "") +
          '<button class="danger" data-act="del" type="button">' + L("Remove", "తొలగించండి") + '</button></div>';
      }
      html += "</div>";
    });
    if (n && !list.length) html = '<p class="sm pad" style="padding-top:10px">' + L("Nothing in this view.", "ఈ వీక్షణలో ఏమీ లేదు.") + "</p>";
    $("cabList").innerHTML = html;
    Array.prototype.forEach.call($("filters").children, function (b) { b.classList.toggle("on", b.getAttribute("data-f") === filter); });
  }

  var icsDay = function (x) { return x.getFullYear() + ("0" + (x.getMonth() + 1)).slice(-2) + ("0" + x.getDate()).slice(-2); };
  function eventLines(it) {
    var d = describe(it), when = new Date(d.eff.date.getTime() - 14 * DAY);
    if (when < new Date()) when = new Date();
    var end = new Date(when.getTime() + DAY), nm = it.name.replace(/[,;\n]/g, " ");
    return ["BEGIN:VEVENT", "UID:" + it.id + "@medicycle", "DTSTAMP:" + icsDay(new Date()) + "T000000Z",
      "DTSTART;VALUE=DATE:" + icsDay(when), "DTEND;VALUE=DATE:" + icsDay(end),
      "SUMMARY:Use or return " + nm + " (expires " + d.eff.date.toDateString() + ")",
      "DESCRIPTION:Check the pack and use or return this medicine before " + d.eff.date.toDateString() + ".",
      "BEGIN:VALARM", "TRIGGER:PT9H", "ACTION:DISPLAY", "DESCRIPTION:Medicine expiring: " + nm, "END:VALARM", "END:VEVENT"];
  }
  function downloadIcs(events, file) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MediCycle//EN"].concat(events, ["END:VCALENDAR"]);
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast(L("Reminder file downloaded. Open it to add to your calendar.", "రిమైండర్ ఫైల్ డౌన్‌లోడ్ అయింది. క్యాలెండర్‌లో చేర్చడానికి తెరవండి."));
  }
  function icsFor(it) { downloadIcs(eventLines(it), it.name.replace(/\W+/g, "-").toLowerCase() + "-reminder.ics"); }
  function icsAll() {
    var ev = [];
    state.items.filter(function (i) { return !i.disposedAt && statusOf(i) !== "expired"; }).forEach(function (i) { ev = ev.concat(eventLines(i)); });
    if (!ev.length) return toast(L("Nothing to remind about yet", "గుర్తు చేయడానికి ఏమీ లేదు"));
    downloadIcs(ev, "medicycle-reminders.ics");
  }

  /* ---------------- alerts ---------------- */
  function alertStats() {
    var live = state.items.filter(function (i) { return !i.disposedAt; }), ex = 0, so = 0, risk = 0;
    live.forEach(function (i) { var st = statusOf(i); if (st === "expired") ex++; else if (st === "soon") { so++; risk += i.price || 0; } });
    return { ex: ex, so: so, risk: risk };
  }
  function alertText(a) {
    var parts = [];
    if (a.ex) parts.push(L(plural(a.ex, "medicine") + " expired", plural(a.ex, "medicine") + " గడువు ముగిసింది"));
    if (a.so) parts.push(L(a.so + " expire soon", a.so + " త్వరలో గడువు ముగుస్తుంది"));
    var t = parts.join(L(" and ", " మరియు ")) + ". ";
    if (a.so) t += a.risk ? L("Use those first to avoid wasting ₹" + Math.round(a.risk) + ".", "₹" + Math.round(a.risk) + " వృథా కాకుండా వాటిని ముందు వాడండి.") : L("Use those first so nothing is wasted.", "ఏదీ వృథా కాకుండా వాటిని ముందు వాడండి.");
    else t += L("Return them to a pharmacy.", "వాటిని ఫార్మసీకి ఇవ్వండి.");
    return t;
  }
  function renderAlert() {
    var bar = $("alertBar"), a = alertStats();
    if (!a.ex && !a.so) { bar.hidden = true; return; }
    var canNotify = "Notification" in window, on = canNotify && Notification.permission === "granted" && state.alerts;
    bar.hidden = false;
    bar.innerHTML = '<p><b>' + esc(L("Alert", "హెచ్చరిక")) + ".</b> " + esc(alertText(a)) + '</p><div class="al-btns"><button class="ul" data-al="view" type="button">' + L("Review", "చూడండి") + '</button><button class="ul" data-al="ics" type="button">' + L("Add reminders to calendar", "క్యాలెండర్‌లో రిమైండర్లు చేర్చండి") + "</button>" +
      (canNotify ? '<button class="ul" data-al="notify" type="button">' + (on ? L("Alerts are on", "హెచ్చరికలు ఆన్‌లో ఉన్నాయి") : L("Turn on alerts", "హెచ్చరికలు ఆన్ చేయండి")) + "</button>" : "") + "</div>";
  }
  function notifyNow(force) {
    var a = alertStats();
    if (!(a.ex || a.so) || !("Notification" in window) || Notification.permission !== "granted" || !state.alerts) return;
    var today = iso(new Date());
    if (!force && state.lastNotify === today) return;
    state.lastNotify = today; save();
    try { new Notification("MediCycle", { body: alertText(a) }); } catch (e) {}
  }
  function enableAlerts() {
    if (!("Notification" in window)) return toast(L("This browser does not support alerts", "ఈ బ్రౌజర్ హెచ్చరికలకు మద్దతు ఇవ్వదు"));
    if (Notification.permission === "denied") return toast(L("Alerts are blocked. Allow them in your browser's site settings.", "హెచ్చరికలు బ్లాక్ అయ్యాయి. బ్రౌజర్ సైట్ సెట్టింగ్స్‌లో అనుమతించండి."));
    var done = function (p) {
      if (p === "granted") { state.alerts = true; save(); toast(L("Alerts are on. You will be told when you open the app.", "హెచ్చరికలు ఆన్ అయ్యాయి. మీరు యాప్ తెరిచినప్పుడు చెబుతుంది.")); notifyNow(true); }
      renderAlert();
    };
    var r = Notification.requestPermission(done); if (r && r.then) r.then(done);
  }

  /* ---------------- report ---------------- */
  function renderReport() {
    var now = new Date(), yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    var exp = state.items.filter(function (i) { var e = effExpiry(i).date; return e < now && e > yearAgo; });
    var total = exp.reduce(function (s, i) { return s + (i.price || 0); }, 0);
    $("rsTotal").textContent = "₹" + Math.round(total).toLocaleString("en-IN");
    $("rsCount").textContent = L(plural(exp.length, "item") + " expired before use", plural(exp.length, "item") + " ఉపయోగించక ముందే గడువు ముగిసింది");
    var months = [], sums = [], i;
    for (i = 6; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push(d); sums.push(0); }
    exp.forEach(function (it) {
      var e = effExpiry(it).date;
      months.forEach(function (m, k) { if (m.getFullYear() === e.getFullYear() && m.getMonth() === e.getMonth()) sums[k] += it.price || 0; });
    });
    var mx = Math.max.apply(null, sums.concat([1])), hiIdx = sums.indexOf(Math.max.apply(null, sums));
    $("bars").innerHTML = sums.map(function (v, k) { return '<div class="' + (k === hiIdx && v > 0 ? "hi" : "") + '" style="height:' + Math.max(3, Math.round(v / mx * 100)) + '%" title="₹' + v + '"></div>'; }).join("");
    $("mon").innerHTML = months.map(function (m) { return "<span>" + (state.lang === "te" ? MONTE_S[m.getMonth()] : MON[m.getMonth()]) + "</span>"; }).join("");
    var pending = state.items.filter(function (i) { return !i.disposedAt && statusOf(i) === "expired"; });
    var liquid = pending.some(function (i) { return i.category === "liquid" || i.category === "drops"; });
    $("dispNote").textContent = pending.length
      ? L(plural(pending.length, "expired medicine") + " still in your cabinet. Take " + (pending.length === 1 ? "it" : "them") + " to a pharmacy or a take-back point. Don't flush medicines or put them in household waste unless the instructions say so.", pending.length + " గడువు ముగిసిన మందులు ఇంకా మీ అల్మారాలో ఉన్నాయి. వాటిని ఫార్మసీ లేదా టేక్-బ్యాక్ కేంద్రానికి ఇవ్వండి. సూచనలు చెబితే తప్ప మందులను టాయిలెట్‌లో వేయకండి, ఇంటి చెత్తలో వేయకండి.")
      : L("Nothing expired is waiting in your cabinet. When a medicine expires, return it to a pharmacy.", "గడువు ముగిసినవి ఏవీ అల్మారాలో లేవు. ఏదైనా గడువు ముగిస్తే, ఫార్మసీకి ఇవ్వండి.");
    var fl = $("dispFlag");
    if (liquid) { fl.hidden = false; fl.textContent = L("Syrups and drops: keep the cap on, seal the bottle in a bag and ask your pharmacist how to return it.", "సిరప్‌లు, చుక్కల మందులు: మూత పెట్టి, సీసాను సంచిలో మూసి, ఎలా తిరిగి ఇవ్వాలో మీ ఫార్మసిస్ట్‌ను అడగండి."); } else fl.hidden = true;
  }

  /* ---------------- print ---------------- */
  function printReport() {
    var items = mine(), prof = state.profiles.filter(function (p) { return p.id === state.cur; })[0];
    var rows = items.map(function (it) {
      var d = describe(it);
      return "<tr><td>" + esc(it.name) + "</td><td>" + esc(L(it.category, CATTE[it.category])) + "</td><td>" + fmtMY(it.expMonth, it.expYear) + "</td><td>" + fmtD(d.eff.date) + "</td><td>" + esc(L(d.st, TE[d.st])) + "</td></tr>";
    }).join("");
    $("printSheet").innerHTML = "<h1>" + L("Medicine cabinet report", "మందుల అల్మారా నివేదిక") + "</h1><p>" + esc(prof ? prof.name : "") + " · " + L("printed ", "ప్రింట్ తేదీ ") + fmtD(new Date()) + "</p><table><tr><th>" + L("Medicine", "మందు") + "</th><th>" + L("Type", "రకం") + "</th><th>" + L("Printed expiry", "ముద్రించిన గడువు") + "</th><th>" + L("Use by", "ఈ తేదీ లోపు వాడండి") + "</th><th>" + L("Status", "స్థితి") + "</th></tr>" + rows + "</table><p>" + L("Dates were read by MediCycle from photos and may contain errors. Please check each pack. This report does not replace advice from a pharmacist or doctor.", "తేదీలను MediCycle ఫోటోల నుండి చదివింది, తప్పులు ఉండవచ్చు. దయచేసి ప్రతి ప్యాక్‌ను సరిచూడండి. ఈ నివేదిక ఫార్మసిస్ట్ లేదా డాక్టర్ సలహాకు ప్రత్యామ్నాయం కాదు.") + "</p>";
    window.print();
  }

  /* ---------------- ask ---------------- */
  var QS = [["Can I use medicine after the expiry date?", "గడువు తేదీ తర్వాత మందు వాడవచ్చా?"], ["How long do eye drops last once opened?", "తెరిచిన తర్వాత కంటి చుక్కలు ఎంతకాలం ఉంటాయి?"], ["How should I dispose of old medicines?", "పాత మందులను ఎలా పారవేయాలి?"], ["Where should I keep my medicines?", "మందులను ఎక్కడ ఉంచాలి?"], ["How many tablets should I take?", "ఎన్ని మాత్రలు వేసుకోవాలి?"]];
  var DOSE = /\b(dose|doses|dosage|dosing|overdose|double|triple|mg per|times a day|twice|once daily|interact\w*|pregnan\w*|breastfeed\w*|diagnos\w*|symptom\w*|side effects?|allerg\w*|prescribe\w*|stop taking|can i take|should i take|take it|how many tablets)\b/i;
  var GENERIC = ["tablet", "tablets", "syrup", "drops", "cream", "gel", "oral", "suspension", "spray", "ointment", "nasal", "lozenges", "eye"];
  function rowOf(it) { var d = describe(it); return { name: it.name, detail: fmtMY(it.expMonth, it.expYear) + ". " + d.text, st: d.st }; }
  function wasteTotal() {
    var now = new Date(), ago = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), t = 0, n = 0;
    state.items.forEach(function (i) { var e = effExpiry(i).date; if (e < now && e > ago) { n++; t += i.price || 0; } });
    return { n: n, total: t };
  }
  function cabinetAnswer(q) {
    var ql = q.toLowerCase(), items = mine().slice().sort(function (a, b) { return daysLeft(a) - daysLeft(b); });
    var mineWord = /\b(my|mine|i have|do i have|in my cabinet|i've)\b/.test(ql);
    var named = items.filter(function (it) { return it.name.toLowerCase().split(/[^a-z0-9]+/).some(function (w) { return w.length >= 4 && GENERIC.indexOf(w) < 0 && ql.indexOf(w) >= 0; }); })[0];
    var isWaste = /\b(wast\w*|lost|money|rupees?|cost)\b/.test(ql) && (mineWord || /how much/.test(ql));
    var isFirst = /\b(first|priority|finish|use up|before they expire)\b/.test(ql) && /\b(use|take|finish)\b/.test(ql);
    var isStatus = /\b(expire|expires|expiring|expired|expiry|soon|out of date)\b/.test(ql) && mineWord;
    var isCount = /\bhow many (medicines|items|packs)\b/.test(ql) || /\b(what|which) (medicines|medicine) do i have\b/.test(ql) || /\bin my cabinet\b/.test(ql);
    var empty = L("Your cabinet is empty. Scan a pack and save it, or load demo data in the Cabinet tab.", "మీ అల్మారా ఖాళీగా ఉంది. ప్యాక్ స్కాన్ చేసి సేవ్ చేయండి, లేదా అల్మారా ట్యాబ్‌లో డెమో డేటా లోడ్ చేయండి.");
    if (named && /\b(expire\w*|expiry|date|when|safe|still|good|valid|usable|use|left|opened|ok|okay)\b/.test(ql)) {
      var d = describe(named), advice = d.st === "expired"
        ? L("Don't use it. Take it to a pharmacy.", "వాడకండి. ఫార్మసీకి తీసుకెళ్లండి.")
        : d.st === "soon" ? L("It is still within its date, but use it soon, or return it if you no longer need it.", "ఇంకా గడువు లోపలే ఉంది, కానీ త్వరగా వాడండి, అవసరం లేకపోతే తిరిగి ఇవ్వండి.")
        : L("It is within its date. Always check the pack, and don't use it if it looks or smells different.", "గడువు లోపలే ఉంది. ఎల్లప్పుడూ ప్యాక్ చూడండి, భిన్నంగా కనిపిస్తే లేదా వాసన వస్తే వాడకండి.");
      var op = named.openedOn ? " " + L("Opened " + fmtD(new Date(named.openedOn + "T12:00:00")) + ", use within " + named.openDays + " days.", fmtD(new Date(named.openedOn + "T12:00:00")) + " న తెరిచారు, " + named.openDays + " రోజుల్లో వాడండి.") : "";
      return { title: named.name, text: L("Printed expiry ", "ముద్రించిన గడువు ") + fmtMY(named.expMonth, named.expYear) + ". " + d.text + "." + op + " " + advice, rows: [] };
    }
    if (isWaste) {
      var w = wasteTotal();
      return { title: L("Wasted so far", "ఇప్పటివరకు వృథా"), text: w.n ? L(plural(w.n, "item") + " expired before use in the last year, about ₹" + Math.round(w.total) + " by the prices you entered. See the Report tab.", "గత ఏడాదిలో " + plural(w.n, "item") + " ఉపయోగించక ముందే గడువు ముగిసింది, మీరు ఇచ్చిన ధరల ప్రకారం సుమారు ₹" + Math.round(w.total) + ". నివేదిక ట్యాబ్ చూడండి.") : L("Nothing has expired before use yet.", "ఇంకా ఏదీ ఉపయోగించక ముందే గడువు ముగియలేదు."), rows: [] };
    }
    if (isFirst || isStatus || isCount) {
      if (!items.length) return { title: L("Your cabinet", "మీ అల్మారా"), text: empty, rows: [] };
      if (isFirst) {
        var live = items.filter(function (i) { return statusOf(i) !== "expired"; }).slice(0, 3);
        return { title: L("Use these first", "ముందు వీటిని వాడండి"), text: live.length ? L("Sorted by which runs out first:", "ఏది ముందు గడువు ముగుస్తుందో ఆ క్రమంలో:") : L("Nothing is left that is within its date.", "గడువు లోపల ఏదీ మిగల్లేదు."), rows: live.map(rowOf) };
      }
      if (isStatus) {
        var flag = items.filter(function (i) { return statusOf(i) !== "safe"; });
        return { title: L("Expired or expiring soon", "గడువు ముగిసినవి లేదా త్వరలో ముగిసేవి"), text: flag.length ? "" : L("Nothing is expired or expiring in the next 60 days.", "రాబోయే 60 రోజుల్లో ఏదీ గడువు ముగిసేది లేదు."), rows: flag.map(rowOf) };
      }
      var ex = items.filter(function (i) { return statusOf(i) === "expired"; }).length, so = items.filter(function (i) { return statusOf(i) === "soon"; }).length;
      return { title: L("Your cabinet", "మీ అల్మారా"), text: L(plural(items.length, "medicine") + ": " + ex + " expired, " + so + " use soon, " + (items.length - ex - so) + " safe.", plural(items.length, "medicine") + ": " + ex + " గడువు ముగిసినవి, " + so + " త్వరగా వాడాలి, " + (items.length - ex - so) + " సురక్షితం."), rows: items.map(rowOf) };
    }
    return null;
  }
  function renderChips() {
    var c = $("chips"); c.innerHTML = "";
    var list = [], first = mine().slice().sort(function (a, b) { return daysLeft(a) - daysLeft(b); })[0];
    if (first) {
      list.push(["Which of my medicines expire soon?", "నా మందుల్లో ఏవి త్వరలో గడువు ముగుస్తాయి?"]);
      list.push(["What should I use first?", "ముందు ఏది వాడాలి?"]);
      list.push(["How much have I wasted?", "నేను ఎంత వృథా చేశాను?"]);
      list.push(["Is " + first.name + " still safe to use?", first.name + " ఇంకా వాడడానికి సురక్షితమేనా?"]);
    }
    list.push(QS[1], QS[2], QS[4]);
    list.forEach(function (q) { var b = document.createElement("button"); b.type = "button"; b.textContent = L(q[0], q[1]); b.onclick = function () { askQ(q[0], L(q[0], q[1])); }; c.appendChild(b); });
  }
  function askQ(q, shown) {
    q = q.trim(); if (!q) return;
    var te = state.lang === "te";
    var chat = $("chat"), qd = document.createElement("div"); qd.className = "q"; qd.textContent = shown || q; chat.appendChild(qd);
    var ca = DOSE.test(q) ? null : cabinetAnswer(q);
    if (ca) {
      var cd = document.createElement("div"); cd.className = "a cab";
      cd.innerHTML = '<div class="p"><h3>' + esc(ca.title) + "</h3>" + (ca.text ? esc(ca.text) : "") +
        (ca.rows.length ? "<ul>" + ca.rows.map(function (r) { return '<li class="' + r.st + '"><b>' + esc(r.name) + "</b><span>" + esc(r.detail) + "</span></li>"; }).join("") + "</ul>" : "") +
        '<br><span class="tiny">' + L("From your cabinet", "మీ అల్మారా నుండి") + "</span></div>";
      chat.appendChild(cd); cd.scrollIntoView({ block: "nearest", behavior: "smooth" }); $("askInput").value = ""; return;
    }
    var r = ExpiryKB.ask(q), ad = document.createElement("div");
    if (te && r.kind === "none" && !/[a-z]/i.test(q)) r = { kind: "none", text: "ప్రశ్నలు ఇంగ్లీష్‌లో అడగండి, లేదా పైన ఉన్న ప్రశ్నలలో ఒకటి ఎంచుకోండి. నా గైడ్‌లో లేనిది మీ ఫార్మసిస్ట్‌ను అడగండి." };
    else if (te && r.kind === "refuse") r = { kind: "refuse", text: "నేను మోతాదు లేదా వైద్య సలహా ఇవ్వలేను. దయచేసి మీ ఫార్మసిస్ట్ లేదా డాక్టర్‌ను అడగండి." };
    else if (te && r.kind === "none") r = { kind: "none", text: "ఇది నా గైడ్‌లో లేదు. దయచేసి మీ ఫార్మసిస్ట్‌ను అడగండి." };
    ad.className = "a " + (r.kind === "answer" ? "" : r.kind);
    if (r.kind !== "answer") ad.textContent = r.text;
    else ad.innerHTML = r.hits.map(function (p) {
      var lab = L("Source: ", "మూలం: ");
      var src = p.source.url ? '<a class="src" target="_blank" rel="noopener" href="' + p.source.url + '">' + lab + esc(p.source.label) + "</a>" : '<span class="tiny">' + lab + esc(p.source.label) + "</span>";
      var title = te && KB_TE[p.id] ? KB_TE[p.id][0] : p.title, text = te && KB_TE[p.id] ? KB_TE[p.id][1] : p.text;
      return '<div class="p"><h3>' + esc(title) + "</h3>" + esc(text) + "<br>" + src + "</div>";
    }).join("");
    chat.appendChild(ad);
    ad.scrollIntoView({ block: "nearest", behavior: "smooth" });
    $("askInput").value = "";
  }

  /* ---------------- demo data ---------------- */
  function loadDemo() {
    var now = new Date();
    var mo = function (n) { var d = new Date(now.getFullYear(), now.getMonth() + n, 1); return { m: d.getMonth() + 1, y: d.getFullYear() }; };
    var ago = function (n) { return iso(new Date(now.getTime() - n * DAY)); };
    state = blank(); state.demo = true; state.lang = load().lang || "en";
    state.profiles.push({ id: "p2", name: "Amma" });
    var add = function (p, name, cat, off, price, opened, days, disp) {
      var e = mo(off);
      state.items.push({ id: uid(), profile: p, name: name, category: cat, expMonth: e.m, expYear: e.y, openedOn: opened == null ? null : ago(opened), openDays: opened == null ? 0 : days, price: price, disposedAt: disp ? now.getTime() : null, conf: 0.9 });
    };
    add("p1", "Calcium 500 mg", "tablet", 9, 180);
    add("p1", "Paracetamol 500 mg", "tablet", 14, 30);
    add("p1", "Vitamin D3 tablets", "tablet", 20, 240);
    add("p1", "Dextromethorphan syrup", "liquid", 8, 95, 20, 28);
    add("p1", "Carboxymethylcellulose drops", "drops", 10, 140, 40, 28);
    add("p1", "Aluminium hydroxide gel", "liquid", -2, 110);
    add("p1", "Clotrimazole cream", "cream", 1, 220);
    add("p1", "Cetirizine 10 mg", "tablet", -3, 70, null, 0, true);
    add("p1", "Xylometazoline nasal spray", "liquid", -5, 160, null, 0, true);
    add("p1", "Povidone-iodine ointment", "cream", -6, 90, null, 0, true);
    add("p1", "Multivitamin tablets", "tablet", -4, 310, null, 0, true);
    add("p2", "Ferrous sulfate tablets", "tablet", 6, 150);
    add("p2", "Amoxicillin suspension", "liquid", -1, 160);
    save(); filter = "all"; openId = null; renderAlert(); renderCabinet(); toast(L("Demo data loaded", "డెమో డేటా లోడ్ అయింది"));
  }

  /* ---------------- language ---------------- */
  function applyLang() {
    document.documentElement.lang = state.lang;
    translateDom();
    $("langBtn").textContent = state.lang === "te" ? "తెలుగు | EN" : "EN | తెలుగు";
    setHero();
    renderAlert();
    renderChips();
    if (cur) { fillFixSelectors(); onCatChange(true); }
    if (!$("tab-cabinet").hidden) renderCabinet();
    if (!$("tab-report").hidden) renderReport();
  }

  /* ---------------- wiring ---------------- */
  function loadSample(f) {
    showApp("scan"); startScan("samples/" + f);
  }
  var heroLeft = 9;
  function setHero() {
    var c = $("heroCall"); if (!c) return;
    c.innerHTML = "<b>" + L("Expires Aug 2027", "గడువు ఆగస్టు 2027") + '</b><span><i id="heroMonths">' + heroLeft + "</i> " + L("months left. Read with 91% confidence.", "నెలలు మిగిలాయి. 91% నమ్మకంతో చదివింది.") + "</span>";
  }
  function init() {
    // thumbnails
    var th = $("thumbs");
    SAMPLES.forEach(function (s) {
      var b = document.createElement("button"); b.type = "button"; b.className = "thumb";
      b.innerHTML = '<img alt="" src="samples/' + s.f + '"><span>' + s.n + "</span>";
      b.onclick = function () { startScan("samples/" + s.f); };
      th.appendChild(b);
    });
    $("logoLink").onclick = function (e) { e.preventDefault(); showHome(); };
    $("navSample").onclick = function (e) { e.preventDefault(); showApp("scan"); };
    document.querySelectorAll("[data-nav]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); showHome(a.getAttribute("data-nav")); }; });
    $("ctaScan").onclick = function () { showApp("scan"); };
    $("ctaSample").onclick = function () { loadSample("strip-clear.jpg"); };
    $("langBtn").onclick = function () { state.lang = state.lang === "te" ? "en" : "te"; save(); applyLang(); };
    Array.prototype.forEach.call($("tabbar").children, function (b) { b.onclick = function () { showTab(b.getAttribute("data-tab")); }; });
    $("file").onchange = function () {
      var f = this.files && this.files[0]; if (!f) return;
      startScan(URL.createObjectURL(f));
    };
    $("itemCat").onchange = function () { onCatChange(false); };
    $("isOpened").onchange = function () { onCatChange(true); };
    ["itemName", "openedOn", "openDays", "itemPrice"].forEach(function (id) { $(id).oninput = refreshResult; });
    $("fixMonth").onchange = onFix; $("fixYear").oninput = onFix;
    $("fixBtn").onclick = function () { $("fixRow").hidden = !$("fixRow").hidden; if (!$("fixRow").hidden) fillFixSelectors(); };
    $("saveBtn").onclick = saveItem;
    $("againBtn").onclick = resetScan;
    $("speakBtn").onclick = speak;

    $("filters").onclick = function (e) { var f = e.target.getAttribute && e.target.getAttribute("data-f"); if (f) { filter = f; renderCabinet(); } };
    $("cabList").onclick = function (e) {
      var row = e.target.closest(".item"); if (!row) return;
      var id = row.getAttribute("data-id"), act = e.target.getAttribute("data-act");
      var it = state.items.filter(function (x) { return x.id === id; })[0];
      if (act === "ics") return icsFor(it);
      if (act === "dispose") { it.disposedAt = Date.now(); save(); renderAlert(); toast(L("Marked as returned", "తిరిగి ఇచ్చినట్లు గుర్తించబడింది")); return renderCabinet(); }
      if (act === "del") { state.items = state.items.filter(function (x) { return x.id !== id; }); save(); renderAlert(); toast(L("Removed", "తొలగించబడింది")); return renderCabinet(); }
      openId = openId === id ? null : id; renderCabinet();
    };
    $("profileSel").onchange = function () { state.cur = this.value; save(); openId = null; renderCabinet(); };
    $("addProfile").onclick = function () {
      var btn = this, inp = document.createElement("input");
      inp.type = "text"; inp.maxLength = 20; inp.placeholder = L("Name", "పేరు"); inp.setAttribute("aria-label", "Name of the person");
      inp.style.cssText = "width:110px;padding:8px;border:2px solid #0E0E0E;font-size:15px";
      btn.replaceWith(inp); inp.focus();
      var finish = function () {
        var nm = inp.value.trim();
        if (nm) { var id = "p" + Date.now(); state.profiles.push({ id: id, name: nm }); state.cur = id; save(); }
        inp.replaceWith(btn); renderCabinet();
      };
      inp.onkeydown = function (e) { if (e.key === "Enter") finish(); };
      inp.onblur = finish;
    };
    $("loadDemo").onclick = loadDemo;
    $("printBtn").onclick = printReport;
    $("clearBtn").onclick = function () {
      if (!state.items.length && !state.demo) return toast(L("Nothing to clear", "తొలగించడానికి ఏమీ లేదు"));
      if (!window.confirm(L("Remove all medicines and people saved in this browser?", "ఈ బ్రౌజర్‌లో సేవ్ చేసిన అన్ని మందులు, వ్యక్తులను తొలగించాలా?"))) return;
      var lang = state.lang; state = blank(); state.lang = lang; save(); renderAlert(); renderCabinet(); toast(L("All data cleared", "మొత్తం డేటా తొలగించబడింది"));
    };
    $("askForm").onsubmit = function (e) { e.preventDefault(); askQ($("askInput").value); };

    // hero: count the months up once the callout appears; tilt with the pointer
    var left = Math.max(0, Math.floor((endOfMonth(2027, 8) - new Date()) / DAY / 30.4)), still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroLeft = left; setHero();
    if (!still) { var hm = $("heroMonths"); hm.textContent = "0"; setTimeout(function () { var n = 0, t = setInterval(function () { n++; var e = $("heroMonths"); if (e) e.textContent = n; if (n >= left) clearInterval(t); }, 70); }, 4300); }
    var art = $("heroArt");
    if (art && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelector(".hero").addEventListener("mousemove", function (e) {
        var r = this.getBoundingClientRect();
        art.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * -5 + "deg");
        art.style.setProperty("--rx", ((e.clientY - r.top) / r.height - 0.5) * 4 + "deg");
      });
    }
    $("alertBar").onclick = function (e) {
      var k = e.target.getAttribute && e.target.getAttribute("data-al");
      if (k === "view") { filter = "all"; showApp("cabinet"); }
      else if (k === "ics") icsAll();
      else if (k === "notify") enableAlerts();
    };
    applyLang();
    notifyNow(false);
    // test hook for the walkthrough recording (does nothing for visitors)
    window.__expiry = { loadDemo: loadDemo, showTab: showTab };
  }
  init();
})();
