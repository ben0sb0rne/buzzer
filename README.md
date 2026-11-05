# Classroom Buzzer

A 4-letter room code, a text box and a big red button. Teams type an answer, hit
**Lock Answer**, and the teacher's dashboard shows who locked in first using
Firebase's server clock. No logins, no build step, no dependencies to install.

- `index.html` - student view
- `host.html` - teacher view
- `firebase-config.js` - the only file you need to edit
- `database.rules.json` - database rules to paste into the console

## 1. Firebase

1. In the [Firebase console](https://console.firebase.google.com), open your project.
2. **Databases & Storage -> Realtime Database -> Create Database.** Pick the region closest to you and
   choose **Start in locked mode** (step 3 replaces the rules). This is a different product
   from Cloud Firestore - make sure you are on Realtime Database.
3. Copy the URL shown at the top of that page. It looks like
   `https://YOUR-PROJECT-default-rtdb.firebaseio.com` or, outside the US,
   `https://YOUR-PROJECT-default-rtdb.europe-west1.firebasedatabase.app`.
4. **Project settings -> Your apps -> Web app -> Config.** Copy that `firebaseConfig` object
   into `firebase-config.js`, then add the URL from step 3 as `databaseURL`. That snippet does
   not include `databaseURL`, so it is easy to lose if you paste the whole object over the file.
5. **Realtime Database -> Rules**, paste the contents of `database.rules.json`, hit **Publish**.

The web API key in that config is not a secret - it identifies the project, it does not grant
access. The rules below are what actually control access.

## 2. GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings -> Pages -> Source: Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
3. A minute later the teacher view is at `https://YOUR-NAME.github.io/REPO/host.html`.

Bookmark the teacher view. Students only ever need the join link it displays.

## 3. In class

Open `host.html`, hit **Create room**, put the code and join address on the board. Students open
the link, enter a team name and members, and join. They type an answer and hit **Lock Answer**;
both their device and yours buzz, and their box locks. Buzzed teams jump to the top of your
list numbered in order. **Reset Buzzers** clears every answer and unlocks everyone for the next
question. A student who refreshes rejoins as the same team and stays locked if they were locked.

The room lives in the URL (`host.html?room=CODE`), so refreshing the teacher view keeps the
class; opening plain `host.html` starts a new room.

The join address the dashboard prints has no room code in it, so it never changes - students can
bookmark it once and just type the 4 letters each lesson. The link it points at *does* carry
`?room=CODE`, so copying it into Google Classroom still fills the code in automatically.

## The cog

Everything that is not needed during a question hides behind the cog in the top right, so the
projected dashboard stays clean. Opening it gives you:

- **Mute buzzer on this device** - silences the sound on the teacher machine only; student
  devices still buzz. Remembered on that machine.
- **End game** - two taps, because it clears every team in the room (see below).
- A **x** beside each row while the panel is open, to remove one team. Use it for the duplicate
  row you get when a student rejoins from a different browser.

## Ending a game

Closing the teacher tab does *not* end a game. Teams live in the database, so a student device
would rejoin the same dead room every time it reopened. Two things prevent that:

1. **End game** deletes every team in the room. Any student device, open or closed, lands back
   on the join screen the moment it next sees the database.
2. A device forgets its team after 12 hours anyway, so a game you forgot to end cannot follow
   you into the next day.
3. A student can tap **Room XXXX** in the corner of their own screen and tap again to confirm,
   which drops them back to the join screen so they can enter a different code. Their team row
   stays on your dashboard with whatever they had locked in; remove it with the **x** if you
   do not want it.

Use End game at the end of a lesson. If you forget, the next day still starts clean - but
students in a later lesson the same day would still be holding the morning's room, so end it.


## About the rules

Anyone who knows a room code can read that room's teams and write to a team inside it - there
are no accounts, so the 4-letter code is the only thing standing between a class and its room.
On top of that, the rules pin the data to exactly the five fields the app uses, reject anything
else, and require `buzzedAt` to equal the server's own clock, so a student cannot fake an
earlier buzz by changing the time on their Chromebook.

Fine for classroom answers. Do not put anything private in it, and make a fresh room per class
if you would rather old answers were not readable by someone who still has yesterday's code.
