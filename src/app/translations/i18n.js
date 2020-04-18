const path = require("path")
const fs = require('fs');
const appConfig = new(require('../../../config'));

let loadedLanguage;

module.exports = i18n;

function i18n() {
     let locale = 'languages/' + appConfig.Locale();
     if(fs.existsSync(path.join(__dirname, locale + '.json'))) {
         loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, locale + '.json'), 'utf8'))
     }
     else {
         loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, 'languages/vi-VI.json'), 'utf8'))
     }
}

i18n.prototype.__ = function(phrase) {
    let translation = loadedLanguage[phrase]
    if(translation === undefined) {
         translation = phrase
    }
    return translation
}