const fs = require('fs');
const data = fs.readFileSync("../Resources/LICENSE.txt", "utf8");
const textByLine = data.split("\n")

const regex1 = (/^[C|c]opyright(.*)?$/gm);
const regex2 = (/^©(.*)?$/m);
const regex3 =(/^\(c\)(.*)?$/m);

textByLine.forEach(line => {
    if (line.match(regex1)){
        console.log(line)
    } else if (line.match(regex2)){
        console.log(line)
    } else if (line.match(regex3)){
        console.log(line)
    }
}) 