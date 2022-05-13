import {readFileSync} from 'fs';

function extractCopyright(license) {
    // Your code goes here. Return copyright notice as a string


const data = readFileSync('../OSSLR/regex.txt', "utf8");
const arrayofregex = data.split("\n");
const licenceText = readFileSync('../Resources/LICENSE.txt', "utf8");

for(let i = 0; i < arrayofregex.length; i++){
    let regtext = new RegExp(arrayofregex[i]);
    if (regtext.test( licenceText)){
        console.log(regtext.exec(licenceText)[0]);
    }    
}

    
    return ""
}

extractCopyright('');

