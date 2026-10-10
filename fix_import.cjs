const fs = require('fs');
const filePath = 'c:/Users/precision-5760/Desktop/FitCoach/Api/controllers/subscriptions.js';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import User')) {
    content = content.replace('import Client from "../models/Client.js";', 'import Client from "../models/Client.js";\r\nimport User from "../models/User.js";');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated!");
} else {
    console.log("Already has User import");
}
