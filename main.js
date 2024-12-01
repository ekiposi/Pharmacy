const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'images/app.ico'), // Add the icon here
        frame: false, // Hides the default navbar/title bar
        webPreferences: {
            contextIsolation: true,
        },
    });

    win.loadFile('index.html');
});
