// Shared by index.html (student) and host.html (teacher).

if (!firebaseConfig.databaseURL) {
  document.body.innerHTML =
    '<p style="font:600 20px system-ui;color:#a8161c;padding:2rem;line-height:1.5">' +
    'Set <code>databaseURL</code> in firebase-config.js.<br>' +
    'Firebase Console &rarr; Databases &amp; Storage &rarr; Realtime Database &rarr; Create Database, then copy the URL at the top of that page.</p>';
  throw new Error("firebase-config.js is missing databaseURL");
}

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const SERVER_TIME = firebase.database.ServerValue.TIMESTAMP;

// How old rooms/<code>/hostSeen is, in ms, measured against the server's clock rather than
// this device's: a Chromebook with the wrong date must not get to decide whether a game is
// over. null means there is no stamp at all, so no dashboard has ever opened that code - a
// mistyped one. A read that fails rejects instead, so a caller can tell "no such room" from
// "could not ask": opposite answers that must not share a return value.
function hostSeenAge(code) {
  return db.ref(".info/serverTimeOffset").once("value")
    .then((o) => db.ref("rooms/" + code + "/hostSeen").once("value")
      .then((s) => (s.val() ? Date.now() + (o.val() || 0) - s.val() : null)));
}

// localStorage throws rather than returning null when a browser blocks site data - Safari with
// cookies off, iOS private browsing. Nothing kept here is worth a dead page, so lose the value
// instead: a forgotten mute setting beats a dashboard whose buttons never got wired up.
function recall(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function remember(key, value) {
  try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {}
}

// Who buzzed first, and the order the dashboard lists them in: buzzed teams above unbuzzed,
// then by the server's clock, then by push id so equal stamps keep a steady order. This is the
// one calculation the app exists for, so it lives here where tests.html can reach it.
function byBuzzOrder(a, b) {
  return (a.buzzedAt ? 0 : 1) - (b.buzzedAt ? 0 : 1) ||
    a.buzzedAt - b.buzzedAt ||
    a.id.localeCompare(b.id);
}

// Short square-wave buzz. Saves hosting an audio file and needs no preloading. The sweep sits
// at 400 Hz rather than down at 240: a tablet or Chromebook speaker is past its roll-off there,
// so the fundamental never reaches the room and the buzz reads as thin rather than loud.
// shortcut: a square wave has far lower RMS than a normalised recording, so this is as loud as
// it gets without hosting a real sound. Replace beep() with a WAV when that lands.
let actx;
function audio() {
  actx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  return actx;
}
function beep() {
  const ctx = audio();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.setValueAtTime(300, t + 0.16);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.7, t + 0.012);
  gain.gain.setValueAtTime(0.7, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.44);
}

// Browsers keep audio suspended until the page has been interacted with; the teacher's
// dashboard may sit untouched for a while, so arm it on the first touch of the page.
addEventListener("pointerdown", audio, { once: true });
addEventListener("keydown", audio, { once: true });
