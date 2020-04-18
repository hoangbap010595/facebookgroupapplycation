const fs = require('fs');
const os = require('os');
const path = require('path');

//export module
module.exports = appConfig;

//Properties application
let appProperties = {
    appProperties: {
        calendarSystem: 'en-US',
        firstDayOfWeek: 1,
        username: '',
        password: '',
        remember: false,
        locale: 'vi-VI'
    }
};

let parentPath = os.homedir();
if (process.env.NODE_ENV === 'development') {
    parentPath = './';
}

const dbPath = path.join(parentPath, '.config/amzdb');

function appConfig() {
    console.log('load appConfig ' + appConfig.dbExists());
    if (appConfig.dbExists() === false) {
        appConfig.createDatabase();
    }
}

appConfig.dbExists = function () {
    if (fs.existsSync(dbPath)) {
        return true;
    }
    return false;
};

appConfig.createDatabase = function () {
    const wannaDirectoryPath = path.join(parentPath, '.config');
    if (!fs.existsSync(wannaDirectoryPath))
        fs.mkdirSync(wannaDirectoryPath);
    const prefill = JSON.stringify(appProperties);
    fs.writeFileSync(dbPath, prefill);
};

//Locale
appConfig.prototype.Locale = function (value) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    let jData = JSON.parse(data);
    if (value !== null && value !== undefined) {
        jData.appProperties.locale = value;
        const prefill = JSON.stringify(jData);
        fs.writeFileSync(dbPath, prefill);
        return value;
    }
    return jData.appProperties.locale || "vi-VI";
};

//Login: Remember
appConfig.prototype.Remember = function (value) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    let jData = JSON.parse(data);
    if (value !== null && value !== undefined) {
        jData.appProperties.remember = value;
        const prefill = JSON.stringify(jData);
        fs.writeFileSync(dbPath, prefill);
        return value;
    }
    return jData.appProperties.remember || false;
};

//Login: Username
appConfig.prototype.Username = function (value) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    let jData = JSON.parse(data);
    if (value !== null && value !== undefined) {
        console.log(jData);
        jData.appProperties.username = value;
        const prefill = JSON.stringify(jData);
        fs.writeFileSync(dbPath, prefill);
        return value;
    }
    return jData.appProperties.username;
};

//Login: Password
appConfig.prototype.Password = function (value) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    let jData = JSON.parse(data);
    if (value !== null && value !== undefined) {
        jData.appProperties.password = value;
        const prefill = JSON.stringify(jData);
        fs.writeFileSync(dbPath, prefill);
        return value;
    }
    return jData.appProperties.password;
};

//Config Application
appConfig.prototype.X_RUNTIME_AMAZON_MEMBER = function () {
    return "http://amazon.atupload.com";
}
