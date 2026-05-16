const fs = require('fs');
const html = fs.readFileSync('cart_html.txt', 'utf8');
const regex = /d=\\"(M[^\\"]+)\\"/g;
let match;
const paths = new Set();
while ((match = regex.exec(html)) !== null) {
  paths.add(match[1]);
}
console.log(Array.from(paths).join('\n---\n'));
