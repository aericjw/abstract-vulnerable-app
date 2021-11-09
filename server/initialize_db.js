const db = require("./db"); // get database
const accounts = [
    [1, 1, "Savings", 100000000],
    [2, 1, "Checking", 100000],
    [3, 2, "Savings", 1500000],
    [4, 2, "Checking", 200000],
    [5, 3, "Savings", 2000000],
    [6, 3, "Checking", 40000],
    [7, 4, "Savings", 1000],
    [8, 4, "Checking", 800],
    [9, 5, "Checking", 2000],
    [10, 6, "Checking", 300000],
    [11, 7, "Savings", 20000],
    [12, 7, "Checking", 3600],
    [13, 8, "Savings", 500],
    [14, 8, "Checking", 200],
    [15, 9, "Savings", 45000],
    [16, 10, "Savings", 75000],
    [17, 10, "Checking", 15000]
  ];

db.serialize(function createAccounts() { // create accounts table and populate with accounts data
    db.run(
        `CREATE TABLE IF NOT EXISTS accounts (
        account INTEGER PRIMARY KEY,
        owner INTEGER,
        type TEXT,
        balance INTEGER
        )`);

    for (let account of accounts){
        db.run(
        `INSERT INTO accounts VALUES (?,?,?,?)`,
        [account[0], account[1], account[2], account[3]],
        function(error){
            if(error){
                return console.error(error);
            }
        });
    } 
});

db.serialize(function printTable(){ // print each row
    db.all(`SELECT * FROM accounts`, (err, results) => {
        if(err){
            return console.error(err.message);
        }
        for (let result of results){
            console.log(`Account: ${result.account} Owner: ${result.owner} Account Type: ${result.type} Balance: ${result.balance}\n`);
        }
    });
});