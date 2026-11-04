/* MediCycle: small sourced guide for the Ask tab.
   Retrieval runs in the browser (BM25-style keyword scoring). There is no language model,
   so answers are fixed, reviewed passages and cannot be invented.
   Passages are paraphrased from the pages named in `source`. Review them with a
   pharmacist before relying on them. Rules in India may differ from the US/UK pages. */
(function (global) {
  var FDA_EXP = { label: "FDA: Don't be tempted to use expired medicines", url: "https://www.fda.gov/drugs/safe-disposal-medicines/dont-be-tempted-use-expired-medicines" };
  var FDA_DISP = { label: "FDA: Disposal of unused medicines", url: "https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know" };
  var NHS_STORE = { label: "NHS (ULH): Storing medicines at home", url: "https://www.ulh.nhs.uk/patients/patient-information-library/storing-medicines-at-home/" };
  var AHS_EYE = { label: "Alberta Health Services: eye drop storage dating", url: "https://www.albertahealthservices.ca/assets/info/hp/ltc/if-hp-ltc-e-12-storage-dating-full-tool.pdf" };
  var APP = { label: "MediCycle convention", url: "" };

  var PASSAGES = [
    { id: "expired-use", title: "Using expired medicine",
      kw: "expired expiry expiration after date past out of date use take safe taking tablet tablets pill medicine month passed still",
      text: "Don't use medicine that has passed its expiry date. Its strength or make-up can change, so it may work less well or carry more risk, and some products can grow bacteria. A weakened antibiotic may not clear an infection. Take expired medicine to a pharmacy instead.",
      source: FDA_EXP },
    { id: "date-format", title: "What a printed date means",
      kw: "exp mean means printed date month year format 08/2027 last day end of month read label what does",
      text: "When a pack shows only a month and year, such as EXP 08/2027, MediCycle treats the medicine as usable until the end of that month. If the pack says something different, follow the pack.",
      source: APP },
    { id: "eye-drops", title: "Eye drops after opening",
      kw: "eye drops drop opened opening open discard throw how long weeks months two month 28 days use bottle",
      text: "Many eye drops should be thrown away about 28 days after opening, unless the maker gives a different period. Some products allow longer, from several weeks to a few months, so check the leaflet or ask your pharmacist.",
      source: AHS_EYE },
    { id: "liquids-open", title: "Liquid medicines after opening",
      kw: "syrup liquid suspension opened opening open how long days weeks bottle cough",
      text: "Liquid medicines often have a shorter life once opened, and the time depends on the product. Use the number of days on the label or leaflet. If there isn't one, ask your pharmacist. MediCycle lets you enter the days for each medicine.",
      source: APP },
    { id: "storage", title: "Where to keep medicines",
      kw: "store storage keep where place bathroom kitchen sunlight heat humid damp cool dry window radiator cabinet shelf temperature hot",
      text: "Keep medicines in a cool, dry place, away from direct sunlight, heat and damp. Avoid bathrooms, kitchens, sinks and radiators. Keep them in their original packaging and follow any storage line on the label.",
      source: NHS_STORE },
    { id: "fridge", title: "Medicines kept in the fridge",
      kw: "fridge refrigerator cold cool chilled insulin power cut freezing 2 8 degrees",
      text: "Some medicines, such as certain creams, eye drops and injections, are kept in the fridge at 2 to 8 degrees C. Follow the label: use the middle shelf, away from the back and sides so they don't freeze, in a clean container away from food. If the power fails, contact your pharmacy.",
      source: NHS_STORE },
    { id: "looks-different", title: "When a medicine looks or smells different",
      kw: "look looks smell smells different colour color cracked crumbling stuck together misshapen changed sticky damaged",
      text: "Don't use a medicine that looks, smells or feels different from normal, or whose tablets are cracked, stuck together or misshapen, even if the date is fine. Ask your pharmacist.",
      source: NHS_STORE },
    { id: "dispose", title: "Getting rid of unused or expired medicine",
      kw: "dispose disposal throw bin trash garbage drain flush toilet sink get rid rid return pharmacy take back expired unused old",
      text: "The best option is to take unused or expired medicine to a pharmacy or a take-back point. Don't flush it or put it in household waste unless the instructions say so. If no take-back is available, the FDA's method is to mix the medicine (not crushed) with something unappealing such as soil, cat litter or coffee grounds, seal it in a bag and bin it. Scratch out personal details on labels. Rules in India can differ, so ask your local pharmacy.",
      source: FDA_DISP, source2: NHS_STORE },
    { id: "dispose-liquid", title: "Disposing of syrups and other liquids",
      kw: "syrup liquid bottle suspension dispose disposal throw pour drain expired cough",
      text: "The FDA page I used doesn't cover liquids, so check the leaflet or ask your pharmacist. A careful starting point is to keep the cap on, seal the bottle in a plastic bag and return it to a pharmacy rather than pouring it away.",
      source: NHS_STORE },
    { id: "children", title: "Keeping medicines away from children",
      kw: "children child kids toddler baby reach pets safe sweets juice lock childproof",
      text: "Keep medicines out of reach of children and pets, in a childproof place. Never call a medicine sweets or juice, and give young children their medicine yourself.",
      source: NHS_STORE },
    { id: "original", title: "Keeping the original pack",
      kw: "original box packet container pill organiser organizer transfer strip keep label name strength",
      text: "Keep medicines in their original packet or container, so you can always see the name, strength, storage line and expiry date.",
      source: NHS_STORE },
    { id: "accuracy", title: "How accurate is the scan",
      kw: "accurate accuracy reliable trust wrong misread misreads ocr scan photo blurry dark confidence correct mistake",
      text: "MediCycle reads dates from photos and can misread them, especially in poor light or on curved bottles. It shows how sure it is and lets you fix the date. Always check the date against the pack.",
      source: APP },
    { id: "privacy", title: "Privacy",
      kw: "privacy private data upload uploaded stored saved server cloud safe photos personal information",
      text: "Photos are read on your device and are not uploaded. Your cabinet is saved only in this browser, on this device.",
      source: APP }
  ];

  // Questions the guide must not answer: dosing, interactions, pregnancy, diagnosis.
  var REFUSE = /\b(dose|doses|dosage|dosing|overdose|double|triple|how (many|much)|mg per|times a day|twice|once daily|interact|interaction|together with|mix with|alcohol|pregnan\w*|breastfeed\w*|nursing|diagnos\w*|symptom\w*|side effects?|allerg\w*|prescribe\w*|stop taking|can i take|should i take|is it safe to take)\b/i;

  var STOP = "a an the is are was were be to of in on at for and or can i my me do does it this that with how what when where should if i'm i've you your from as by not no there any".split(" ");
  function stem(w) { return w.replace(/(ing|ed|es|s)$/, ""); }
  function tokens(s) {
    return (s.toLowerCase().match(/[a-z0-9\/]+/g) || []).filter(function (w) { return STOP.indexOf(w) < 0 && w.length > 1; }).map(stem);
  }
  var docs = PASSAGES.map(function (p) { return { p: p, t: tokens(p.title + " " + p.kw + " " + p.kw + " " + p.text) }; });
  var N = docs.length, avg = docs.reduce(function (a, d) { return a + d.t.length; }, 0) / N;
  var df = {};
  docs.forEach(function (d) { var seen = {}; d.t.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } }); });

  function score(qt, d) {
    var s = 0, k1 = 1.4, b = 0.7;
    qt.forEach(function (w) {
      var f = d.t.filter(function (x) { return x === w; }).length;
      if (!f) return;
      var idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5));
      s += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.t.length / avg));
    });
    return s;
  }

  function ask(question) {
    if (REFUSE.test(question)) {
      return { kind: "refuse", text: "I can't give dosing or medical advice. Please ask your pharmacist or doctor." };
    }
    var qt = tokens(question);
    if (!qt.length) return { kind: "none", text: "Please ask a question about storing, using or disposing of medicines." };
    var ranked = docs.map(function (d) { return { p: d.p, s: score(qt, d) }; }).sort(function (a, b) { return b.s - a.s; });
    var top = ranked[0];
    if (top.s < 2.2) {
      return { kind: "none", text: "I don't have that in my guide. Please ask your pharmacist." };
    }
    var hits = [top];
    if (ranked[1].s >= top.s * 0.72 && ranked[1].s >= 2.2) hits.push(ranked[1]);
    return { kind: "answer", hits: hits.map(function (h) { return h.p; }) };
  }

  global.ExpiryKB = { ask: ask, passages: PASSAGES };
})(window);
