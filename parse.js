/* MediCycle: expiry date parser.
   Takes raw OCR text and returns { month, year, confidence, raw } or null.
   It never guesses: when no date is tied to an expiry keyword with good
   confidence, the app asks the user to enter the date. */
(function (global) {
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  var KEYWORD = /(exp(?:iry|\.|iration)?(?:\s*date)?|use\s*before|best\s*before|e\s*x\s*p)/i;
  var MFG = /\b(mfg|mfd|manuf\w*)\b/i;

  function normYear(y) { var n = parseInt(y, 10); return y.length === 2 ? 2000 + n : n; }
  function valid(m, y) { return m >= 1 && m <= 12 && y >= 2015 && y <= 2045; }

  // OCR often reads 0 as O and 1 as l/I inside dates; fix only next to digits/slashes.
  function cleanLine(line) {
    return line
      .replace(/[|]/g, "/")
      .replace(/(?<=[\d\/\-.])[Oo](?=[\d\/\-.]|\b)/g, "0")
      .replace(/(?<=^|[\s\/\-.:])[Oo](?=\d)/g, "0")
      .replace(/(?<=\d)[lI](?=[\d\/])/g, "1");
  }

  function parseExpiry(text) {
    if (!text) return null;
    var lines = text.split(/\r?\n/).map(cleanLine);
    var patterns = [
      { re: /\b(0?[1-9]|1[0-2])\s*[\/\-.]\s*((?:20)?\d{2})\b/, kind: "num" },
      { re: /\b(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\.?\s*[\/\-.]?\s*((?:20)?\d{2})\b/i, kind: "name" }
    ];
    var best = null;
    lines.forEach(function (line, i) {
      var hasKeyword = KEYWORD.test(line);
      // A line tagged only as a manufacturing date is never an expiry candidate.
      if (!hasKeyword && MFG.test(line)) return;
      var prevHasKeyword = i > 0 && KEYWORD.test(lines[i - 1]);
      // With both MFG and EXP on one line, only the text after the expiry keyword counts.
      var seg = line;
      if (hasKeyword) { var km = line.match(KEYWORD); seg = line.slice(km.index + km[0].length); }
      patterns.forEach(function (p) {
        var m = seg.match(p.re);
        if (!m) return;
        var month = p.kind === "num" ? parseInt(m[1], 10) : (MONTHS[m[1].toLowerCase().slice(0, 4)] || MONTHS[m[1].toLowerCase().slice(0, 3)]);
        var year = normYear(m[2]);
        if (!valid(month, year)) return;
        var confidence = hasKeyword ? 0.9 : prevHasKeyword ? 0.75 : 0.4;
        if (!best || confidence > best.confidence ||
            (confidence === best.confidence && year * 12 + month > best.year * 12 + best.month)) {
          best = { month: month, year: year, confidence: confidence, raw: m[0] };
        }
      });
    });
    return best;
  }

  function guessName(text) {
    var skip = /(b\.?\s?no|batch|mfg|mfd|manuf|exp|mrp|store|date|net |shake|keep|each|discard|sterile|price|tablets?\s*i\.?p|contains|content)/i;
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var best = "", bestLen = 0;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (/^[A-Za-z][A-Za-z0-9 .\-]{3,28}$/.test(l) && !skip.test(l) && /[A-Za-z]{5,}/.test(l)) {
        var w = Math.max.apply(null, (l.match(/[A-Za-z]+/g) || [""]).map(function (x) { return x.length; }));
        if (w > bestLen) { best = l; bestLen = w; }
      }
    }
    if (best) return best;
    return "";
  }

  function guessCategory(text) {
    if (/eye|ear\s*drops|ophthalm|drops/i.test(text)) return "drops";
    if (/syrup|suspension|solution|liquid|\bml\b/i.test(text)) return "liquid";
    if (/cream|ointment|gel|lotion/i.test(text)) return "cream";
    return "tablet";
  }

  global.ExpiryParse = { parseExpiry: parseExpiry, guessName: guessName, guessCategory: guessCategory };
})(window);
