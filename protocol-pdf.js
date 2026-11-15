/* PDF-protokoll: läser protokollets HTML och ritar det med riktiga tabeller, rubriker, fotorutnät och sidfot. */
function makeProtocolPdf(html, JsPDF, logo) {
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const L = 15, R = 195, W = R - L, TOP = 18, BOTTOM = 280;
  const ACC = [240, 110, 20], INK = [25, 25, 25], MUTED = [110, 110, 110], LINE = [222, 222, 222], ZEBRA = [246, 246, 246], RED = [190, 50, 20], GREEN = [30, 130, 60];
  let y = TOP;
  const clean = s => String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/→/g, '->').replace(/✓/g, '[X]').replace(/✕/g, '[  ]').replace(/[—]/g, '-').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
  const color = c => doc.setTextColor(c[0], c[1], c[2]);
  const font = (size, style = 'normal', c = INK) => { doc.setFont('helvetica', style); doc.setFontSize(size); color(c); };
  const lh = size => size * 0.42;
  const wrap = (t, w) => t.split('\n').flatMap(p => doc.splitTextToSize(p, w));
  const newPage = () => { doc.addPage(); y = TOP; };
  const need = h => { if (y + h > BOTTOM) newPage(); };
  const isWarn = el => !!(el && (el.querySelector && el.querySelector('.w,[style*="c40"]') || (el.className || '').includes('w')));

  const dom = new DOMParser().parseFromString(html, 'text/html');
  const title = clean((dom.querySelector('title') || {}).textContent || '');
  const ean = (title.match(/(\d{6,})/) || [''])[0];

  /* Sidhuvud */
  let headBottom = TOP;
  if (logo) { try { const w = 34, h = w * (logo.h || 644) / (logo.w || 800); doc.addImage(logo.src, 'PNG', R - w, 9, w, h); headBottom = 9 + h; } catch (e) {} }
  const h1 = dom.querySelector('h1'), sub = h1 && h1.nextElementSibling && h1.nextElementSibling.tagName === 'P' ? h1.nextElementSibling : null;
  font(18, 'bold'); y = 20;
  for (const l of wrap(clean(h1 ? h1.innerHTML : 'Protokoll'), 140)) { doc.text(l, L, y); y += lh(18) + 1; }
  if (sub) { font(9, 'normal', MUTED); y += 1; for (const l of wrap(clean(sub.innerHTML), 140)) { doc.text(l, L, y); y += lh(9) + 0.8; } }
  y = Math.max(y, headBottom) + 3;
  doc.setDrawColor(...ACC); doc.setLineWidth(0.8); doc.line(L, y, R, y); y += 7;

  /* Block i ordning */
  const blocks = [...dom.body.children].filter(el => el !== h1 && el !== sub);
  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i], tag = el.tagName;
    if (tag === 'H2') {
      const txt = clean(el.innerHTML);
      const excel = /^Rad till Excel/i.test(txt);
      if (/^Foton \(0\)/.test(txt)) continue;
      /* Rubriken följer med tabellen: får tabellen plats på en sida men inte här, börja på ny sida */
      const nx = blocks.slice(i + 1).find(b => b.tagName !== 'P'), tb = nx && (nx.tagName === 'TABLE' ? nx : nx.tagName === 'DIV' ? nx.querySelector('table') : null);
      const th = tb ? tableHeight(tb, excel) : 0;
      const photoNext = nx && nx.tagName === 'FIGURE';
      need(photoNext ? 95 : th && th < BOTTOM - TOP - 12 ? th + 12 : 22); y += 2;
      doc.setFillColor(...ACC); doc.rect(L, y - 4.2, 1.6, 5.2, 'F');
      font(12.5, 'bold'); doc.text(excel ? 'Värden till Excel-arket' : txt, L + 4, y); y += 6;
      if (/^Sammanfattning/i.test(txt)) { i = summary(blocks, i); }
      if (excel) { /* Instruktionen gäller webbvyn; i PDF:en visas värdena som en lista */ while (blocks[i + 1] && blocks[i + 1].tagName === 'P') i++; }
      continue;
    }
    if (tag === 'P') { paragraph(el); continue; }
    if (tag === 'TABLE' || (tag === 'DIV' && el.querySelector('table'))) { const prev = blocks.slice(0, i).reverse().find(b => b.tagName === 'H2'); table(tag === 'TABLE' ? el : el.querySelector('table'), prev && /^Rad till Excel/i.test(prev.textContent)); continue; }
    if (tag === 'FIGURE') { i = photos(blocks, i); continue; }
  }

  function paragraph(el, size = 9.5) {
    const warn = isWarn(el), t = clean(el.innerHTML); if (!t) return;
    const lines = wrap(t, W); need(lines.length * (lh(size) + 1) + 2);
    font(size, warn ? 'bold' : 'normal', warn ? RED : INK);
    for (const l of lines) { doc.text(l, L, y); y += lh(size) + 1; } y += 2;
  }

  /* Sammanfattning som färgad ruta: grön när allt är OK, röd när något behöver åtgärdas */
  function summary(bl, i) {
    const ps = []; while (bl[i + 1] && bl[i + 1].tagName === 'P') ps.push(bl[++i]);
    const bad = ps.some(isWarn) || ps.some(p => /inte klar|ej godkänd/i.test(p.textContent));
    font(9.5); const rows = ps.map(p => ({ warn: isWarn(p) || /inte klar|ej godkänd/i.test(p.textContent), lines: wrap(clean(p.innerHTML), W - 10) }));
    const h = rows.reduce((a, r) => a + r.lines.length * (lh(9.5) + 1), 0) + 7;
    need(h + 4);
    const c = bad ? [253, 236, 230] : [232, 245, 236];
    doc.setFillColor(...c); doc.roundedRect(L, y - 1, W, h, 1.5, 1.5, 'F');
    doc.setFillColor(...(bad ? RED : GREEN)); doc.rect(L, y - 1, 1.6, h, 'F');
    let yy = y + 4.5;
    for (const r of rows) { font(9.5, r.warn ? 'bold' : 'normal', r.warn ? RED : INK); for (const l of r.lines) { doc.text(l, L + 6, yy); yy += lh(9.5) + 1; } }
    y += h + 5; return i;
  }

  function tableModel(tb, excel) {
    let rows = [...tb.querySelectorAll('tr')].map(tr => [...tr.children].map(c => ({ t: clean(c.innerHTML), th: c.tagName === 'TH', warn: isWarn(c) })));
    rows = rows.filter(r => r.length);
    if (!rows.length) return null;
    let n = Math.max(...rows.map(r => r.length));
    /* Breda tabeller (fler än 5 kolumner) vänds till två kolumner så att de får plats */
    if (n > 5 && rows.length === 2) { rows = rows[0].map((h, k) => [{ t: h.t }, { t: (rows[1][k] || {}).t || '' }]); n = 2; }
    /* Excel-värden: tomma rader för ny mätare/terminal visas inte när mätaren behålls */
    if (excel) rows = rows.filter(r => !(/( ny|Nytt mätarnr|Terminal)$/.test(r[0].t) && /^-?$/.test((r[1] || {}).t || '')));
    const head = rows[0] && rows[0].every(c => c.th) ? rows.shift() : null;
    const widths = n === 2 ? [58, W - 58] : n === 3 ? [W - 50, 25, 25] : [W - 3 * 32, 32, 32, 32].slice(0, n);
    return { rows, n, head, widths };
  }
  function tableHeight(tb, excel) {
    const m = tableModel(tb, excel); if (!m) return 0; font(9);
    const rh = r => Math.max(...r.map((c, k) => wrap(c.t || '-', m.widths[k] - 4).length)) * (lh(9) + 0.9) + 3.2;
    return (m.head ? 8 : 0) + m.rows.reduce((a, r) => a + rh(r), 0) + 5;
  }
  function table(tb, excel) {
    const m = tableModel(tb, excel); if (!m) return;
    const { rows, n, head, widths } = m;
    const pad = 2, size = 9;
    const drawHead = () => {
      if (!head) return; font(8.5, 'bold', [255, 255, 255]);
      const hl = head.map((c, k) => wrap(c.t, widths[k] - 2 * pad)), hh = Math.max(...hl.map(l => l.length)) * (lh(8.5) + 0.8) + 3.2;
      doc.setFillColor(...INK); doc.rect(L, y, W, hh, 'F');
      let x = L; hl.forEach((ls, k) => { ls.forEach((l, m) => doc.text(l, x + pad, y + 4.2 + m * (lh(8.5) + 0.8))); x += widths[k]; });
      y += hh;
    };
    need(head ? 18 : 10); drawHead();
    rows.forEach((r, ri) => {
      font(size); const cl = r.map((c, k) => wrap(c.t || '-', widths[k] - 2 * pad));
      const h = Math.max(...cl.map(l => l.length)) * (lh(size) + 0.9) + 3.2;
      if (y + h > BOTTOM) { newPage(); drawHead(); }
      if (ri % 2 === 1) { doc.setFillColor(...ZEBRA); doc.rect(L, y, W, h, 'F'); }
      let x = L;
      cl.forEach((ls, k) => {
        const c = r[k] || {}, isLabel = n === 2 && k === 0, v = (c.t || '').trim();
        let col = isLabel ? MUTED : INK, st = 'normal';
        if (c.warn || /^FEL$/.test(v)) { col = RED; st = 'bold'; } else if (/^OK$/.test(v)) col = GREEN;
        font(size, st, col);
        ls.forEach((l, m) => doc.text(l, x + pad, y + 4.3 + m * (lh(size) + 0.9)));
        x += widths[k];
      });
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(L, y + h, R, y + h);
      y += h;
    });
    y += 5;
  }

  /* Foton två och två med bildtext */
  function photos(bl, i) {
    const figs = []; while (bl[i] && bl[i].tagName === 'FIGURE') figs.push(bl[i++]); i--;
    const gap = 6, cw = (W - gap) / 2, maxH = 78;
    for (let k = 0; k < figs.length; k += 2) {
      const pair = figs.slice(k, k + 2).map(f => { const img = f.querySelector('img'), src = img && img.getAttribute('src'); let info = null; try { info = src && doc.getImageProperties(src); } catch (e) {} return { src, info, cap: clean((f.querySelector('figcaption') || {}).innerHTML || '') }; });
      const dims = pair.map(p => { if (!p.info) return { w: 0, h: 0 }; const s = Math.min(cw / p.info.width, maxH / p.info.height); return { w: p.info.width * s, h: p.info.height * s }; });
      const rowH = Math.max(...dims.map(d => d.h)) + 8;
      need(rowH);
      pair.forEach((p, m) => {
        const x = L + m * (cw + gap);
        if (p.info) { try { doc.addImage(p.src, p.info.fileType, x, y, dims[m].w, dims[m].h); } catch (e) {} }
        font(7.5, 'normal', MUTED); doc.text(wrap(p.cap, cw)[0] || '', x, y + dims[m].h + 4);
      });
      y += rowH + 2;
    }
    return i;
  }

  /* Sidfot */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p); doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(L, 287, R, 287);
    font(7.5, 'normal', MUTED);
    doc.text('LiRo Elteknik AB · Org.nr 559316-2752 · Protokoll byte av mättransformatorer' + (ean ? ' · EAN ' + ean : ''), L, 291);
    doc.text('Sida ' + p + ' av ' + total, R, 291, { align: 'right' });
  }
  return doc;
}
if (typeof module !== 'undefined') module.exports = makeProtocolPdf;
