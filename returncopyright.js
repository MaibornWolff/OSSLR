const fs = require("fs");

const data = fs.readFileSync("../Resources/LICENSE.txt", "utf8");
console.log(typeof data)

const line = data.split("\n");
console.log(line[0]);


const dataInLowerCase = data.toLowerCase();

