const fs = require("fs");

const data = fs.readFileSync("../Resources/LICENSE.txt", "utf8");

const line = data.split("\n");
console.log(line[0]);
