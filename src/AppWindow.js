const { BrowserWindow } = require('electron');

class AppWindow extends BrowserWindow {
  constructor(config, url) {
    const defaultConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
      show: false,
      backgroundColor: '#efefef',
    };
    const mergedConfig = { ...defaultConfig, ...config };
    super(mergedConfig);
    this.loadURL(url);
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}

module.exports = AppWindow;
