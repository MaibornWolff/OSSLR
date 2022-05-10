const fs = require("fs");

const data = fs.readFile("../Resources/LICENSE.txt", "utf8", function(err, doc) {
    const regex1 = (/^[C|c]opyright(.*)?$/gm);
    const regex2 = (/^©(.*)?$/gm);
    const regex3 =(/^\(c\)(.*)?$/gm);

    if(doc.match(regex1)){
        console.log(regex1)
    } else if(doc.match(regex2)){
        console.log(regex2)
    } else if(doc.match(regex3)){
        console.log(regex3)
    } else {
        console.log(err)
    }
});