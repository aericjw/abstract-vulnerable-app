var express = require('express');

app = express();
port = process.env.PORT || 5001;

app.use(express.urlencoded({extended: false}));
app.use(express.json())

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(process.cwd() + "/server/bank.sqlite", callback => { // bind database to variable
    if (callback){
        console.error(callback.message)
    }
});

// Attack Responses

app.get('/api/sql_inject', (req, res) => {
    db.serialize(() => {
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            console.log(JSON.stringify(results[0]))
            res.send(JSON.stringify(results[0]))
        });
    });
});

// Option Responses

app.put('/api/steal', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    attackType = body.attackType
    account = body.account
    console.log(attackType)
    console.log(account)
    db.serialize(() => {
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            let response = {}
            if (account > results.length){
                account = 1
            }
            if (attackType === "SQL"){
                response = {
                    "currentAccount": results[account-1],
                    "nextAccount": results[account]
                }
            }
            console.log(JSON.stringify(response))
            res.send(JSON.stringify(response))
        });
    });
})

app.put('/api/next', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    attackType = body.attackType
    account = body.account
    console.log(attackType)
    console.log(account)
    db.serialize(() => {
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            let response = {}
            if (account >= results.length){
                account = 0
            }
            if (attackType === "SQL"){
                response = {
                    "nextAccount": results[account]
                }
            }
            console.log(JSON.stringify(response))
            res.send(JSON.stringify(response))
        });
    });
})

// Helper functions

var server = app.listen(port, () => {
    console.log('Node.js web server at port 5001 is running..')
});

