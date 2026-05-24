const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all(`SELECT id, question_text, audio_clip_id FROM questions WHERE id IN (442, 443, 444)`, (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
