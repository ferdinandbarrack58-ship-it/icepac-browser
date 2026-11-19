
const { app, BrowserWindow } = require("electron");

app.setName("ICEPAC BROWSER");

function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1000,
        minHeight: 650,
        title: "ICEPAC BROWSER",
        backgroundColor: "#080b14",
        autoHideMenuBar: true,
        webPreferences: {
            webviewTag: true,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
