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
// over. null means there is no stamp, or the read was refused.
function hostSeenAge(code) {
  return db.ref(".info/serverTimeOffset").once("value")
    .then((o) => db.ref("rooms/" + code + "/hostSeen").once("value")
      .then((s) => (s.val() ? Date.now() + (o.val() || 0) - s.val() : null)))
    .catch(() => null);
}

// Short square-wave buzz. Saves hosting an audio file and needs no preloading.
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
  osc.frequency.setValueAtTime(240, t);
  osc.frequency.setValueAtTime(180, t + 0.16);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
  gain.gain.setValueAtTime(0.22, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.44);
}

// Browsers keep audio suspended until the page has been interacted with; the teacher's
// dashboard may sit untouched for a while, so arm it on the first touch of the page.
addEventListener("pointerdown", audio, { once: true });
addEventListener("keydown", audio, { once: true });
