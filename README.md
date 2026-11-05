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

Open `host.html`, hit **Create room**, put the code and join link on the board. Students open
the link, enter a team name and members, and join. They type an answer and hit **Lock Answer**;
both their device and yours buzz, and their box locks. Buzzed teams jump to the top of your
list numbered in order. **Reset Buzzers** clears every answer and unlocks everyone for the next
question. A student who refreshes rejoins as the same team and stays locked if they were locked.

The room lives in the URL (`host.html?room=CODE`), so refreshing the teacher view keeps the
class; opening plain `host.html` starts a new room.

## About the rules

Anyone who knows a room code can read that room's teams and write to a team inside it - there
are no accounts, so the 4-letter code is the only thing standing between a class and its room.
On top of that, the rules pin the data to exactly the five fields the app uses, reject anything
else, and require `buzzedAt` to equal the server's own clock, so a student cannot fake an
earlier buzz by changing the time on their Chromebook.

Fine for classroom answers. Do not put anything private in it, and make a fresh room per class
if you would rather old answers were not readable by someone who still has yesterday's code.
