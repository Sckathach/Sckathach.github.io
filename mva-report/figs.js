/* figs.js — interactive figures of the HTML report. Data: window.R (data.js: globe, harm Gram) and window.AE
 * (data-ae.js: §4.1, exported by html-lab/agop-eig/export.py), both written by export.py. Ported from html-lab's
 * agop-eig page, relabelled B/W -> Γ/Σ and recoloured with the PDF figures' palette (model: Qwen violet, Llama orange,
 * OLMo cyan). report.js has already numbered figures and filled citations; kit.boot() runs last. */
window.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const D = window.AE, S = D.S, R = window.R;
  const { plot, seg, fmt, tipRow } = kit;
  const f2 = fmt.f(2), f3 = fmt.f(3), s3 = (x) => (x == null ? "–" : String(+(+x).toPrecision(3)));
  const $ = (id) => document.getElementById(id);
  const set = (id, v) => { const n = $(id); if (n) n.textContent = v; };
  const MC = { q27: "var(--c1)", llama8b: "var(--c2)", olmo32b: "var(--c3)" };
  const ML = Object.fromEntries(D.models.map((m) => [m.tag, m.label]));
  const SHORT = { q27: "Qwen 27B", llama8b: "Llama 8B", olmo32b: "OLMo 32B" };
  const TAGS = ["q27", "llama8b", "olmo32b"];
  const pct = (a, lo, hi) => { const s = a.slice().sort((p, q) => p - q); return [s[Math.floor(lo * (s.length - 1))], s[Math.floor(hi * (s.length - 1))]]; };
  const pad = ([a, b], f = 0.08) => { const w = b - a || 1; return [a - f * w, b + f * w]; };
  const withZero = ([a, b]) => [Math.min(a, 0), Math.max(b, 0)];
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // ------------------------------------------------------------------ Figure: harm-type Gram (A7)
  {
    const H = R.harm, svg = $("hm-svg"), sl = $("hm-layer"), rc = $("hm-recluster");
    const k = H.labels.length, LW = 210, cell = 16, W = LW + k * cell + 10, Hh = k * cell + 175;
    svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
    const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const DIV = window.TOKENS.maps.div.map(hex); // the house diverging map: violet (negative), paper, orange (positive)
    const col = (c) => { const p = (Math.max(-1, Math.min(1, c)) + 1) / 2 * (DIV.length - 1), i = Math.min(DIV.length - 2, Math.floor(p)); return `rgb(${mix(DIV[i], DIV[i + 1], p - i)})`; };
    let hover = null;
    function draw() {
      const L = +sl.value, G = H.layers[L].g, o = rc.checked ? H.layers[L].order : H.layers[18].order;
      set("hm-layer-v", `${L} of ${H.n_layers}`);
      let s = "";
      o.forEach((i, r) => {
        o.forEach((j, c) => { s += `<rect x="${LW + c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${col(G[i][j])}" data-i="${i}" data-j="${j}"/>`; });
        s += `<text x="${LW - 6}" y="${r * cell + cell * 0.72}" text-anchor="end" style="font-size:11px;fill:var(--ink-2)">${H.labels[i]}</text>`;
        s += `<text transform="translate(${LW + r * cell + cell * 0.72},${k * cell + 6}) rotate(90)" style="font-size:11px;fill:var(--ink-2)">${H.labels[i]}</text>`;
      });
      svg.innerHTML = s;
      const off = G.flatMap((row, i) => row.filter((_, j) => j !== i));
      $("hm-read").innerHTML = `<div>share of the pair differences on the refusal axis <b>${f2(H.layers[L].share)}</b></div>` +
        `<div>mean off-diagonal cosine <b>${f3(off.reduce((a, b) => a + b, 0) / off.length)}</b></div>` +
        `<div>${hover ? `${hover}` : "hover a cell"}</div>`;
    }
    svg.addEventListener("mousemove", (e) => {
      const t = e.target;
      if (t.tagName !== "rect") return;
      const i = +t.dataset.i, j = +t.dataset.j, G = H.layers[+sl.value].g;
      hover = `<em>${H.labels[i]}</em> × <em>${H.labels[j]}</em> <b class="hl">${f2(G[i][j])}</b>`;
      $("hm-read").lastElementChild.innerHTML = hover;
    });
    sl.addEventListener("input", draw);
    rc.addEventListener("change", draw);
    draw();
  }

  // ------------------------------------------------------------------ Figure: the globe (A6)
  {
    const G = R.globe, cv = $("gl-canvas"), ctx = cv.getContext("2d"), sl = $("gl-layer");
    const N = G.cities.length, CONT = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania"];
    const CC = { Europe: "--orange-5", Africa: "--orange-7", Asia: "--violet-5", Oceania: "--violet-3", "North America": "--cyan-5", "South America": "--pink-5" };
    const rad = Math.PI / 180;
    const truth = G.cities.map(([, , , lat, lon]) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)]);
    const size = G.cities.map((c) => 1.3 + 0.55 * Math.log10(c[5] / 2.5e5 + 1) * 3);
    const norm = (p) => { const n = Math.hypot(p[0], p[1], p[2]) || 1; return [p[0] / n, p[1] / n, p[2] / n]; };
    const pred = (L) => G.layers[L].q.map((q) => norm(q));
    let yaw = 75 * rad, pitch = -20 * rad, layerF = +sl.value, show = "pred", morph = 0, colour = "cont", playing = false, hoverI = -1, lastT = 0, idle = 0;
    let P0 = pred(Math.floor(layerF));
    const posAt = () => {
      const a = Math.floor(layerF), b = Math.min(G.n_layers, a + 1), t = layerF - a;
      const A = G.layers[a].q, B = G.layers[b].q;
      return A.map((qa, i) => {
        const pa = norm(qa), pb = norm(B[i]), p = norm([pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t]);
        const tr = truth[i];
        return norm([p[0] + (tr[0] - p[0]) * morph, p[1] + (tr[1] - p[1]) * morph, p[2] + (tr[2] - p[2]) * morph]);
      });
    };
    const view = (p) => {
      const x1 = p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw), y1 = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw), z1 = p[2];
      const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch), z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
      return [-x1, -z2, y2]; // screen x, screen y (down), depth (toward the viewer)
    };
    const LON = ["orange", "pink", "violet", "cyan", "orange"].map((n) => [1, 3, 5].map((i) => parseInt(window.TOKENS.families[n].mark.slice(i, i + 2), 16)));
    const lonHue = (lon) => { const p = ((lon + 180) % 360) / 90, i = Math.floor(p); return `rgb(${LON[i].map((x, j) => Math.round(x + (LON[i + 1][j] - x) * (p - i)))})`; }; // cyclic: the four marks in a loop
    let screen = [];
    function draw() {
      const W = cv.width, r = W * 0.43, cx = W / 2, cy = W / 2;
      ctx.clearRect(0, 0, W, W);
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, css("--bg"));
      grad.addColorStop(1, css("--bg-2"));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = css("--axis"); ctx.lineWidth = 2; ctx.stroke();
      // graticule, front half only
      ctx.lineWidth = 1.2; ctx.strokeStyle = css("--grid");
      const line = (pts) => { ctx.beginPath(); let on = false; for (const p of pts) { const v = view(p); if (v[2] < 0) { on = false; continue; } const X = cx + r * v[0], Y = cy + r * v[1]; if (on) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); on = true; } ctx.stroke(); };
      for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 73 }, (_, i) => [Math.cos(lat * rad) * Math.cos(i * 5 * rad), Math.cos(lat * rad) * Math.sin(i * 5 * rad), Math.sin(lat * rad)]));
      for (let lon = 0; lon < 360; lon += 30) line(Array.from({ length: 37 }, (_, i) => { const la = (-90 + i * 5) * rad; return [Math.cos(la) * Math.cos(lon * rad), Math.cos(la) * Math.sin(lon * rad), Math.sin(la)]; }));
      const P = posAt();
      screen = P.map((p, i) => { const v = view(p); return { i, x: cx + r * v[0], y: cy + r * v[1], d: v[2] }; }).sort((a, b) => a.d - b.d);
      const colors = Object.fromEntries(CONT.map((c) => [c, css(CC[c])]));
      for (const s of screen) {
        const c = G.cities[s.i], front = s.d >= 0;
        ctx.globalAlpha = front ? 0.92 : 0.16;
        ctx.fillStyle = colour === "cont" ? colors[c[2]] : lonHue(c[4]);
        ctx.beginPath(); ctx.arc(s.x, s.y, size[s.i] * (front ? 2.4 : 1.8), 0, 2 * Math.PI); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (hoverI >= 0) {
        const s = screen.find((q) => q.i === hoverI), c = G.cities[hoverI];
        if (s) {
          ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(s.x, s.y, size[hoverI] * 2.4 + 5, 0, 2 * Math.PI); ctx.stroke();
          const tv = view(truth[hoverI]);
          if (morph < 1 && tv[2] >= 0) { // where it really is
            ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(cx + r * tv[0], cy + r * tv[1]); ctx.stroke(); ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(cx + r * tv[0], cy + r * tv[1], 5, 0, 2 * Math.PI); ctx.stroke();
          }
          ctx.font = `600 ${W * 0.026}px ${css("--font")}`;
          ctx.fillStyle = css("--ink");
          ctx.fillText(`${c[0]}, ${c[1]}`, Math.min(s.x + 12, W - W * 0.3), s.y - 12);
        }
      }
    }
    function readout() {
      const L = Math.round(layerF), o = G.layers[L];
      set("gl-layer-v", `${L} of ${G.n_layers}`);
      let city = "";
      if (hoverI >= 0) {
        const c = G.cities[hoverI], p = norm(G.layers[L].q[hoverI]), t = truth[hoverI];
        const km = Math.acos(Math.max(-1, Math.min(1, p[0] * t[0] + p[1] * t[1] + p[2] * t[2]))) * 6371;
        city = `<div><em>${c[0]}</em> (${c[1]}), pop. ${(c[5] / 1e6).toFixed(1)}M: placed <b class="hl">${Math.round(km)} km</b> away</div>`;
      }
      $("gl-read").innerHTML = `<div>held-out $R^2$ <b class="hl">${f2(o.r2)}</b></div><div>median error <b>${Math.round(o.km)} km</b></div><div>shuffled positions $R^2$ <b>${f2(o.null_r2)}</b></div>${city}`;
      if (window.renderMathInElement) renderMathInElement($("gl-read"), { delimiters: [{ left: "$", right: "$", display: false }], throwOnError: false });
    }
    const depthChart = plot("#c-globe-depth", () => ({
      height: 220, x: { domain: [0, G.n_layers], label: "layer" }, y: { domain: [-0.05, 1], label: "held-out R²" },
      marks: [
        { type: "rule", x: Math.round(layerF), color: "var(--muted)" },
        { type: "line", key: "r2", color: "var(--c1)", data: G.layers.map((o, L) => ({ x: L, y: o.r2, km: o.km })), tip: (d) => `layer ${d.x}${tipRow("var(--c1)", "R²", f2(d.y))}${tipRow("var(--c1)", "median error", Math.round(d.km) + " km")}` },
        { type: "line", key: "null", color: "var(--muted)", dash: "2 4", data: G.layers.map((o, L) => ({ x: L, y: o.null_r2 })) },
      ],
      legend: [{ key: "r2", label: "probe", color: "var(--c1)" }, { key: "null", label: "shuffled positions", color: "var(--muted)", dash: "2 3" }],
    }));
    $("gl-legend").innerHTML = CONT.map((c) => `<span class="it"><span class="sw" style="background:var(${CC[c]});border-radius:50%"></span>${c}</span>`).join("");
    const update = () => { readout(); depthChart.render(); };
    // interaction: drag to rotate, hover for a city
    let drag = null;
    const toCanvas = (e) => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height]; };
    cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; cv.setPointerCapture(e.pointerId); idle = 0; });
    cv.addEventListener("pointermove", (e) => {
      if (drag) { yaw = drag.yaw - (e.clientX - drag.x) * 0.008; pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008)); idle = 0; return; }
      const [x, y] = toCanvas(e);
      let best = -1, bd = 14 ** 2;
      for (const s of screen) if (s.d >= 0) { const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; best = s.i; } }
      if (best !== hoverI) { hoverI = best; readout(); }
    });
    cv.addEventListener("pointerup", () => { drag = null; });
    cv.addEventListener("pointerleave", () => { hoverI = -1; readout(); });
    sl.addEventListener("input", () => { layerF = +sl.value; playing = false; $("gl-play").textContent = "▶ play the layers"; update(); });
    $("gl-play").addEventListener("click", () => {
      playing = !playing;
      if (playing && layerF >= G.n_layers) layerF = 0;
      $("gl-play").textContent = playing ? "❚❚ pause" : "▶ play the layers";
    });
    seg("#gl-show", [["pred", "probe positions"], ["true", "true positions"]], show, (v) => { show = v; });
    seg("#gl-colour", [["cont", "by continent"], ["lon", "by longitude"]], colour, (v) => { colour = v; });
    function frame(t) {
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t; idle += dt;
      if (!drag && idle > 2) yaw += dt * 0.25; // slow spin when left alone
      if (playing) {
        layerF = Math.min(G.n_layers, layerF + dt * 2.2);
        if (Math.round(layerF) !== +sl.value) { sl.value = Math.round(layerF); update(); }
        if (layerF >= G.n_layers) { playing = false; $("gl-play").textContent = "▶ play the layers"; }
      }
      const target = show === "true" ? 1 : 0;
      morph += (target - morph) * Math.min(1, dt * 4);
      draw();
      requestAnimationFrame(frame);
    }
    update();
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ Table: full ASR results
  {
    const rows = [
      ["Qwen2.5 7B", "Vanilla", "0.01 ± 0.05", "–", "–", "–"], ["", "DIM", "–", "0.65 ± 0.01", "–", "–"], ["", "RCO", "–", "0.67 ± 0.05", "0.72 ± 0.05", "0.72 ± 0.05"], ["", "Clusters", "–", "0.62 ± 0.05", "0.74 ± 0.04", "0.74 ± 0.04"], ["", "RFM AGOP", "–", "*0.77 ± 0.05", "*0.75 ± 0.05", "*0.96 ± 0.05"],
      ["Qwen3 1.7B", "Vanilla", "0.20 ± 0.02", "–", "–", "–"], ["", "DIM", "–", "*0.80 ± 0.01", "–", "–"], ["", "RCO", "–", "0.76 ± 0.01", "0.78 ± 0.02", "0.79 ± 0.01"], ["", "Clusters", "–", "0.75 ± 0.07", "*0.79 ± 0.06", "0.79 ± 0.06"], ["", "RFM AGOP", "–", "0.73 ± 0.03", "0.72 ± 0.02", "*0.94 ± 0.04"],
      ["Qwen3 4B", "Vanilla", "0.02 ± 0.01", "–", "–", "–"], ["", "DIM", "–", "0.51 ± 0.02", "–", "–"], ["", "RCO", "–", "0.52 ± 0.01", "0.56 ± 0.02", "0.56 ± 0.02"], ["", "Clusters", "–", "0.45 ± 0.07", "0.63 ± 0.05", "0.91 ± 0.01"], ["", "RFM AGOP", "–", "*0.52 ± 0.02", "*0.83 ± 0.05", "*0.92 ± 0.00"],
      ["Qwen3 8B", "Vanilla", "0.00 ± 0.00", "–", "–", "–"], ["", "DIM", "–", "0.07 ± 0.05", "–", "–"], ["", "RCO", "–", "*0.23 ± 0.02", "0.28 ± 0.02", "0.34 ± 0.05"], ["", "Clusters", "–", "0.02 ± 0.02", "0.22 ± 0.04", "0.37 ± 0.05"], ["", "RFM AGOP", "–", "0.20 ± 0.04", "*0.62 ± 0.01", "*0.73 ± 0.03"],
      ["Qwen3 14B", "Vanilla", "0.00 ± 0.01", "–", "–", "–"], ["", "DIM", "–", "*0.06 ± 0.01", "–", "–"], ["", "Clusters", "–", "0 ± 0.0", "0.09 ± 0.04", "0.12 ± 0.02"], ["", "RFM AGOP", "–", "*0.06 ± 0.01", "*0.17 ± 0.01", "*0.19 ± 0.04"],
    ];
    $("tab-full-t").innerHTML = "<tr><th>model</th><th class='l'>method</th><th>k = 0</th><th>1</th><th>3</th><th>5</th></tr>" +
      rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 1 ? " class='l'" : ""}>${c.startsWith("*") ? `<b>${c.slice(1)}</b>` : c}</td>`).join("")}</tr>`).join("");
  }

  // ------------------------------------------------------------------ Figure: the toy (draggable)
  {
    const svg = $("toy-svg"), slider = $("toy-s");
    const init = { a: [1, 2], b: [2, 1], g: [2.5, -0.6] };
    let P = JSON.parse(JSON.stringify(init));
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1], nrm = (p) => Math.hypot(p[0], p[1]);
    const cos = (p, q) => Math.abs(dot(p, q)) / (nrm(p) * nrm(q) || 1);
    function eig2(m11, m12, m22) {
      const tr = m11 + m22, h = Math.sqrt(((m11 - m22) / 2) ** 2 + m12 * m12), l1 = tr / 2 + h, l2 = tr / 2 - h;
      let u = Math.abs(m12) > 1e-12 ? [m12, l1 - m11] : m11 >= m22 ? [1, 0] : [0, 1];
      const n = nrm(u); u = [u[0] / n, u[1] / n];
      return { l1, l2, u1: u, u2: [-u[1], u[0]] };
    }
    const arrow = (p, col, w, dash, label, lx = 0.08, ly = 0.08) => {
      const [x, y] = [p[0], -p[1]], L = Math.hypot(x, y) || 1, ux = x / L, uy = y / L, hl = 0.16, hw = 0.075;
      const bx = x - ux * hl, by = y - uy * hl;
      return `<line x1="0" y1="0" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" ${dash ? 'stroke-dasharray="0.08 0.06"' : ""}/>
        <path d="M${x},${y}L${bx - uy * hw},${by + ux * hw}L${bx + uy * hw},${by - ux * hw}Z" fill="${col}"/>
        ${label ? `<text x="${x + lx}" y="${y + ly}" style="font-size:0.17px;fill:${col}">${label}</text>` : ""}`;
    };
    function draw() {
      const s = +slider.value, { a, b, g } = P;
      set("toy-s-v", s ? Math.round(s * 100) + "% of the trace" : "none");
      const T = (dot(a, a) + dot(b, b)) / 2, h = s > 0 ? (s * T) / ((1 - s) * dot(g, g)) : 0;
      const m11 = (a[0] * a[0] + b[0] * b[0]) / 2 + h * g[0] * g[0], m12 = (a[0] * a[1] + b[0] * b[1]) / 2 + h * g[0] * g[1], m22 = (a[1] * a[1] + b[1] * b[1]) / 2 + h * g[1] * g[1];
      const E = eig2(m11, m12, m22), sum = [a[0] + b[0], a[1] + b[1]], diff = [a[0] - b[0], a[1] - b[1]];
      const u1 = dot(E.u1, sum) < 0 ? [-E.u1[0], -E.u1[1]] : E.u1, u2 = dot(E.u2, diff) < 0 ? [-E.u2[0], -E.u2[1]] : E.u2;
      const r1 = Math.sqrt(E.l1), r2 = Math.sqrt(Math.max(E.l2, 0)), v = [sum[0] / 2, sum[1] / 2];
      let html = "";
      for (let t = -1; t <= 3; t++) html += `<line x1="${t}" y1="-3.1" x2="${t}" y2="1.6" stroke="var(--grid)" stroke-width="0.012"/><line x1="-1.6" y1="${-t}" x2="3.1" y2="${-t}" stroke="var(--grid)" stroke-width="0.012"/>`;
      html += `<line x1="-1.6" y1="0" x2="3.1" y2="0" stroke="var(--axis)" stroke-width="0.016"/><line x1="0" y1="-3.1" x2="0" y2="1.6" stroke="var(--axis)" stroke-width="0.016"/>`;
      html += arrow(a, "var(--muted)", 0.03, true, "a", -0.2, -0.04) + arrow(b, "var(--muted)", 0.03, true, "b", 0.08, 0.14);
      if (s > 0) html += arrow(g, "var(--c3)", 0.03, true, "g_hub", -0.55, 0.3);
      html += arrow([u1[0] * r1, u1[1] * r1], "var(--c1)", 0.045, false, "u₁", 0.06, -0.06);
      html += arrow([u2[0] * r2, u2[1] * r2], "var(--c2)", 0.045, false, "u₂", 0.06, -0.06);
      html += arrow(v, "var(--ink)", 0.03, false, "v", 0.1, 0.12);
      for (const [k, p, c] of [["a", a, "var(--muted)"], ["b", b, "var(--muted)"], ...(s > 0 ? [["g", g, "var(--c3)"]] : [])])
        html += `<circle class="handle" data-k="${k}" cx="${p[0]}" cy="${-p[1]}" r="0.11" fill="var(--bg)" stroke="${c}" stroke-width="0.03"/>`;
      svg.innerHTML = html;
      set("toy-lam", `${f2(E.l1)}, ${f2(E.l2)}`);
      set("toy-c1", f3(cos(u1, sum)));
      set("toy-c2", f3(cos(u2, diff)));
      set("toy-ch", s > 0 ? f3(cos(u1, g)) : "–");
    }
    let drag = null;
    const at = (ev) => { const r = svg.getBoundingClientRect(); const x = -1.6 + ((ev.clientX - r.left) / r.width) * 4.7, y = -3.1 + ((ev.clientY - r.top) / r.height) * 4.7; return [Math.max(-1.5, Math.min(3, x)), Math.max(-1.5, Math.min(3, -y))]; };
    svg.addEventListener("pointerdown", (e) => {
      const p = at(e), keys = ["a", "b"].concat(+slider.value > 0 ? ["g"] : []);
      let best = null, bd = 0.35 ** 2;
      for (const k of keys) { const d = (P[k][0] - p[0]) ** 2 + (P[k][1] - p[1]) ** 2; if (d < bd) { bd = d; best = k; } }
      if (best) { drag = best; svg.setPointerCapture(e.pointerId); e.preventDefault(); }
    });
    svg.addEventListener("pointermove", (e) => { if (!drag) return; P[drag] = at(e); draw(); });
    svg.addEventListener("pointerup", () => { drag = null; });
    slider.addEventListener("input", draw);
    $("toy-reset").addEventListener("click", () => { P = JSON.parse(JSON.stringify(init)); slider.value = 0; draw(); });
    draw();
  }

  // ------------------------------------------------------------------ Figure: hub share
  plot("#c-hubs", () => ({
    height: 240, x: { domain: [0, 1], label: "relative depth" }, y: { domain: [0, 1], label: "share of raw tr M, top 1%" },
    marks: [{ type: "rule", y: 0.01, dash: "4 4" },
      ...TAGS.map((t) => ({ type: "line", key: t, color: MC[t], endLabel: SHORT[t], data: D.depth[t].map((r) => ({ x: r.x, y: r.hub ?? null, L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}${tipRow(MC[t], "top 1% share", f2(d.y))}` }))],
    legend: TAGS.map((t) => ({ key: t, label: ML[t], color: MC[t] })), margin: { r: 70 },
  }));

  // ------------------------------------------------------------------ Figure: three senses of water
  {
    const KC = { nature: "var(--c3)", beverage: "var(--c2)", utility: "var(--c1)" };
    const KL = { nature: "nature", beverage: "drunk", utility: "used" };
    const DEF = { llama8b: "20", olmo32b: "28" };
    let tag = "llama8b", plane = "23", est = "norm";
    const layers = (t) => Object.keys(D.water[t].layers).sort((p, q) => p - q);
    const sl = $("wa-layer");
    const resetLayer = () => { const Ls = layers(tag); sl.max = Ls.length - 1; sl.value = Math.max(0, Ls.indexOf(DEF[tag])); };
    resetLayer();
    const chart = plot("#c-water", () => {
      const W = D.water[tag], L = layers(tag)[+sl.value], c = W.layers[L][est];
      const [i, j] = plane === "12" ? [0, 1] : [1, 2], k = c.s / 1000;
      const xs = c.q.map((p) => p[i] * k), ys = c.q.map((p) => p[j] * k);
      const dom = (v, ext) => withZero(pad(est === "raw" ? pct(v, 0.01, 0.99) : [Math.min(...v, ...ext), Math.max(...v, ...ext)]));
      const ext = c.means.map((m) => m[i]).concat(plane === "12" ? [c.v[i]] : []), exty = c.means.map((m) => m[j]).concat(plane === "12" ? [c.v[j]] : []);
      const marks = W.kinds.map((kn, ci) => ({ type: "cloud", key: kn, color: KC[kn], r: 1.8, opacity: 0.5, data: c.q.flatMap((p, n) => (W.kind[n] === ci ? [{ x: p[i] * k, y: p[j] * k }] : [])) }));
      marks.push({ type: "rule", x: 0, opacity: 0.4 }, { type: "rule", y: 0, opacity: 0.4 });
      W.kinds.forEach((kn, ci) => marks.push({ type: "arrow", key: kn, color: KC[kn], width: 2.6, x1: c.means[ci][i], y1: c.means[ci][j], tip: `${KL[kn]}: mean gradient` }));
      if (plane === "12") marks.push({ type: "arrow", color: "var(--ink)", width: 1.6, x1: c.v[i], y1: c.v[j], text: "v (lens)", tip: "the lens row v, the average of the three means" });
      const ax = ["u₁", "u₂", "u₃"];
      return { height: 360, x: { domain: dom(xs, ext), label: `⟨g, ${ax[i]}⟩`, grid: true }, y: { domain: dom(ys, exty), label: `⟨g, ${ax[j]}⟩` }, marks,
        legend: W.kinds.map((kn, ci) => ({ key: kn, label: `${KL[kn]} (${W.kind.filter((x) => x === ci).length})`, color: KC[kn], shape: "dot" })) };
    });
    function update() {
      const L = layers(tag)[+sl.value], row = D.water[tag].curves.find((r) => String(r.L) === L)[`tok_next|${est}`];
      set("wa-layer-v", `${L} of ${D.models.find((m) => m.tag === tag).n_layers}`);
      set("wa-cap", f2(row.cap)); set("wa-cen", f2(row.cen)); set("wa-km", f2(row.km)); set("wa-top", (row.top * 100).toFixed(1) + "%");
      chart.render();
    }
    seg("#wa-model", [["llama8b", "Llama-3.1-8B"], ["olmo32b", "OLMo-3-32B"]], tag, (v) => { tag = v; resetLayer(); update(); });
    seg("#wa-plane", [["12", "(u₁, u₂)"], ["23", "(u₂, u₃)"]], plane, (v) => { plane = v; update(); });
    seg("#wa-est", [["norm", "normalised"], ["raw", "raw"]], est, (v) => { est = v; update(); });
    sl.addEventListener("input", update);
    update();
  }

  // ------------------------------------------------------------------ Figure: water against depth
  {
    let metric = "cap";
    const NAMES = { cap: "share of the between-senses plane in (u₂, u₃)", x1: "x₁ = λ₁(between) / λ₁(within, off the lens)", cen: "sense decoded from (u₂, u₃), nearest centroid" };
    const p = plot("#c-water-depth", () => {
      const marks = [];
      for (const t of ["llama8b", "olmo32b"]) {
        const C = D.water[t].curves;
        marks.push({ type: "line", key: t, color: MC[t], endLabel: SHORT[t], data: C.map((r) => ({ x: r.x, y: r["tok_next|norm"][metric], L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}, next-token${tipRow(MC[t], metric, f2(d.y))}` });
        marks.push({ type: "line", key: t, color: MC[t], dash: "6 4", width: 1.6, data: C.map((r) => ({ x: r.x, y: r["tok|norm"][metric], L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}, summed future${tipRow(MC[t], metric, f2(d.y))}` });
        if (metric === "x1") marks.push({ type: "line", key: t, color: MC[t], dash: "1 4", width: 1.6, data: C.map((r) => ({ x: r.x, y: r["tok_next|norm"].null, L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}${tipRow(MC[t], "null (max of 200)", f3(d.y))}` });
      }
      if (metric === "x1") marks.unshift({ type: "rule", y: 1, text: "x = 1" });
      if (metric === "cen") marks.unshift({ type: "rule", y: 0.337, dash: "4 4", text: "chance" });
      return { height: 260, margin: { r: 80 }, x: { domain: [0, 1], label: "relative depth" },
        y: metric === "x1" ? { type: "log", domain: [0.01, 2], label: NAMES.x1 } : { domain: [0, 1], label: NAMES[metric] }, marks,
        legend: [{ key: "llama8b", label: ML.llama8b, color: MC.llama8b }, { key: "olmo32b", label: ML.olmo32b, color: MC.olmo32b },
          { label: "next-token logit", color: "var(--ink-2)" }, { label: "summed future (J-lens)", color: "var(--ink-2)", shape: "dash" }] };
    });
    seg("#wd-metric", [["cap", "plane held"], ["x1", "ratio x₁"], ["cen", "sense decoded"]], metric, (v) => { metric = v; p.render(); });
  }

  // ------------------------------------------------------------------ Figure: one output in natural text
  {
    const INST = Object.keys(D.kinds);
    let inst = INST[0], est = "norm";
    const name = (k) => { const o = D.kinds[k]; return `${SHORT[o.tag]}, "${o.token === "\n" ? "\\n" : o.token}", layer ${o.layer}`; };
    const chart = plot("#c-kinds", () => {
      const o = D.kinds[inst], c = o[est], k = c.s / 1000;
      const xs = c.q.map((p) => p[0] * k), ys = c.q.map((p) => p[1] * k);
      const vec = [c.v, c.a, c.b];
      const dom = (v, e) => withZero(pad(est === "raw" ? pct(v, 0.01, 0.99) : [Math.min(...v, ...e), Math.max(...v, ...e)]));
      const nA = o.kind.filter((x) => x).length;
      return { height: 340, x: { domain: dom(xs, vec.map((q) => q[0])), label: "⟨g, u₁⟩", grid: true }, y: { domain: dom(ys, vec.map((q) => q[1])), label: "⟨g, u₂⟩" },
        marks: [
          { type: "cloud", key: "b", color: "var(--c2)", r: 1.7, opacity: 0.45, data: c.q.flatMap((p, n) => (o.kind[n] ? [] : [{ x: p[0] * k, y: p[1] * k }])) },
          { type: "cloud", key: "a", color: "var(--c4)", r: 1.9, opacity: 0.6, data: c.q.flatMap((p, n) => (o.kind[n] ? [{ x: p[0] * k, y: p[1] * k }] : [])) },
          { type: "rule", x: 0, opacity: 0.4 }, { type: "rule", y: 0, opacity: 0.4 },
          { type: "arrow", key: "b", color: "var(--violet-7)", width: 2.6, x1: c.b[0], y1: c.b[1], text: "b", dy: 14 },
          { type: "arrow", key: "a", color: "var(--cyan-7)", width: 2.6, x1: c.a[0], y1: c.a[1], text: "a" },
          { type: "arrow", color: "var(--ink)", width: 1.4, x1: c.v[0], y1: c.v[1], text: "v (lens)", dy: -6 },
        ],
        legend: [{ key: "a", label: `after punctuation (${nA})`, color: "var(--c4)", shape: "dot" }, { key: "b", label: `other (${o.kind.length - nA})`, color: "var(--c2)", shape: "dot" }] };
    });
    function update() { const c = D.kinds[inst][est]; set("ki-eta", f2(c.eta2)); set("ki-c1", f2(c.cos_u1_lens)); set("ki-c2", f2(c.cos_u2_diff)); chart.render(); }
    seg("#ki-inst", INST.map((k) => [k, name(k)]), inst, (v) => { inst = v; update(); });
    seg("#ki-est", [["norm", "normalised"], ["raw", "raw"]], est, (v) => { est = v; update(); });
    update();
  }

  // ------------------------------------------------------------------ Figure: the ratio over the whole search
  {
    let tag = "q27", est = "norm";
    const edges = Array.from({ length: 25 }, (_, i) => Math.pow(10, -4 + (6 * i) / 24));
    const p = plot("#c-rule", () => {
      const o = D.rule[tag][est], pts = o.pts.map(([x, y]) => ({ x: Math.min(Math.max(x, 1e-4), 100), y }));
      const med = [];
      for (let i = 1; i < edges.length; i++) {
        const ys = pts.filter((q) => q.x >= edges[i - 1] && q.x < edges[i]).map((q) => q.y);
        if (ys.length >= 20) med.push({ x: Math.sqrt(edges[i - 1] * edges[i]), y: kit.median(ys), n: ys.length });
      }
      const above = pts.filter((q) => q.x > 1).length;
      return { height: 320, x: { type: "log", domain: [1e-4, 100], label: `ratio x  (${above} of ${pts.length} points above 1)` }, y: { domain: [0, 1.02], label: "|cos(u₂, a − b)|" },
        marks: [
          { type: "cloud", color: "var(--muted)", r: 1.3, opacity: 0.22, data: pts },
          { type: "rule", x: 1 }, { type: "rule", x: 0.5, dash: "2 3" },
          { type: "line", key: "med", color: MC[tag], width: 2.6, data: med, tip: (d) => `x ≈ ${s3(d.x)}${tipRow(MC[tag], `median of ${d.n}`, f2(d.y))}` },
          { type: "dot", key: "picked", shape: "hollow", color: "var(--pink-7)", r: 7, data: o.picked.map((q) => ({ ...q, label: `"${q.tok === "\n" ? "\\n" : q.tok}" L${q.L}` })), tip: (d) => `hand-picked instance, layer ${d.L}${tipRow("var(--pink-7)", "x", s3(d.x))}` },
        ],
        legend: [{ key: "med", label: "median over the search", color: MC[tag] }, { key: "picked", label: "instances shown above", color: "var(--pink-7)", shape: "hollow" }] };
    });
    seg("#ru-model", [["q27", ML.q27], ["olmo32b", ML.olmo32b]], tag, (v) => { tag = v; p.render(); });
    seg("#ru-est", [["norm", "normalised"], ["raw", "raw"]], est, (v) => { est = v; p.render(); });
  }

  // ------------------------------------------------------------------ Figures: depth (rho, split, switch)
  const depthLines = (get, label, estimators = ["norm", "raw"]) => TAGS.flatMap((t) => estimators.map((e) => ({
    type: "line", key: t, color: MC[t], dash: e === "raw" ? "6 4" : null, width: e === "raw" ? 1.6 : 2.6, endLabel: e === "norm" ? SHORT[t] : null,
    data: D.depth[t].map((r) => ({ x: r.x, y: get(r, e), L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}, ${e === "norm" ? "normalised" : "raw"}${tipRow(MC[t], label, s3(d.y))}`,
  })));
  const estLegend = [{ label: "normalised", color: "var(--ink-2)" }, { label: "raw", color: "var(--ink-2)", shape: "dash" }];
  plot("#c-depth-rho", () => ({ height: 260, margin: { r: 80 }, x: { domain: [0, 1], label: "relative depth" }, y: { domain: [0, 1], label: "ρ = tr Γ / tr M" },
    marks: depthLines((r, e) => r[e].rho, "ρ"), legend: TAGS.map((t) => ({ key: t, label: ML[t], color: MC[t] })).concat(estLegend) }));
  {
    let est = "norm";
    const p = plot("#c-depth-split", () => {
      const marks = [];
      for (const t of TAGS) {
        const Rw = D.depth[t];
        marks.push({ type: "line", key: t, color: MC[t], endLabel: SHORT[t], data: Rw.map((r) => ({ x: r.x, y: r[est].ratio * r[est].lw, L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}${tipRow(MC[t], "λ₁(Γ) / tr M", s3(d.y))}` });
        marks.push({ type: "line", key: t, color: MC[t], dash: "1 4", width: 2.2, data: Rw.map((r) => ({ x: r.x, y: r[est].lw, L: r.L })), tip: (d) => `${ML[t]}, layer ${d.L}${tipRow(MC[t], "λ₁(Σ) / tr M", s3(d.y))}` });
      }
      return { height: 290, margin: { r: 80 }, x: { domain: [0, 1], label: "relative depth" }, y: { type: "log", domain: [1e-4, 1.5], label: "share of tr M (log)" }, marks,
        legend: TAGS.map((t) => ({ key: t, label: ML[t], color: MC[t] })).concat([{ label: "λ₁(Γ), the mean", color: "var(--ink-2)" }, { label: "λ₁(Σ), the fluctuation", color: "var(--ink-2)", dash: "1 3" }]) };
    });
    seg("#ds-est", [["norm", "hub-normalised"], ["raw", "raw"]], est, (v) => { est = v; p.render(); });
  }
  {
    let metric = "ratio";
    const p = plot("#c-depth-switch", () => {
      const ratio = metric === "ratio";
      const marks = ratio ? [{ type: "rule", y: 1 }, { type: "rule", y: 0.5, dash: "2 3" }] : [];
      marks.push(...depthLines(ratio ? (r, e) => r[e].ratio : (r, e) => Math.sqrt(Math.max(0, 1 - r[e].sin ** 2)), ratio ? "λ₁(Γ) / λ₁(Σ)" : "|cos(u₁(M), u₁(Γ))|"));
      return { height: 280, margin: { r: 80 }, x: { domain: [0, 1], label: "relative depth" },
        y: ratio ? { type: "log", domain: [0.002, 2000], label: "λ₁(Γ) / λ₁(Σ)" } : { domain: [0, 1.02], label: "|cos(u₁(M), u₁(Γ))|" }, marks,
        legend: TAGS.map((t) => ({ key: t, label: ML[t], color: MC[t] })).concat(estLegend) };
    });
    seg("#dw-metric", [["ratio", "λ₁(Γ) / λ₁(Σ)"], ["cos", "u₁ is the lens's axis"]], metric, (v) => { metric = v; p.render(); });
  }

  // ------------------------------------------------------------------ Figure: 20 nouns
  {
    const DEF = { q27: "48", llama8b: "24", olmo32b: "48" };
    let tag = "q27";
    const sl = $("no-layer");
    const Ls = (t) => Object.keys(D.nouns[t]).sort((p, q) => p - q);
    const resetLayer = () => { sl.max = Ls(tag).length - 1; sl.value = Math.max(0, Ls(tag).indexOf(DEF[tag])); };
    resetLayer();
    const chart = plot("#c-nouns", () => {
      const L = Ls(tag)[+sl.value], ax = D.nouns[tag][L], words = Object.keys(ax[0].load);
      const l1max = Math.max(...words.map((w) => Math.abs(ax[0].load[w])));
      const data = words.map((w) => ({ x: ax[1].load[w], y: ax[2].load[w], r: 3 + 7 * Math.abs(ax[0].load[w]) / l1max, label: w, l1: ax[0].load[w] }));
      const xs = data.map((d) => d.x), ys = data.map((d) => d.y);
      return { height: 380, margin: { r: 40 }, x: { domain: withZero(pad([Math.min(...xs), Math.max(...xs)], 0.12)), label: `loading on u₂ (${Math.round(100 * ax[1].mp)}% of λ₂ from the lens)`, fmt: f2, grid: true },
        y: { domain: withZero(pad([Math.min(...ys), Math.max(...ys)], 0.1)), label: `loading on u₃ (${Math.round(100 * ax[2].mp)}% of λ₃ from the lens)`, fmt: f2 },
        marks: [{ type: "rule", x: 0, opacity: 0.4 }, { type: "rule", y: 0, opacity: 0.4 },
          { type: "dot", color: MC[tag], data, tip: (d) => `<b>${d.label}</b>${tipRow(MC[tag], "u₁", f3(d.l1))}${tipRow(MC[tag], "u₂", f3(d.x))}${tipRow(MC[tag], "u₃", f3(d.y))}` }],
        legend: [] };
    });
    const update = () => { set("no-layer-v", `${Ls(tag)[+sl.value]} of ${D.models.find((m) => m.tag === tag).n_layers}`); chart.render(); };
    seg("#no-model", TAGS.map((t) => [t, ML[t]]), tag, (v) => { tag = v; resetLayer(); update(); });
    sl.addEventListener("input", update);
    update();
  }

  // ------------------------------------------------------------------ Figure: 281 words
  {
    let tag = "q27";
    const p = plot("#c-lex", () => {
      const o = D.lex[tag], Rw = o.rows, c = MC[tag];
      const line = (key, label, col, extra) => ({ type: "line", key, color: col, data: Rw.map((r) => ({ x: r.x, y: r[key], L: r.L })), tip: (d) => `${ML[tag]}, layer ${d.L}${tipRow(col, label, f2(d.y))}`, ...extra });
      return { height: 270, x: { domain: [0.3, 1], label: "relative depth" }, y: { domain: [0, 1], label: "1-NN category accuracy" },
        marks: [{ type: "rule", key: "U", y: o.U, dash: "4 4", color: "var(--ink-2)", text: "unembedding" },
          line("rand20", "random 20 of the lens", "var(--muted)", { dash: "1 4", width: 2 }),
          line("V_full", "all lens rows", "var(--ink)", { dash: "6 4", width: 1.6 }),
          line("B_top20", "Γ top 20", c, { dash: "6 4", width: 1.6 }),
          line("M_top20", "AGOP top 20", c, { points: true, width: 2.6 })],
        legend: [{ key: "M_top20", label: "AGOP top 20", color: c }, { key: "B_top20", label: "Γ top 20", color: c, shape: "dash" }, { key: "V_full", label: "all lens rows", color: "var(--ink)", shape: "dash" },
          { key: "rand20", label: "random 20 of the lens", color: "var(--muted)", dash: "1 3" }, { key: "U", label: "unembedding", color: "var(--ink-2)", dash: "4 3" }] };
    });
    seg("#lx-model", TAGS.map((t) => [t, ML[t]]), tag, (v) => { tag = v; p.render(); });
  }

  kit.boot({});
});
