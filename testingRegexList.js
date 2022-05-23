

function extractCopyright(license) {
  // Your code goes here. Return copyright notice as a string

  const data = readFileSync("../OSSLR/regex.txt", "utf8");
  const arrayofregex = data.split("\n");

  for (let i = 0; i < arrayofregex.length; i++) {
    let regtext = new RegExp(arrayofregex[i]);
    if (regtext.test(license)) {
      return regtext.exec(license)[0];
    }
  }
  return "";
}