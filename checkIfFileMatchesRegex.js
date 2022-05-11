const fs = require("fs");
const data = fs.readFileSync("../Resources/LICENSE4.txt", "utf8");

const regex1 = /[C|c]opyright(.*)?$/gm;
const regex2 = /^©(.*)?$/m;
const regex3 = /^\(c\)(.*)?$/m;

if (data.match(regex1)) {
  console.log(regex1.exec(data)[0]);
} else if (data.match(regex2)) {
  console.log(regex2.exec(data)[0]);
} else if (data.match(regex3)) {
  console.log(regex3.exec(data)[0]);
}
