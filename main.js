const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const menuTemplate = require('./src/menuTemplate');
const AppWindow = require('./src/AppWindow');
const QiniuManager = require('./src/utils/QiniuManager');
const settingsStore = new Store({ name: 'Settings' });

const createManager = () => {
  const accessKey = settingsStore.get('accessKey');
  const secretKey = settingsStore.get('secretKey');
  const bucketName = settingsStore.get('bucketName');
  return new QiniuManager(accessKey, secretKey, bucketName);
};

function createWindow() {
  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './index.html')}`;
  // 创建浏览器窗口
  const win = new AppWindow(
    {
      width: 1440,
      height: 768,
    },
    urlLocation
  );

  // 打开开发者工具
  win.webContents.openDevTools();
  return win;
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  let mainWindow = createWindow();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  // set the menu
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 800,
      height: 600,
      parent: mainWindow,
    };
    const settingsFileLocation = `file://${path.join(
      __dirname,
      './settings/settings.html'
    )}`;
    let settingsWindow = new AppWindow(
      settingsWindowConfig,
      settingsFileLocation
    );
    settingsWindow.removeMenu();
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  });

  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager();
    manager
      .uploadFile(data.key, data.path)
      .then((data) => {
        console.log('上传成功', data);
        mainWindow.webContents.send('active-file-uploaded');
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
      });
  });

  ipcMain.on('config-is-saved', () => {
    // watch out menu items index for mac and windows
    let qiniuMenu =
      process.platform === 'darwin' ? menu.items[3] : menu.items[2];
    const switchItems = (toggle) => {
      [1, 2, 3].forEach((number) => {
        qiniuMenu.submenu.items[number].enabled = toggle;
      });
    };
    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(
      (key) => !!settingsStore.get(key)
    );
    if (qiniuIsConfiged) {
      switchItems(true);
    } else {
      switchItems(false);
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
