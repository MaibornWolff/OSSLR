//checks if LICENSE file includes the String "Copyright"


const {readFileSync, promises: fsPromises} = require('fs');

function checkIfContainsSync(filename, str) {
    const contents = readFileSync("../Resources/LICENSE.txt", 'utf-8');

    const result = contents.includes("Copyright");

    return result;
}

console.log(checkIfContainsSync('../Resources/LICENSE.txt', "Copyright"))