/* kit.js — shared behaviour for html-lab reports. No dependencies except KaTeX (vendored) for math.
 *
 * kit.boot({macros})        theme toggle, KaTeX, sidenote toggles, TOC, active-section tracking
 * kit.plot(el, spec => {})  SVG chart; re-renders on resize and when you call .render(); legend toggles + hover
 * kit.seg(el, opts, v, cb)  segmented control
 * kit.table(el, rows, cols) plain table
 * kit.fmt.*                 number formatters
 *
 * Invariants: charts take colors as CSS vars ("var(--s1)") so a theme switch needs no re-render; every
 * series that matters has a legend entry (identity is never color alone); hover tips come from mark.tip(d).
 */
(function () {
  "use strict";
  const kit = (window.kit = {});
  const NS = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------------ dom helpers
  function el(tag, attrs, ...kids) {
    const svg = ["svg", "g", "path", "line", "rect", "circle", "text", "polyline", "polygon", "tspan", "title", "defs", "pattern", "clipPath", "linearGradient", "stop"].includes(tag);
    const n = svg ? document.createElementNS(NS, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "style" && typeof v === "object") Object.assign(n.style, v);
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined) n.append(c.nodeType ? c : document.createTextNode(c));
    return n;
  }
  kit.el = el;
  const $ = (s, r = document) => (typeof s === "string" ? r.querySelector(s) : s);

  // ------------------------------------------------------------------ formatters
  kit.fmt = {
    f: (d) => (x) => (x === null || x === undefined || Number.isNaN(x) ? "–" : (+x).toFixed(d)),
    s: (d) => (x) => (x === null || x === undefined ? "–" : (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(d)),
    params: (n) => (n >= 1e9 ? +(n / 1e9).toPrecision(3) + "B" : n >= 1e6 ? +(n / 1e6).toPrecision(3) + "M" : n >= 1e3 ? +(n / 1e3).toPrecision(3) + "k" : String(n)),
    steps: (n) => (n >= 1000 ? +(n / 1000).toPrecision(3) + "k" : String(n)),
  };

  // ------------------------------------------------------------------ theme: light by default, dark only by the button
  function theme() {
    let cur = "light";
    try { if (localStorage.getItem("kit-theme") === "dark") cur = "dark"; } catch (e) { /* storage blocked: light */ }
    const btn = el("button", { class: "theme-btn", title: "switch theme" });
    const apply = () => { document.documentElement.setAttribute("data-theme", cur); btn.textContent = cur === "light" ? "☾ dark" : "☀ light"; };
    btn.addEventListener("click", () => {
      cur = cur === "light" ? "dark" : "light";
      try { localStorage.setItem("kit-theme", cur); } catch (e) { /* not persisted */ }
      apply();
    });
    document.body.append(btn);
    apply();
  }

  // ------------------------------------------------------------------ references with hover previews
  /**
   * a.xref[href="#id"] with no text gets a readable label: "§3 short title" for headings (h2/h3 data-short),
   * "Figure N" for figures (from the caption's <b>), plus data-part ("right"). a.sref[data-s] (log entries)
   * shows "S12 · slug" from opts.slugs, and the full log heading on hover. Every internal link, citation and
   * sidenote number previews its target on hover: a section shows its title and first paragraph, a figure
   * shows the figure and its caption, a reference shows the bibliography entry, a sidenote shows the note.
   */
  kit.refs = function (opts = {}) {
    for (const a of document.querySelectorAll("a.xref")) {
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) a.classList.add(/^H[1-6]$/.test(t.tagName) ? "to-sec" : "to-fig"); // colour by kind of target (kit.css)
      if (!t || a.textContent.trim()) continue;
      if (/^H[23]$/.test(t.tagName)) {
        let num = t.querySelector(".num");
        for (let h = t.previousElementSibling; !num && h; h = h.previousElementSibling) if (h.tagName === "H2") num = h.querySelector(".num"); // an h3 borrows its section's number
        a.innerHTML = `<span class="xn">§${num ? num.textContent : ""}</span>${t.dataset.short || t.textContent}`;
      } else if (t.tagName === "FIGURE") {
        const b = t.querySelector("figcaption b");
        a.textContent = (b ? b.textContent.replace(/\.$/, "") : "figure") + (a.dataset.part ? ", " + a.dataset.part : "");
      } else if (t.dataset.caption) a.textContent = t.dataset.caption + (a.dataset.part ? ", " + a.dataset.part : ""); // tables: <div data-caption="Table 2">
    }
    for (const a of document.querySelectorAll("a.sref")) {
      const s = a.dataset.s, base = s.replace(/[a-z]$/, "");
      if (opts.slugs && opts.slugs[s]) a.textContent = `${s} · ${opts.slugs[s]}`;
      if (opts.log) a.dataset.pop = opts.log[s] || opts.log[base] || "";
      if (opts.logHref) a.href = opts.logHref;
    }
    const pop = el("div", { class: "pop" });
    document.body.append(pop);
    let hideT = 0;
    const hide = () => { hideT = setTimeout(() => pop.classList.remove("on"), 140); };
    pop.addEventListener("mouseenter", () => clearTimeout(hideT));
    pop.addEventListener("mouseleave", hide);
    const kind = (k) => `<div class="pk">${k}</div>`;
    function content(a) {
      if (a.classList.contains("sref")) return a.dataset.pop ? kind("log entry") + a.dataset.pop.replace(/`([^`]*)`/g, "<code>$1</code>") : null;
      if (a.classList.contains("sn-ref")) {
        const n = a.nextElementSibling;
        if (!n) return null;
        if (n.classList.contains("placed")) { n.classList.add("flash"); setTimeout(() => n.classList.remove("flash"), 900); return null; }
        return kind("note") + n.innerHTML;
      }
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#") || href.length < 2) return null;
      const t = document.getElementById(href.slice(1));
      if (!t) return null;
      if (/^H[23]$/.test(t.tagName)) {
        let p = t.nextElementSibling;
        while (p && p.tagName !== "P" && !/^H[23]$/.test(p.tagName)) p = p.nextElementSibling;
        const h = t.cloneNode(true);
        return kind("section") + h.outerHTML + (p && p.tagName === "P" ? p.outerHTML : "");
      }
      if (t.tagName === "FIGURE") {
        const f = t.cloneNode(true);
        f.querySelectorAll(".controls, .pop").forEach((x) => x.remove());
        return kind("figure") + f.outerHTML;
      }
      if (t.tagName === "LI") return kind("reference") + t.innerHTML;
      if (t.dataset.caption) return kind("table") + t.innerHTML;
      return kind("") + t.cloneNode(true).outerHTML;
    }
    function show(a) {
      const html = content(a);
      if (!html) return;
      clearTimeout(hideT);
      pop.innerHTML = html;
      pop.classList.add("on");
      const r = a.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
      let x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8), y = r.bottom + 8;
      if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 8);
      pop.style.left = x + "px";
      pop.style.top = y + "px";
    }
    for (const a of document.querySelectorAll('a[href^="#"], a.sref, a.cite, .sn-ref')) {
      if (a.closest(".toc")) continue;
      a.addEventListener("mouseenter", () => show(a));
      a.addEventListener("mouseleave", hide);
    }
  };

  // ------------------------------------------------------------------ boot
  kit.macros = {};
  kit.boot = function (opts = {}) {
    kit.macros = opts.macros || {};
    theme();
    kit.refs(opts.refs || {});
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false, macros: opts.macros || {}, ignoredClasses: ["nomath"],
      });
    }
    // sidenotes: numbered in order; on wide screens placed in the margin next to their reference, on narrow
    // screens the number toggles the note inline
    let k = 0;
    document.querySelectorAll(".sn").forEach((n) => { n.dataset.n = ++k; });
    document.querySelectorAll(".sn-ref, .mn-ref").forEach((r) => r.addEventListener("click", () => {
      const n = r.nextElementSibling;
      if (n && (n.classList.contains("sn") || n.classList.contains("mn"))) n.classList.toggle("show");
    }));
    kit.placeNotes();
    const page = document.querySelector(".page");
    if (page) {
      let raf = 0;
      new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(kit.placeNotes); }).observe(page);
    }
    // TOC from h2[id], into every .toc (a fixed side one on wide screens, an inline one otherwise)
    for (const toc of document.querySelectorAll(".toc")) {
      const ol = el("ol");
      document.querySelectorAll("h2[id]").forEach((h) => {
        const num = h.querySelector(".num");
        const label = h.dataset.toc || h.textContent.replace(num ? num.textContent : "", "").trim();
        ol.append(el("li", {}, el("a", { href: "#" + h.id, "data-for": h.id }, el("span", { class: "n" }, num ? num.textContent : ""), label)));
      });
      toc.append(ol);
      const links = [...toc.querySelectorAll("a")];
      const obs = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.for === e.target.id));
      }), { rootMargin: "0px 0px -75% 0px" });
      document.querySelectorAll("h2[id]").forEach((h) => obs.observe(h));
    }
  };

  // margin column geometry comes from the page grid: right edge of the text column + the gap
  kit.placeNotes = function () {
    const page = document.querySelector(".page");
    if (!page) return;
    const notes = [...document.querySelectorAll(".sn, .mn")];
    const wide = window.matchMedia("(min-width: 1101px)").matches;
    const pb = page.getBoundingClientRect();
    const col = [...page.children].find((c) => c.tagName === "P" || c.tagName === "H2");
    if (!wide || !col) { notes.forEach((n) => { n.classList.remove("placed"); n.style.top = n.style.left = ""; }); return; }
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gap")) || 36;
    const left = col.getBoundingClientRect().right - pb.left + gap;
    let floor = -Infinity;
    for (const n of notes) {
      const ref = n.previousElementSibling && n.previousElementSibling.matches(".sn-ref, .mn-ref") ? n.previousElementSibling : n.parentElement;
      const top = Math.max(ref.getBoundingClientRect().top - pb.top - 2, floor);
      n.classList.add("placed");
      n.style.left = left + "px";
      n.style.top = top + "px";
      floor = top + n.offsetHeight + 10;
    }
  };

  // ------------------------------------------------------------------ tooltip (one per page)
  let tipEl = null;
  function tip(html, cx, cy) {
    if (!tipEl) { tipEl = el("div", { class: "tip" }); document.body.append(tipEl); }
    if (html === null) { tipEl.classList.remove("on"); return; }
    tipEl.innerHTML = html;
    tipEl.classList.add("on");
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = cx + 14, y = cy - h - 10;
    if (x + w > window.innerWidth - 8) x = cx - w - 14;
    if (y < 8) y = cy + 16;
    tipEl.style.left = x + "px";
    tipEl.style.top = y + "px";
  }
  kit.tipRow = (color, label, value) => `<div><span class="sw" style="background:${color}"></span>${label} <b>${value}</b></div>`;

  // ------------------------------------------------------------------ scales
  function niceTicks(a, b, n) {
    const span = b - a;
    if (!(span > 0)) return [a];
    const raw = span / Math.max(1, n);
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    const step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
    const out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-9; v += step) out.push(+v.toPrecision(12));
    return out;
  }
  function scale(ax, r0, r1, vals) {
    const type = ax.type || "linear";
    if (type === "band") {
      const dom = ax.domain;
      const pad = ax.padding ?? 0.22;
      const step = (r1 - r0) / Math.max(1, dom.length);
      const f = (v) => r0 + step * dom.indexOf(v) + step * pad / 2;
      f.bw = step * (1 - pad);
      f.center = (v) => f(v) + f.bw / 2;
      f.ticks = dom.map((v) => [v, ax.fmt ? ax.fmt(v) : String(v)]);
      f.type = type;
      return f;
    }
    let [a, b] = ax.domain || [Math.min(...vals), Math.max(...vals)];
    if (!ax.domain && type === "linear") { const t = niceTicks(a, b, 5); a = Math.min(a, t[0]); b = Math.max(b, t[t.length - 1]); }
    let f;
    if (type === "log") {
      const la = Math.log10(a), lb = Math.log10(b);
      f = (v) => r0 + (Math.log10(Math.max(v, 1e-300)) - la) / (lb - la) * (r1 - r0);
    } else f = (v) => r0 + (v - a) / (b - a) * (r1 - r0);
    let ticks = ax.ticks;
    if (!ticks) {
      if (type === "log") {
        ticks = [];
        const span = Math.log10(b) - Math.log10(a);
        for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++)
          for (const mlt of span < 1.3 ? [1, 2, 5] : [1]) { const v = mlt * Math.pow(10, e); if (v >= a * 0.999 && v <= b * 1.001) ticks.push(v); }
      } else ticks = niceTicks(a, b, ax.nticks || 5);
    }
    f.ticks = ticks.map((t) => (Array.isArray(t) ? t : [t, ax.fmt ? ax.fmt(t) : String(+t.toPrecision(6))]));
    f.domain = [a, b];
    f.type = type;
    return f;
  }

  // ------------------------------------------------------------------ marks
  function shapePath(shape, x, y, r) {
    if (shape === "cross") return `M${x - r},${y - r}L${x + r},${y + r}M${x - r},${y + r}L${x + r},${y - r}`;
    if (shape === "diamond") return `M${x},${y - r * 1.3}L${x + r * 1.3},${y}L${x},${y + r * 1.3}L${x - r * 1.3},${y}Z`;
    if (shape === "square") return `M${x - r},${y - r}h${2 * r}v${2 * r}h${-2 * r}Z`;
    if (shape === "tick") return `M${x},${y - r * 1.5}V${y + r * 1.5}`;
    return null;
  }
  const STROKED = new Set(["cross", "tick"]);
  function legendSwatch(it) {
    const s = el("svg", { width: 18, height: 12 });
    const c = it.color;
    if (it.shape === "line" || it.shape === "dash" || !it.shape)
      s.append(el("line", { x1: 1, x2: 17, y1: 6, y2: 6, style: { stroke: c, strokeWidth: 2.2, strokeDasharray: it.shape === "dash" ? "3 2.5" : it.dash || "" } }));
    else if (it.shape === "dot") s.append(el("circle", { cx: 9, cy: 6, r: 4.2, style: { fill: c } }));
    else if (it.shape === "hollow") s.append(el("circle", { cx: 9, cy: 6, r: 3.8, style: { fill: "none", stroke: c, strokeWidth: 1.6 } }));
    else if (it.shape === "square") s.append(el("rect", { x: 3, y: 1, width: 11, height: 10, rx: 2, style: { fill: c } }));
    else if (it.shape === "band") s.append(el("rect", { x: 1, y: 2, width: 16, height: 8, rx: 1, style: { fill: c, opacity: 0.35 } }));
    else s.append(el("path", { d: shapePath(it.shape, 9, 6, 3.6), style: { fill: STROKED.has(it.shape) ? "none" : c, stroke: c, strokeWidth: it.shape === "tick" ? 2.2 : 1.6 } }));
    return s;
  }

  /**
   * kit.plot(container, specFn) — specFn(state) returns
   * { height, margin, x: axis, y: axis, marks: [...], legend: [...] }
   * axis: { type: linear|log|band, domain, ticks, fmt, label, grid }
   * marks: line {data:[{x,y}], color, width, dash, points, endLabel} · area {data:[{x,y0,y1}]} ·
   *        dot {data, color, r, shape: circle|hollow|cross|diamond|square} · bar {data:[{x,y}], color, group, ngroups} ·
   *        range {data:[{x,y0,y1}], group, ngroups} · rule {x|y} · span {x0,x1|y0,y1} · label {x,y,text} ·
 *        cloud {data, color, r, opacity} (thousands of points, no hover) · arrow {x0,y0,x1,y1,color,width,text,tip}
   * Any mark: key (legend id), tip: d => html.
   */
  kit.plot = function (container, specFn) {
    const root = $(container);
    root.innerHTML = "";
    const holder = el("div", { class: "chart-holder" });
    const legendDiv = el("div", { class: "legend" });
    root.append(holder, legendDiv);
    const state = { hidden: new Set(), lastW: 0 };
    const api = { state, render };

    function render() {
      const spec = specFn(state);
      const W = Math.max(260, holder.clientWidth || root.clientWidth || 600);
      state.lastW = W;
      const H = spec.height || 300;
      const m = Object.assign({ t: 14, r: 18, b: 42, l: 54 }, spec.margin || {});
      const visible = (mk) => !(mk.key && state.hidden.has(mk.key));
      const marks = (spec.marks || []).filter(visible);
      const xs = [], ys = [];
      for (const mk of marks) for (const d of mk.data || []) {
        if (d.x !== undefined) xs.push(d.x);
        for (const k of ["y", "y0", "y1"]) if (d[k] !== undefined && d[k] !== null) ys.push(d[k]);
      }
      const X = scale(spec.x, m.l, W - m.r, xs.length ? xs : [0, 1]);
      const Y = scale(spec.y, H - m.b, m.t, ys.length ? ys : [0, 1]);
      const svg = el("svg", { class: "plot", width: W, height: H, viewBox: `0 0 ${W} ${H}` });
      const hits = [];
      const endLabels = [];

      // grid + axes
      const g = el("g", { class: "grid" });
      if (spec.y.grid !== false && Y.type !== "band") for (const [v] of Y.ticks) g.append(el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v) }));
      if (spec.x.grid && X.type !== "band") for (const [v] of X.ticks) g.append(el("line", { y1: m.t, y2: H - m.b, x1: X(v), x2: X(v) }));
      svg.append(g);
      svg.append(el("line", { class: "base", x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b }));
      for (const [v, lab] of X.ticks) {
        const xx = X.type === "band" ? X.center(v) : X(v);
        if (xx < m.l - 1 || xx > W - m.r + 1) continue;
        svg.append(el("text", { x: xx, y: H - m.b + 16, "text-anchor": spec.x.rotate ? "end" : "middle", transform: spec.x.rotate ? `rotate(-${spec.x.rotate} ${xx} ${H - m.b + 16})` : null }, lab));
      }
      for (const [v, lab] of Y.ticks) {
        const yy = Y.type === "band" ? Y.center(v) : Y(v);
        if (yy < m.t - 1 || yy > H - m.b + 1) continue;
        svg.append(el("text", { x: m.l - 8, y: yy + 4, "text-anchor": "end" }, lab));
      }
      if (spec.x.label) svg.append(el("text", { class: "axis-label", x: m.l + (W - m.l - m.r) / 2, y: H - 6, "text-anchor": "middle" }, spec.x.label));
      if (spec.y.label) svg.append(el("text", { class: "axis-label", x: 0, y: 0, transform: `translate(13 ${m.t + (H - m.t - m.b) / 2}) rotate(-90)`, "text-anchor": "middle" }, spec.y.label));

      const xpos = (d, mk) => {
        if (X.type !== "band") return X(d.x);
        const n = mk.ngroups || 1, gi = mk.group || 0;
        return X(d.x) + (X.bw / n) * (gi + 0.5);
      };
      const clipY = (v) => Math.max(m.t - 4, Math.min(H - m.b + 4, v));
      const ypos = (v) => (Y.type === "band" ? Y.center(v) : Y(v));

      for (const mk of marks) {
        const col = mk.color || "var(--ink-2)";
        const gk = el("g", { "data-key": mk.key || "_" });
        if (mk.type === "span") {
          const x0 = mk.x0 !== undefined ? X(mk.x0) : m.l, x1 = mk.x1 !== undefined ? X(mk.x1) : W - m.r;
          const y0 = mk.y1 !== undefined ? Y(mk.y1) : m.t, y1 = mk.y0 !== undefined ? Y(mk.y0) : H - m.b;
          gk.append(el("rect", { x: Math.min(x0, x1), y: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), style: { fill: mk.color || "var(--band)" } }));
          if (mk.text) gk.append(el("text", { x: Math.min(x0, x1) + 4, y: m.t + 11, style: { fontSize: "11px" } }, mk.text));
        } else if (mk.type === "rule") {
          const st = { stroke: mk.color || "var(--ink-2)", strokeWidth: mk.width || 1, strokeDasharray: mk.dash || "", opacity: mk.opacity ?? 0.6 };
          if (mk.y !== undefined) gk.append(el("line", { x1: m.l, x2: W - m.r, y1: ypos(mk.y), y2: ypos(mk.y), style: st }));
          else gk.append(el("line", { y1: m.t, y2: H - m.b, x1: X(mk.x), x2: X(mk.x), style: st }));
          if (mk.text) gk.append(el("text", { x: mk.y !== undefined ? W - m.r : X(mk.x) + 4, y: mk.y !== undefined ? Y(mk.y) - 5 : m.t + 10, "text-anchor": mk.y !== undefined ? "end" : "start", style: { fontSize: "11px" } }, mk.text));
        } else if (mk.type === "area") {
          const d = mk.data.filter((p) => p.y0 !== null && p.y1 !== null);
          if (d.length) {
            const top = d.map((p) => `${xpos(p, mk)},${clipY(Y(p.y1))}`), bot = d.slice().reverse().map((p) => `${xpos(p, mk)},${clipY(Y(p.y0))}`);
            gk.append(el("path", { d: "M" + top.join("L") + "L" + bot.join("L") + "Z", style: { fill: col, opacity: mk.opacity ?? 0.15 } }));
          }
        } else if (mk.type === "line") {
          let path = "", pen = false;
          for (const p of mk.data) {
            if (p.y === null || p.y === undefined) { pen = false; continue; }
            path += (pen ? "L" : "M") + xpos(p, mk) + "," + clipY(ypos(p.y));
            pen = true;
          }
          gk.append(el("path", { d: path, style: { fill: "none", stroke: col, strokeWidth: mk.width || 2, strokeDasharray: mk.dash || "", strokeLinejoin: "round", strokeLinecap: "round", opacity: mk.opacity ?? 1 } }));
          for (const p of mk.data) {
            if (p.y === null || p.y === undefined) continue;
            const cx = xpos(p, mk), cy = clipY(ypos(p.y));
            if (mk.points) gk.append(el("circle", { cx, cy, r: mk.r || 2.8, style: { fill: col, stroke: "var(--bg)", strokeWidth: 1.2 } }));
            if (mk.tip) hits.push({ x: cx, y: cy, html: mk.tip(p), key: mk.key, color: col });
          }
          if (mk.endLabel) {
            const last = [...mk.data].reverse().find((p) => p.y !== null && p.y !== undefined);
            if (last) {
              const t = el("text", { class: "dlabel", x: xpos(last, mk) + 6 + (mk.labelDx || 0), y: clipY(ypos(last.y)) + 4 + (mk.labelDy || 0), style: { fill: mk.labelColor || col } }, mk.endLabel);
              endLabels.push(t);
              gk.append(t);
            }
          }
        } else if (mk.type === "dot") {
          for (const p of mk.data) {
            if (p.y === null || p.y === undefined) continue;
            const cx = xpos(p, mk), cy = clipY(ypos(p.y)), r = p.r || mk.r || 4.5, shape = p.shape || mk.shape || "circle";
            const c = p.color || col;
            if (shape === "circle") gk.append(el("circle", { cx, cy, r, style: { fill: c, stroke: "var(--bg)", strokeWidth: 1.5, opacity: mk.opacity ?? 1 } }));
            else if (shape === "hollow") gk.append(el("circle", { cx, cy, r: r - 0.6, style: { fill: "var(--bg)", stroke: c, strokeWidth: 1.7 } }));
            else gk.append(el("path", { d: shapePath(shape, cx, cy, shape === "cross" ? r * 0.8 : r * 0.85), style: { fill: STROKED.has(shape) ? "none" : c, stroke: STROKED.has(shape) ? c : "var(--bg)", strokeWidth: STROKED.has(shape) ? (shape === "tick" ? 2.4 : 1.8) : 1.2 } }));
            if (p.label) gk.append(el("text", { class: "dlabel", x: cx + (p.dx ?? 7), y: cy + (p.dy ?? 4), "text-anchor": p.anchor || "start", style: { fill: c } }, p.label));
            if (mk.tip) hits.push({ x: cx, y: cy, html: mk.tip(p), key: mk.key, color: c });
          }
        } else if (mk.type === "bar") {
          const n = mk.ngroups || 1, gi = mk.group || 0, bw = X.bw / n;
          const base = Y.type === "log" ? Y(Y.domain[0]) : Y(Math.max(Y.domain ? Y.domain[0] : 0, 0));
          for (const p of mk.data) {
            if (p.y === null || p.y === undefined) continue;
            const x = X(p.x) + bw * gi + 1, w = Math.max(1, bw - 2), y = clipY(Y(p.y));
            gk.append(el("rect", { x, y: Math.min(y, base), width: w, height: Math.abs(base - y), rx: Math.min(2, w / 3), style: { fill: p.color || col, opacity: mk.opacity ?? 1 } }));
            if (mk.tip) hits.push({ x: x + w / 2, y: Math.min(y, base), rect: [x, Math.min(y, base) - 4, w, Math.abs(base - y) + 8], html: mk.tip(p), key: mk.key, color: p.color || col });
          }
        } else if (mk.type === "range") {
          for (const p of mk.data) {
            const cx = xpos(p, mk);
            gk.append(el("line", { x1: cx, x2: cx, y1: Y(p.y0), y2: Y(p.y1), style: { stroke: col, strokeWidth: mk.width || 5, opacity: mk.opacity ?? 0.45, strokeLinecap: "butt" } }));
          }
        } else if (mk.type === "cloud") {
          // many small points as one path per mark (round caps on zero-length segments): fast, no per-point hover
          let d = "";
          for (const p of mk.data) { if (p.y === null || p.y === undefined) continue; d += `M${xpos(p, mk).toFixed(1)},${clipY(ypos(p.y)).toFixed(1)}h0`; }
          gk.append(el("path", { d, style: { fill: "none", stroke: col, strokeWidth: 2 * (mk.r || 1.6), strokeLinecap: "round", opacity: mk.opacity ?? 0.35 } }));
        } else if (mk.type === "arrow") {
          // a vector from (x0, y0) to (x1, y1) in data units, with a halo so it reads over clouds
          const ax0 = X(mk.x0 ?? 0), ay0 = Y(mk.y0 ?? 0), ax1 = X(mk.x1), ay1 = Y(mk.y1);
          const len = Math.hypot(ax1 - ax0, ay1 - ay0) || 1, ux = (ax1 - ax0) / len, uy = (ay1 - ay0) / len, hw = mk.head || 7;
          const bx = ax1 - ux * hw * 1.4, by = ay1 - uy * hw * 1.4;
          const head = `M${ax1},${ay1}L${bx - uy * hw * 0.6},${by + ux * hw * 0.6}L${bx + uy * hw * 0.6},${by - ux * hw * 0.6}Z`;
          for (const halo of [true, false]) {
            gk.append(el("line", { x1: ax0, y1: ay0, x2: bx, y2: by, style: { stroke: halo ? "var(--bg)" : col, strokeWidth: (mk.width || 2) + (halo ? 3 : 0), strokeLinecap: "round" } }));
            gk.append(el("path", { d: head, style: { fill: halo ? "var(--bg)" : col, stroke: halo ? "var(--bg)" : "none", strokeWidth: halo ? 3 : 0 } }));
          }
          if (mk.text) gk.append(el("text", { class: "dlabel halo", x: ax1 + (mk.dx ?? 6), y: ay1 + (mk.dy ?? 4), "text-anchor": mk.anchor || "start", style: { fill: col } }, mk.text));
          if (mk.tip) hits.push({ x: ax1, y: ay1, html: mk.tip, key: mk.key, color: col });
        } else if (mk.type === "label") {
          gk.append(el("text", { class: "dlabel", x: (X.type === "band" ? X.center(mk.x) : X(mk.x)) + (mk.dx || 0), y: ypos(mk.y) + (mk.dy || 0), "text-anchor": mk.anchor || "start", style: { fill: col, fontWeight: mk.weight || 600 } }, mk.text));
        }
        svg.append(gk);
      }

      // end labels: push apart vertically so that none overlap (12px apart), in their y order
      endLabels.sort((p, q) => +p.getAttribute("y") - +q.getAttribute("y"));
      for (let i = 1; i < endLabels.length; i++) {
        const prev = +endLabels[i - 1].getAttribute("y"), cur = +endLabels[i].getAttribute("y");
        if (cur - prev < 12) endLabels[i].setAttribute("y", prev + 12);
      }

      // hover: nearest hit within 26px, or the bar under the pointer
      const focus = el("circle", { class: "focus", r: 7, style: { display: "none" } });
      svg.append(focus);
      const overlay = el("rect", { x: 0, y: 0, width: W, height: H, style: { fill: "transparent" } });
      svg.append(overlay);
      const move = (ev) => {
        const b = svg.getBoundingClientRect();
        const px = ev.clientX - b.left, py = ev.clientY - b.top;
        let best = null, bd = 26 * 26;
        for (const h of hits) {
          if (h.key && state.hidden.has(h.key)) continue;
          if (h.rect) { const [rx, ry, rw, rh] = h.rect; if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) { best = h; bd = -1; break; } continue; }
          const dd = (h.x - px) ** 2 + (h.y - py) ** 2;
          if (dd < bd) { bd = dd; best = h; }
        }
        if (best) {
          focus.style.display = best.rect ? "none" : "";
          focus.setAttribute("cx", best.x); focus.setAttribute("cy", best.y);
          tip(best.html, ev.clientX, ev.clientY);
        } else { focus.style.display = "none"; tip(null); }
      };
      overlay.addEventListener("pointermove", move);
      overlay.addEventListener("pointerleave", () => { focus.style.display = "none"; tip(null); });

      holder.innerHTML = "";
      holder.append(svg);

      // legend
      legendDiv.innerHTML = "";
      for (const it of spec.legend || []) {
        const node = el("span", { class: "it" + (it.key && state.hidden.has(it.key) ? " off" : ""), title: it.key ? "click: show/hide · hover: highlight" : "" }, legendSwatch(it), el("span", { class: "lab" }, it.label));
        if (it.key) {
          node.addEventListener("click", () => { state.hidden.has(it.key) ? state.hidden.delete(it.key) : state.hidden.add(it.key); render(); });
          node.addEventListener("mouseenter", () => {
            if (state.hidden.has(it.key)) return;
            svg.classList.add("hl");
            svg.querySelectorAll(`[data-key="${CSS.escape(it.key)}"]`).forEach((n) => n.classList.add("hl-on"));
          });
          node.addEventListener("mouseleave", () => { svg.classList.remove("hl"); svg.querySelectorAll(".hl-on").forEach((n) => n.classList.remove("hl-on")); });
        }
        legendDiv.append(node);
      }
    }

    let raf = 0;
    new ResizeObserver(() => {
      if (Math.abs((holder.clientWidth || 0) - state.lastW) < 2) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    }).observe(root);
    render();
    return api;
  };

  // ------------------------------------------------------------------ controls
  kit.seg = function (container, options, value, onChange) {
    const root = $(container);
    const box = el("span", { class: "seg" });
    let cur = value;
    const btns = options.map(([v, label]) => {
      const b = el("button", { type: "button", class: v === cur ? "on" : "", onclick: () => {
        cur = v;
        btns.forEach((x, i) => x.classList.toggle("on", options[i][0] === v));
        onChange(v);
      } }, label);
      return b;
    });
    box.append(...btns);
    root.append(box);
    return { get: () => cur };
  };

  kit.table = function (container, rows, cols, opts = {}) {
    const t = el("table", { class: "tbl" + (opts.left ? " left" : "") });
    // a column is [label, key, format?, "l"?]; "l" left-aligns a text column
    t.append(el("thead", {}, el("tr", {}, cols.map(([label, , , al]) => el("th", { html: label, class: al === "l" ? "l" : null })))));
    t.append(el("tbody", {}, rows.map((r) => el("tr", { class: opts.dim && opts.dim(r) ? "dim" : "" }, cols.map(([, key, f, al]) => el("td", { html: f ? f(r[key], r) : r[key] ?? "–", class: al === "l" ? "l" : null }))))));
    if (opts.caption) t.append(el("caption", { html: opts.caption }));
    const wrap = el("div", { class: "tbl-wrap" }, t);
    $(container).append(wrap);
    if (window.renderMathInElement) window.renderMathInElement(wrap, { delimiters: [{ left: "$", right: "$", display: false }], throwOnError: false, macros: kit.macros });
    return t;
  };

  // ------------------------------------------------------------------ small stats
  kit.median = (a) => { const s = a.filter((v) => v !== null && v !== undefined).sort((p, q) => p - q); if (!s.length) return null; const h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
  kit.groupBy = (a, f) => a.reduce((m, r) => { const k = f(r); (m[k] = m[k] || []).push(r); return m; }, {});
})();
