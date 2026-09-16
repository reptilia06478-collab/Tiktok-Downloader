/* ============================================================
   Tiv Downloader — tools.js
   Developer: PANN
   ============================================================ */

/* ---------- STATE ---------- */
const toolState = {
  current: 'pomodoro',
  pomodoro: {
    mode: 'focus',
    duration: 25 * 60,
    remaining: 25 * 60,
    running: false,
    interval: null,
    sessions: 0,
    totalMinutes: 0,
    streak: 0
  },
  color: {
    hex: '#3b5bff',
    history: []
  },
  password: {
    length: 16,
    value: ''
  },
  qr: {
    current: null
  },
  unit: {
    category: 'length',
    from: 'm',
    to: 'cm'
  }
};

/* ---------- HELPER ---------- */
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(msg, duration) {
  duration = duration || 2400;
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function fireConfetti() {
  if (typeof window.fireConfetti === 'function' && window.fireConfetti !== fireConfetti) {
    // gunakan versi dari script.js kalau ada
    try { window.fireConfetti(); return; } catch (e) {}
  }
  // fallback
  const colors = ['#3b5bff', '#ef4444', '#ffffff', '#5b7bff', '#f87171'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = '-20px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.width = c.style.height = (6 + Math.random() * 9) + 'px';
    c.style.animationDuration = (1.5 + Math.random() * 1.6) + 's';
    c.style.animationDelay = (Math.random() * 0.35) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}

function playToolSound(type) {
  if (typeof window.playSound === 'function') {
    try { window.playSound(type); } catch (e) {}
  }
}

/* ---------- SWITCH TOOL ---------- */
function switchTool(name) {
  toolState.current = name;
  $$('.tool-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tool === name);
  });
  $$('.tool-panel').forEach(p => {
    p.classList.remove('active');
  });
  const panel = $('tool-' + name);
  if (panel) panel.classList.add('active');
  playToolSound('click');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   TOOL 1: POMODORO TIMER
   ============================================================ */
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function setPomodoroMode(mode) {
  const p = toolState.pomodoro;
  if (p.running) {
    if (!confirm('Timer sedang jalan. Ganti mode?')) return;
  }
  p.mode = mode;
  const durations = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  p.duration = durations[mode] || 25 * 60;
  p.remaining = p.duration;
  p.running = false;
  if (p.interval) clearInterval(p.interval);
  $$('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  const modeEl = $('pomodoroMode');
  if (modeEl) {
    modeEl.textContent = mode === 'focus' ? 'Waktu Fokus' : (mode === 'short' ? 'Istirahat Pendek' : 'Istirahat Panjang');
  }
  const btn = $('pomodoroStart');
  if (btn) btn.textContent = '▶️ Mulai';
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const p = toolState.pomodoro;
  const timeEl = $('pomodoroTime');
  if (timeEl) timeEl.textContent = formatTime(p.remaining);
  const sessEl = $('pomodoroSessions');
  if (sessEl) sessEl.textContent = p.sessions;
  const totEl = $('pomodoroTotal');
  if (totEl) totEl.textContent = p.totalMinutes + 'm';
  const stEl = $('pomodoroStreak');
  if (stEl) stEl.textContent = p.streak;
}

function togglePomodoro() {
  const p = toolState.pomodoro;
  const btn = $('pomodoroStart');
  if (p.running) {
    // pause
    clearInterval(p.interval);
    p.running = false;
    if (btn) btn.textContent = '▶️ Lanjut';
    playToolSound('click');
  } else {
    // start
    p.running = true;
    if (btn) btn.textContent = '⏸️ Jeda';
    playToolSound('click');
    p.interval = setInterval(() => {
      p.remaining--;
      updatePomodoroDisplay();
      if (p.remaining <= 0) {
        clearInterval(p.interval);
        p.running = false;
        if (btn) btn.textContent = '▶️ Mulai';
        // selesai
        if (p.mode === 'focus') {
          p.sessions++;
          p.totalMinutes += 25;
          p.streak++;
        }
        fireConfetti();
        playToolSound('success');
        showToast('⏰ Waktu habis! ' + (p.mode === 'focus' ? 'Waktunya istirahat!' : 'Lanjut fokus!'));
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'); } catch(e){}
        updatePomodoroDisplay();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  const p = toolState.pomodoro;
  clearInterval(p.interval);
  p.running = false;
  p.remaining = p.duration;
  const btn = $('pomodoroStart');
  if (btn) btn.textContent = '▶️ Mulai';
  updatePomodoroDisplay();
  playToolSound('click');
}

/* ============================================================
   TOOL 2: COLOR PICKER
   ============================================================ */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const h = Math.max(0, Math.min(255, x)).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function updateColorUI(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const preview = $('colorPreview');
  if (preview) {
    preview.style.background = hex;
    preview.textContent = hex.toUpperCase();
    // text color based on luminance
    const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    preview.style.color = lum > 0.6 ? '#0a0f1e' : 'white';
  }
  const hexEl = $('colorHex');
  if (hexEl && hexEl.value.toUpperCase() !== hex.toUpperCase()) {
    hexEl.value = hex.toUpperCase();
  }
  const rgbEl = $('colorRgb');
  if (rgbEl) rgbEl.value = rgb.r + ',' + rgb.g + ',' + rgb.b;
  const hslEl = $('colorHsl');
  if (hslEl) hslEl.value = hsl.h + ',' + hsl.s + '%,' + hsl.l + '%';
  const picker = $('colorPicker');
  if (picker) picker.value = hex;
  toolState.color.hex = hex;
}

function updateColorFromPicker(hex) {
  updateColorUI(hex);
}

function updateColorFromHex() {
  let val = $('colorHex').value.trim();
  if (!val.startsWith('#')) val = '#' + val;
  if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
    updateColorUI(val);
  }
}

function randomColor() {
  const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  updateColorUI(hex);
  playToolSound('pop');
}

function copyColor() {
  const hex = toolState.color.hex;
  navigator.clipboard.writeText(hex.toUpperCase())
    .then(() => showToast('🎨 Warna ' + hex.toUpperCase() + ' tersalin!'))
    .catch(() => showToast('❌ Gagal menyalin'));
  playToolSound('success');
}

function saveColorHistory() {
  const hex = toolState.color.hex.toUpperCase();
  const hist = toolState.color.history;
  if (!hist.includes(hex)) {
    hist.unshift(hex);
    if (hist.length > 16) hist.pop();
    renderColorHistory();
    showToast('💾 Warna disimpan!');
  }
}

function renderColorHistory() {
  const el = $('colorHistory');
  if (!el) return;
  el.innerHTML = '';
  toolState.color.history.forEach(hex => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = hex;
    sw.title = hex;
    sw.onclick = () => { updateColorUI(hex); playToolSound('click'); };
    el.appendChild(sw);
  });
}

/* ============================================================
   TOOL 3: PASSWORD GENERATOR
   ============================================================ */
function updatePasswordLength(val) {
  toolState.password.length = parseInt(val);
  const el = $('passwordLengthValue');
  if (el) el.textContent = val;
}

function generatePassword() {
  const opts = {
    upper: $('passUpper') && $('passUpper').checked,
    lower: $('passLower') && $('passLower').checked,
    number: $('passNumber') && $('passNumber').checked,
    symbol: $('passSymbol') && $('passSymbol').checked
  };
  let chars = '';
  if (opts.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.number) chars += '0123456789';
  if (opts.symbol) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) {
    showToast('❌ Pilih minimal 1 jenis karakter');
    return;
  }
  let pass = '';
  const len = toolState.password.length;
  const array = new Uint32Array(len);
  crypto.getRandomValues(array);
  for (let i = 0; i < len; i++) {
    pass += chars[array[i] % chars.length];
  }
  toolState.password.value = pass;
  const out = $('passwordOutput');
  if (out) out.textContent = pass;
  // hitung strength
  let strength = Math.min(100, Math.floor((pass.length / 32) * 60) + (opts.upper ? 10 : 0) + (opts.lower ? 10 : 0) + (opts.number ? 10 : 0) + (opts.symbol ? 10 : 0));
  const bar = $('passwordStrength');
  if (bar) {
    bar.style.width = strength + '%';
    if (strength < 40) bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    else if (strength < 70) bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    else bar.style.background = 'linear-gradient(135deg, #3b5bff, #22c55e)';
  }
  playToolSound('success');
}

function copyPassword() {
  const pass = toolState.password.value;
  if (!pass) {
    showToast('Generate dulu');
    return;
  }
  navigator.clipboard.writeText(pass)
    .then(() => showToast('🔐 Password tersalin!'))
    .catch(() => showToast('❌ Gagal menyalin'));
  playToolSound('success');
}

/* ============================================================
   TOOL 4: QR CODE GENERATOR
   ============================================================ */
function generateQR() {
  const input = $('qrInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) {
    showToast('Masukkan teks atau URL dulu');
    return;
  }
  const size = 400;
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(text);
  const out = $('qrOutput');
  if (out) {
    out.innerHTML = `<img src="${url}" alt="QR Code" crossorigin="anonymous">`;
  }
  toolState.qr.current = url;
  playToolSound('success');
}

function downloadQR() {
  if (!toolState.qr.current) {
    showToast('Generate QR dulu');
    return;
  }
  const a = document.createElement('a');
  a.href = toolState.qr.current;
  a.download = 'tiv-qr-' + Date.now() + '.png';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('⬇️ QR di-download!');
}

/* ============================================================
   TOOL 5: UNIT CONVERTER
   ============================================================ */
const UNIT_DATA = {
  length: {
    name: 'Panjang',
    units: {
      m:  { name: 'Meter', factor: 1 },
      km: { name: 'Kilometer', factor: 1000 },
      cm: { name: 'Sentimeter', factor: 0.01 },
      mm: { name: 'Milimeter', factor: 0.001 },
      mi: { name: 'Mil', factor: 1609.344 },
      yd: { name: 'Yard', factor: 0.9144 },
      ft: { name: 'Kaki', factor: 0.3048 },
      in: { name: 'Inci', factor: 0.0254 }
    }
  },
  weight: {
    name: 'Berat',
    units: {
      kg:  { name: 'Kilogram', factor: 1 },
      g:   { name: 'Gram', factor: 0.001 },
      mg:  { name: 'Miligram', factor: 0.000001 },
      ton: { name: 'Ton', factor: 1000 },
      lb:  { name: 'Pon', factor: 0.453592 },
      oz:  { name: 'Ons', factor: 0.0283495 }
    }
  },
  temp: {
    name: 'Suhu',
    units: {
      c: { name: 'Celsius' },
      f: { name: 'Fahrenheit' },
      k: { name: 'Kelvin' }
    }
  }
};

function setUnitCategory(cat) {
  toolState.unit.category = cat;
  $$('.category-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  const data = UNIT_DATA[cat];
  if (!data) return;
  const fromSel = $('unitFrom');
  const toSel = $('unitTo');
  if (!fromSel || !toSel) return;
  fromSel.innerHTML = '';
  toSel.innerHTML = '';
  Object.keys(data.units).forEach(key => {
    const opt1 = document.createElement('option');
    opt1.value = key;
    opt1.textContent = data.units[key].name + ' (' + key + ')';
    fromSel.appendChild(opt1);
    const opt2 = opt1.cloneNode(true);
    toSel.appendChild(opt2);
  });
  // default pilihan
  if (cat === 'length') { fromSel.value = 'm'; toSel.value = 'cm'; }
  else if (cat === 'weight') { fromSel.value = 'kg'; toSel.value = 'g'; }
  else if (cat === 'temp') { fromSel.value = 'c'; toSel.value = 'f'; }
  toolState.unit.from = fromSel.value;
  toolState.unit.to = toSel.value;
  convertUnit();
}

function convertUnit() {
  const cat = toolState.unit.category;
  const data = UNIT_DATA[cat];
  if (!data) return;
  const from = $('unitFrom').value;
  const to = $('unitTo').value;
  const fromVal = parseFloat($('unitFromValue').value) || 0;
  toolState.unit.from = from;
  toolState.unit.to = to;

  let result = 0;
  if (cat === 'temp') {
    // convert ke celsius dulu
    let c;
    if (from === 'c') c = fromVal;
    else if (from === 'f') c = (fromVal - 32) * 5 / 9;
    else if (from === 'k') c = fromVal - 273.15;
    // convert dari celsius ke target
    if (to === 'c') result = c;
    else if (to === 'f') result = c * 9 / 5 + 32;
    else if (to === 'k') result = c + 273.15;
  } else {
    const f = data.units[from].factor;
    const t = data.units[to].factor;
    result = fromVal * f / t;
  }

  const toEl = $('unitToValue');
  if (toEl) toEl.value = Number(result.toFixed(6));
  const formula = $('unitFormula');
  if (formula) {
    formula.textContent = fromVal + ' ' + from + ' = ' + Number(result.toFixed(6)) + ' ' + to;
  }
}

function swapUnits() {
  const fromSel = $('unitFrom');
  const toSel = $('unitTo');
  if (!fromSel || !toSel) return;
  const tmp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = tmp;
  convertUnit();
  playToolSound('click');
}

/* ============================================================
   TOOL 6: TEXT TOOLS
   ============================================================ */
function analyzeText() {
  const input = $('textInput');
  if (!input) return;
  const text = input.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingMin = Math.ceil(words / 200);
  const setVal = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  setVal('textWords', words);
  setVal('textChars', chars);
  setVal('textLines', lines);
  setVal('textReading', readingMin + 'm');
}

function textUpper() {
  const input = $('textInput');
  if (!input) return;
  input.value = input.value.toUpperCase();
  analyzeText();
  playToolSound('click');
}

function textLower() {
  const input = $('textInput');
  if (!input) return;
  input.value = input.value.toLowerCase();
  analyzeText();
  playToolSound('click');
}

function textTitle() {
  const input = $('textInput');
  if (!input) return;
  input.value = input.value.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
  analyzeText();
  playToolSound('click');
}

function textReverse() {
  const input = $('textInput');
  if (!input) return;
  input.value = input.value.split('').reverse().join('');
  analyzeText();
  playToolSound('click');
}

function textClean() {
  const input = $('textInput');
  if (!input) return;
  input.value = input.value
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  analyzeText();
  playToolSound('click');
}

function copyText() {
  const input = $('textInput');
  if (!input) return;
  navigator.clipboard.writeText(input.value)
    .then(() => showToast('📋 Teks tersalin!'))
    .catch(() => showToast('❌ Gagal menyalin'));
  playToolSound('success');
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Init pomodoro
  setPomodoroMode('focus');

  // Init color
  updateColorUI('#3b5bff');
  // preset colors
  const presets = $('colorPresets');
  if (presets) {
    const colors = [
      '#3b5bff', '#5b7bff', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444', '#f87171',
      '#f59e0b', '#fbbf24', '#10b981', '#22c55e', '#06b6d4', '#0ea5e9', '#64748b', '#0a0f1e'
    ];
    colors.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'color-swatch';
      sw.style.background = c;
      sw.title = c;
      sw.onclick = () => { updateColorUI(c); playToolSound('click'); };
      presets.appendChild(sw);
    });
  }

  // Init password
  generatePassword();

  // Init unit converter
  setUnitCategory('length');

  // Init text analysis
  analyzeText();

  // Show year
  const yr = $('year');
  if (yr) yr.textContent = new Date().getFullYear();
});

/* ---------- EXPOSE ---------- */
window.switchTool = switchTool;
window.setPomodoroMode = setPomodoroMode;
window.togglePomodoro = togglePomodoro;
window.resetPomodoro = resetPomodoro;
window.updateColorFromPicker = updateColorFromPicker;
window.updateColorFromHex = updateColorFromHex;
window.randomColor = randomColor;
window.copyColor = copyColor;
window.saveColorHistory = saveColorHistory;
window.generatePassword = generatePassword;
window.copyPassword = copyPassword;
window.updatePasswordLength = updatePasswordLength;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.setUnitCategory = setUnitCategory;
window.convertUnit = convertUnit;
window.swapUnits = swapUnits;
window.analyzeText = analyzeText;
window.textUpper = textUpper;
window.textLower = textLower;
window.textTitle = textTitle;
window.textReverse = textReverse;
window.textClean = textClean;
window.copyText = copyText;
