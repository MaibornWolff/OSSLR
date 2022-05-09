// Shows LICENSE file in console

const fs = require("fs");
try {
  const data = fs.readFileSync("../Resources/LICENSE.txt", "utf8");
  console.log(data);
} catch (e) {
  console.error(e);
}


