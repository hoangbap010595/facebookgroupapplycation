const electron = require('electron');
const {
    app,
    ipcMain,
    BrowserWindow,
    dialog,
    session
} = electron;
const FB = require('fb');
const path = require('path');
const url = require('url');
const i18n = new (require('./src/app/translations/i18n'));

// Màn hình chính ứng dụng
var mainWindow;

function createMainWindow() {
    // appConfig.Username("lchoang1995@gmail.com");
    // appConfig.Password("Hoang911");
    //appConfig.Locale("vi-VI");
    //appConfig.Locale("en-US");
    let width = 1200;
    let height = 700;
    ({
        width,
        height
    } = electron.screen.getPrimaryDisplay().size);
    width = width - 300;
    height = height - 250;
    width = 1331;
    height = 960;
    mainWindow = new BrowserWindow({
        minWidth: width,
        minHeight: height,
        width,
        height,
        maxWidth: width,
        maxHeight: height,
        title: "Search In Group by Hastag v" + app.getVersion(),
        icon: `${__dirname}/src/assets/icons/win/icon.ico`,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });
    mainWindow.setMenu(null);
    //mainWindow.webContents.openDevTools();
    //open devTool

    mainWindow.loadURL('file://' + __dirname + '/src/app/components/Home/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
        if (process.platform != 'darwin')
            app.quit();
    });

    mainWindow.on('close', (event) => {
        event.preventDefault()
        let options = {}
        options.buttons = ["Yes", "No"];
        options.message = i18n.__('MESSAGE_Quit');
        options.title = i18n.__('MESSAGE_Title');

        dialog.showMessageBox(mainWindow, options, (res) => {
            if (res === 0)
                mainWindow.destroy()
        })
    });
}

app.on('ready', createMainWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('activate', function () {
    if (mainWindow === null)
        createMainWindow()
});

// Code to create fb authentication window
ipcMain.on('fb-authenticate', function (event, arg) {
    var options = {
        client_id: '1599326243554090',//ID ỨNG DỤNG
        scopes: 'email',
        redirect_uri: 'https://www.facebook.com/connect/login_success.html'
    };

    let width = 450, height = 500;
    var authWindow = new BrowserWindow({
        icon: `${__dirname}/src/assets/icons/win/icon.ico`,
        width: width,
        height: height,
        minWidth: width,
        minHeight: height,
        maxWidth: width,
        maxHeight: height,
        show: false,
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: false
        }
    });
    authWindow.setMenu(null);

    var facebookAuthURL = `https://www.facebook.com/v3.2/dialog/oauth?client_id=${options.client_id}&redirect_uri=${options.redirect_uri}&response_type=token,granted_scopes&scope=${options.scopes}&display=popup`;

    authWindow.loadURL(facebookAuthURL);

    // Clear all cookies from Facebook
    authWindow.webContents.session.cookies.remove("https://www.facebook.com", "", (a) => {
        console.log("cookies remove: " + a);
    });

    authWindow.webContents.on('did-finish-load', function () {
        authWindow.show();
    });

    var access_token, error;
    var closedByUser = true;

    var handleUrl = function (url) {
        var raw_code = /access_token=([^&]*)/.exec(url) || null;
        access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        error = /\?error=(.+)$/.exec(url);

        if (access_token || error) {
            closedByUser = false;
            mainWindow.webContents.executeJavaScript("document.getElementById(\"access_token\").value = '" + access_token + "'");
            mainWindow.webContents.executeJavaScript("localization.home.fun.loginSussess()");
            authWindow.close();
        }
    }

    authWindow.webContents.on('will-navigate', (event, url) => handleUrl(url));
    var filter = {
        urls: [options.redirect_uri + '*']
    };

    session.defaultSession.webRequest.onCompleted(filter, (details) => {
        var url = details.url;
        handleUrl(url);
    });

    authWindow.on('close', () => event.returnValue = closedByUser ? { error: 'The popup window was closed' } : { access_token, error })
})