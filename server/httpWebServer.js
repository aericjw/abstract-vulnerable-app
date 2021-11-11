var express = require('express');

app = express();
port = process.env.PORT || 5001;

app.use(express.urlencoded({extended: false}));
app.use(express.json())

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.cwd() + "/server/bank.sqlite", callback => { // bind database to variable
    if (callback){
        console.error(callback.message)
    }
});

app.get('/api/sql_inject', (req, res) => {
    db.serialize(function fakeInjection(){
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            console.log(JSON.stringify(results[0]))
            res.send(JSON.stringify(results[0]))
        });
    });
});

var server = app.listen(port, () => {
    console.log('Node.js web server at port 5001 is running..')
});

