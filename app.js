// Stillpoint — app logic
(function(){

const STORAGE_KEY = "stillpoint_sessions_v1";
const SETTINGS_KEY = "stillpoint_settings_v1";

let state = {
  currentTab: "calm",
  currentView: "library",
  activeSession: null,
  activeLength: null,
  practice: {
    running: false,
    paused: false,
    totalSeconds: 0,
    remaining: 0,
    phaseIdx: 0,       // 0 inhale,1 holdIn,2 exhale,3 holdOut
    phaseElapsed: 0,
    cycleCount: 0,
    guideIdx: 0,
    timerHandle: null,
    guideHandle: null,
    startedAt: null
  }
};

let settings = loadSettings();
let history = loadHistory();

function loadSettings(){
  try{ return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { bell:true, voice:true, sheetsUrl:"", sheetsReadUrl:"" }; }
  catch(e){ return { bell:true, voice:true, sheetsUrl:"", sheetsReadUrl:"" }; }
}
function saveSettingsToStorage(){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function loadHistory(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveHistory(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }

// ---------- Rendering: library ----------
function renderLibrary(){
  const list = document.getElementById("session-list");
  const items = SESSIONS.filter(s => s.category === state.currentTab);
  if(items.length === 0){
    list.innerHTML = `<div class="empty-state"><p>No sessions in this category yet.</p></div>`;
    return;
  }
  list.innerHTML = items.map(s => `
    <div class="session-card" onclick="STILLPOINT.openDetail('${s.id}')">
      <div class="info">
        <h3>${s.title}</h3>
        <p>${s.subtitle}</p>
        <div class="meta">
          <span class="pill">${s.pattern.inhale}-${s.pattern.holdIn}-${s.pattern.exhale}-${s.pattern.holdOut}</span>
          <span class="pill">${s.lengths[0]}–${s.lengths[s.lengths.length-1]} min</span>
        </div>
      </div>
      <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join("");
}

// ---------- Detail sheet ----------
function openDetail(id){
  const s = SESSIONS.find(x => x.id === id);
  if(!s) return;
  state.activeSession = s;
  state.activeLength = s.lengths[Math.floor(s.lengths.length/2)];
  const sheet = document.getElementById("detail-sheet");
  sheet.innerHTML = `
    <div class="detail-header">
      <h2>${s.title}</h2>
      <p>${s.description}</p>
    </div>
    <div class="pattern-visual">
      <div class="seg"><b>${s.pattern.inhale}s</b>inhale</div>
      <span class="pattern-arrow">→</span>
      ${s.pattern.holdIn > 0 ? `<div class="seg"><b>${s.pattern.holdIn}s</b>hold</div><span class="pattern-arrow">→</span>` : ""}
      <div class="seg"><b>${s.pattern.exhale}s</b>exhale</div>
      ${s.pattern.holdOut > 0 ? `<span class="pattern-arrow">→</span><div class="seg"><b>${s.pattern.holdOut}s</b>hold</div>` : ""}
    </div>
    <div class="section-label">Session Length</div>
    <div class="length-row" id="length-row">
      ${s.lengths.map(l => `<div class="length-chip ${l===state.activeLength?'active':''}" data-len="${l}" onclick="STILLPOINT.pickLength(${l})">${l} min</div>`).join("")}
    </div>
    <div class="btn-primary" style="width:100%; text-align:center;" onclick="STILLPOINT.startPractice()">Begin Practice</div>
    <div style="text-align:center; margin-top:16px;">
      <span class="pill" onclick="STILLPOINT.closeDetail()" style="cursor:pointer;">Close</span>
    </div>
  `;
  document.getElementById("detail-overlay").classList.add("active");
}
function closeDetail(){ document.getElementById("detail-overlay").classList.remove("active"); }
function pickLength(l){
  state.activeLength = l;
  document.querySelectorAll("#length-row .length-chip").forEach(chip=>{
    chip.classList.toggle("active", parseInt(chip.dataset.len) === l);
  });
}

// ---------- Audio (Web Audio API — no external files) ----------
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playBell(){
  if(!settings.bell) return;
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 528;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 2.5);
  }catch(e){}
}
function playSoftTick(){
  if(!settings.bell) return;
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 320;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.35);
  }catch(e){}
}
function speak(text){
  if(!settings.voice) return;
  try{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 0.95; u.volume = 0.8;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

// ---------- Practice engine ----------
const PHASE_LABELS = ["Breathe In","Hold","Breathe Out","Hold"];
const PHASE_KEYS = ["inhale","holdIn","exhale","holdOut"];

function startPractice(){
  const s = state.activeSession;
  const mins = state.activeLength;
  closeDetail();

  state.practice.running = true;
  state.practice.paused = false;
  state.practice.totalSeconds = mins * 60;
  state.practice.remaining = mins * 60;
  state.practice.phaseIdx = firstNonZeroPhase(s.pattern);
  state.practice.phaseElapsed = 0;
  state.practice.cycleCount = 0;
  state.practice.guideIdx = 0;
  state.practice.startedAt = Date.now();

  document.getElementById("practice-title").textContent = s.title.toUpperCase();
  document.getElementById("practice-screen").classList.add("active");
  updatePlayPauseIcon(true);
  playBell();

  runPhaseTick();
  state.practice.timerHandle = setInterval(mainTick, 1000);

  if(s.guideText && s.guideText.length){
    showGuideLine();
    state.practice.guideHandle = setInterval(showGuideLine, 14000);
  }
}

function firstNonZeroPhase(pattern){
  for(let i=0;i<4;i++){ if(pattern[PHASE_KEYS[i]] > 0) return i; }
  return 0;
}
function nextPhase(pattern, idx){
  let i = idx;
  for(let step=0; step<4; step++){
    i = (i+1) % 4;
    if(pattern[PHASE_KEYS[i]] > 0) return i;
  }
  return idx;
}

function mainTick(){
  if(state.practice.paused) return;
  state.practice.remaining -= 1;
  updateTimerDisplay();
  if(state.practice.remaining <= 0){
    finishPractice();
    return;
  }
  state.practice.phaseElapsed += 1;
  const pattern = state.activeSession.pattern;
  const key = PHASE_KEYS[state.practice.phaseIdx];
  const dur = pattern[key];
  if(state.practice.phaseElapsed >= dur){
    state.practice.phaseIdx = nextPhase(pattern, state.practice.phaseIdx);
    state.practice.phaseElapsed = 0;
    if(state.practice.phaseIdx === firstNonZeroPhase(pattern)){
      state.practice.cycleCount += 1;
    }
    runPhaseTick();
    if(state.practice.phaseIdx === firstNonZeroPhase(pattern)) playSoftTick();
  }
}

function runPhaseTick(){
  const pattern = state.activeSession.pattern;
  const key = PHASE_KEYS[state.practice.phaseIdx];
  const label = PHASE_LABELS[state.practice.phaseIdx];
  const dur = pattern[key];
  document.getElementById("breath-phase").textContent = label;
  document.getElementById("breath-count").textContent = `Cycle ${state.practice.cycleCount + 1}`;
  const orb = document.getElementById("breath-orb");
  orb.style.transition = `transform ${dur}s linear`;
  if(key === "inhale"){
    orb.style.transform = "scale(1.7)";
  } else if(key === "exhale"){
    orb.style.transform = "scale(1)";
  }
  // holds keep current scale (no transition change)
}

function showGuideLine(){
  const s = state.activeSession;
  if(!s.guideText || !s.guideText.length) return;
  const line = s.guideText[state.practice.guideIdx % s.guideText.length];
  document.getElementById("guide-text").textContent = line;
  speak(line);
  state.practice.guideIdx += 1;
}

function updateTimerDisplay(){
  const r = Math.max(0, state.practice.remaining);
  const m = Math.floor(r/60).toString().padStart(2,"0");
  const sec = (r%60).toString().padStart(2,"0");
  document.getElementById("session-timer").textContent = `${m}:${sec}`;
}

function updatePlayPauseIcon(playing){
  document.getElementById("icon-play").style.display = playing ? "none" : "block";
  document.getElementById("icon-pause").style.display = playing ? "block" : "none";
}

function togglePause(){
  if(!state.practice.running) return;
  state.practice.paused = !state.practice.paused;
  updatePlayPauseIcon(!state.practice.paused);
  if(window.speechSynthesis){
    if(state.practice.paused) window.speechSynthesis.pause();
    else window.speechSynthesis.resume();
  }
}

function restartPractice(){
  clearPracticeTimers();
  startPractice();
}

function skipToEnd(){
  state.practice.remaining = 1;
}

function exitPractice(){
  clearPracticeTimers();
  document.getElementById("practice-screen").classList.remove("active");
  state.practice.running = false;
}

function clearPracticeTimers(){
  if(state.practice.timerHandle) clearInterval(state.practice.timerHandle);
  if(state.practice.guideHandle) clearInterval(state.practice.guideHandle);
  if(window.speechSynthesis) window.speechSynthesis.cancel();
}

function finishPractice(){
  clearPracticeTimers();
  playBell();
  document.getElementById("practice-screen").classList.remove("active");
  state.practice.running = false;

  const durationMin = Math.round(state.practice.totalSeconds/60);
  logSession(state.activeSession, durationMin);

  const streak = computeStreak();
  document.getElementById("complete-title").textContent = "Session Complete";
  document.getElementById("complete-mins").textContent = durationMin;
  document.getElementById("complete-streak").textContent = streak;
  document.getElementById("complete-screen").classList.add("active");
}
function closeComplete(){
  document.getElementById("complete-screen").classList.remove("active");
  renderTrack();
}

// ---------- Tracking / history ----------
function logSession(session, durationMin){
  const entry = {
    id: "s_" + Date.now(),
    sessionId: session.id,
    title: session.title,
    category: session.category,
    minutes: durationMin,
    date: new Date().toISOString()
  };
  history.unshift(entry);
  saveHistory();
  syncToSheets(entry);
}

function dateKey(d){ return d.toISOString().slice(0,10); }

function computeStreak(){
  const days = new Set(history.map(h => dateKey(new Date(h.date))));
  let streak = 0;
  let cursor = new Date();
  // today counts if present; walk backwards
  while(true){
    const key = dateKey(cursor);
    if(days.has(key)){
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // allow "today has no session yet" without breaking an existing streak from yesterday
      if(streak === 0 && key === dateKey(new Date())){
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

function renderTrack(){
  const totalMinutes = history.reduce((a,h)=>a+h.minutes,0);
  const sessions = history.length;
  const streak = computeStreak();
  const daysActive = new Set(history.map(h=>dateKey(new Date(h.date)))).size;
  const avg = daysActive ? Math.round(totalMinutes/daysActive) : 0;

  document.getElementById("stat-streak").textContent = streak;
  document.getElementById("stat-total").textContent = totalMinutes;
  document.getElementById("stat-sessions").textContent = sessions;
  document.getElementById("stat-avg").textContent = avg;

  // last 14 days calendar
  const cal = document.getElementById("streak-cal");
  const doneDays = new Set(history.map(h=>dateKey(new Date(h.date))));
  let html = "";
  for(let i=13;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = dateKey(d);
    html += `<div class="cal-day ${doneDays.has(key)?'done':''}"></div>`;
  }
  cal.innerHTML = html;

  const list = document.getElementById("history-list");
  if(history.length === 0){
    list.innerHTML = `<div class="empty-state"><p>No sessions logged yet. Your first practice will show up here.</p></div>`;
    return;
  }
  list.innerHTML = history.slice(0,50).map(h => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(undefined, {month:"short", day:"numeric"});
    const timeStr = d.toLocaleTimeString(undefined, {hour:"numeric", minute:"2-digit"});
    return `
      <div class="history-item">
        <div>
          <div class="h-title">${h.title}</div>
          <div class="h-meta">${dateStr} · ${timeStr} · ${CATEGORY_LABELS[h.category]||h.category}</div>
        </div>
        <div class="h-dur">${h.minutes}m</div>
      </div>
    `;
  }).join("");
}

// ---------- Google Sheets sync ----------
function syncToSheets(entry){
  if(!settings.sheetsUrl) return;
  try{
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = settings.sheetsUrl;
    form.target = iframe.name = "sp_sync_" + Date.now();
    Object.entries(entry).forEach(([k,v])=>{
      const input = document.createElement("input");
      input.type = "hidden"; input.name = k; input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    setTimeout(()=>{ form.remove(); iframe.remove(); }, 4000);
  }catch(e){ console.warn("Sheets sync failed", e); }
}

function pullFromSheets(){
  if(!settings.sheetsReadUrl) return;
  const cbName = "spSheetsCB_" + Date.now();
  window[cbName] = function(data){
    try{
      if(Array.isArray(data)){
        // merge remote entries not already present locally, by id
        const localIds = new Set(history.map(h=>h.id));
        data.forEach(d=>{ if(d.id && !localIds.has(d.id)) history.push(d); });
        history.sort((a,b)=> new Date(b.date) - new Date(a.date));
        saveHistory();
        renderTrack();
      }
    }catch(e){}
    delete window[cbName];
    script.remove();
  };
  const script = document.createElement("script");
  const sep = settings.sheetsReadUrl.includes("?") ? "&" : "?";
  script.src = settings.sheetsReadUrl + sep + "callback=" + cbName;
  document.body.appendChild(script);
}

// ---------- Settings modal ----------
function openSettings(){
  document.getElementById("toggle-bell").classList.toggle("on", settings.bell);
  document.getElementById("toggle-voice").classList.toggle("on", settings.voice);
  document.getElementById("sheets-url").value = settings.sheetsUrl || "";
  document.getElementById("sheets-read-url").value = settings.sheetsReadUrl || "";
  document.getElementById("settings-overlay").classList.add("active");
}
function closeSettings(){ document.getElementById("settings-overlay").classList.remove("active"); }
function toggleSetting(key){
  settings[key] = !settings[key];
  document.getElementById(key === "bell" ? "toggle-bell" : "toggle-voice").classList.toggle("on", settings[key]);
}
function saveSettings(){
  settings.sheetsUrl = document.getElementById("sheets-url").value.trim();
  settings.sheetsReadUrl = document.getElementById("sheets-read-url").value.trim();
  saveSettingsToStorage();
  closeSettings();
  if(settings.sheetsReadUrl) pullFromSheets();
}

// ---------- Nav ----------
function switchView(view){
  state.currentView = view;
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === view));
  document.getElementById("view-library").classList.toggle("active", view === "library");
  document.getElementById("view-track").classList.toggle("active", view === "track");
  if(view === "track") renderTrack();
}

function initTabs(){
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      state.currentTab = tab.dataset.tab;
      renderLibrary();
    });
  });
}

// ---------- Service worker ----------
function registerSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
}

// ---------- Init ----------
function init(){
  initTabs();
  renderLibrary();
  renderTrack();
  registerSW();
  if(settings.sheetsReadUrl) pullFromSheets();
}

document.addEventListener("DOMContentLoaded", init);

// expose needed functions globally
window.STILLPOINT = { openDetail, closeDetail, pickLength, startPractice };
window.switchView = switchView;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.toggleSetting = toggleSetting;
window.saveSettings = saveSettings;
window.togglePause = togglePause;
window.restartPractice = restartPractice;
window.skipToEnd = skipToEnd;
window.exitPractice = exitPractice;
window.closeComplete = closeComplete;

})();
