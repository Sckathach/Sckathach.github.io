/* report.js — runs first (before figs.js): numbers figures and tables, fills citations from refs.js, builds the
 * reference list, and marks theorem-likes. kit.boot() (called at the end of figs.js) then adds reference labels,
 * hover previews, KaTeX, sidenotes and the TOC.
 *
 * Markup used in src/:  <a class="cite" data-k="key"></a>            -> "(Author et al., 2024)"  (data-form="prose": "Author et al. (2024)")
 *                       <a class="cite" data-k="a,b"></a>           -> "(A, 2024; B, 2025)"
 *                       <figure id="fig-x"> ... <figcaption>text   -> "Figure N." prepended (figure.tab: "Table N.")
 *                       <a class="xref" href="#fig-x"></a>          -> filled by kit.refs
 *                       <div class="thm" data-kind="Proposition" id="prop-x"> -> "Proposition N."
 *                       <span class="eq" id="eq-x" data-n="4.1">   -> equation number, referenced as "Equation (4.1)" */
window.addEventListener("DOMContentLoaded", () => {
  // the token grid of the appendix (D): tokens, ids (illustrative), first residual vectors
  const tg = document.getElementById("tokgrid");
  if (tg) {
    const toks = ["What", " is", " the", " color", " of", " Herm", "ione", "'s", " cat", "?"], ids = [2061, 318, 262, 3124, 286, 2332, 49453, 338, 3797, 30];
    const row = (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    tg.innerHTML = `<table>${row(toks.map((t) => `<code>${t.replace(/ /g, "␣")}</code>`))}${row(toks.map(() => "↓"))}${row(ids)}${row(toks.map(() => "↓"))}${row(toks.map((_, i) => `$h_{0,${i + 1}}$`))}</table>`;
  }
  "use strict";
  const R = window.REFS || {};
  // figures and tables, in document order
  let nf = 0, nt = 0;
  for (const f of document.querySelectorAll("main figure")) {
    const cap = f.querySelector(":scope > figcaption");
    if (!cap) continue;
    const tab = f.classList.contains("tab"), n = tab ? ++nt : ++nf;
    const b = document.createElement("b");
    b.textContent = `${tab ? "Table" : "Figure"} ${n}.`;
    cap.prepend(b, " ");
  }
  // sidenotes: number refs and notes together, in document order (kit numbers the notes the same way)
  let sn = 0;
  for (const r of document.querySelectorAll(".sn-ref")) r.dataset.n = ++sn;
  // theorem-likes
  const count = {};
  for (const t of document.querySelectorAll(".thm")) {
    const k = t.dataset.kind || "Proposition";
    count[k] = (count[k] || 0) + 1;
    const h = document.createElement("span");
    h.className = "thm-h";
    h.textContent = `${k} ${count[k]}.`;
    t.prepend(h);
    t.dataset.label = `${k} ${count[k]}`;
  }
  for (const a of document.querySelectorAll("a.xref")) {
    const t = document.getElementById((a.getAttribute("href") || "").slice(1));
    if (!t || a.textContent.trim()) continue;
    if (t.classList.contains("thm")) a.textContent = t.dataset.label;
    else if (t.classList.contains("eq")) a.textContent = `Equation (${t.dataset.n})`;
    else if (t.tagName === "H4") a.textContent = `“${t.dataset.short || t.textContent}”`;
  }
  // citations
  const used = [];
  for (const a of document.querySelectorAll("a.cite")) {
    const keys = a.dataset.k.split(",").map((s) => s.trim());
    keys.forEach((k) => { if (!used.includes(k)) used.push(k); });
    const lab = keys.map((k) => (R[k] ? R[k].short : `?${k}`));
    if (a.dataset.form === "prose") {
      const s = lab[0], i = s.lastIndexOf(", ");
      a.textContent = `${s.slice(0, i)} (${s.slice(i + 2)})`;
    } else a.textContent = `(${lab.join("; ")})`;
    a.href = "#ref-" + keys[0];
  }
  const ol = document.querySelector("ol.refs");
  if (ol) {
    used.sort((p, q) => (R[p] ? R[p].sort : p).localeCompare(R[q] ? R[q].sort : q)); // as the PDF: by authors, then year, then title
    for (const k of used) {
      const li = document.createElement("li");
      li.id = "ref-" + k;
      const r = R[k];
      li.innerHTML = r ? r.full : `<span class="todo">missing: ${k}</span>`;
      ol.append(li);
    }
  }
});

