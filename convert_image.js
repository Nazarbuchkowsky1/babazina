const fs = require('fs');
const path = require('path');
const file = 'home.jpg';
const data = fs.readFileSync(file);
const base64 = data.toString('base64');
fs.writeFileSync('base64_image.txt', 'data:image/jpeg;base64,' + base64);
console.log('Conversion complete. Check base64_image.txt');
