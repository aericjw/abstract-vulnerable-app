const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database("bank.sqlite", callback => { // bind database to variable
    if (callback){
        console.error(callback.message)
    }
});
module.exports = db; // export database to be used by other JS files