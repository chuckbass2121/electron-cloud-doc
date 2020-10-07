const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

const menuTemplate = require('./src/menuTemplate');
const AppWindow = require('./src/AppWindow');
const QiniuManager = require('./src/utils/QiniuManager');
const settingsStore = new Store({ name: 'Settings' });
const fileStore = new Store({ name: 'Files Data' });
const savedLocation =
  settingsStore.get('savedFileLocation') || app.getPath('documents');

const createManager = () => {
  const accessKey = settingsStore.get('accessKey');
  const secretKey = settingsStore.get('secretKey');
  const bucketName = settingsStore.get('bucketName');
  return new QiniuManager(accessKey, secretKey, bucketName);
};

const isDownloadNeeded = (putTime, updatedAt) => {
  const serverUpdatedTime = Math.round(putTime / 10000);
  const localUpdatedTime = updatedAt;
  return serverUpdatedTime > localUpdatedTime || !localUpdatedTime;
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
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error', error == null ? 'unknown' : error.status);
  });
  autoUpdater.on('update-available', () => {
    dialog
      .showMessageBox({
        type: 'infor',
        title: '应用有新的版本',
        message: '发现新版本，是否现在更新？',
        buttons: ['是', '否'],
      })
      .then((buttonIndex) => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });
  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      title: '没有新版本',
      message: '已经是最新版本',
    });
  });

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

  ipcMain.on('download-file', (event, data) => {
    const manager = createManager();
    const filesObj = fileStore.get('files');
    const { key, path, id } = data;
    manager.getStat(key).then(
      (resp) => {
        const downloadNeeded = isDownloadNeeded(
          resp.putTime,
          filesObj[id].updatedAt
        );
        if (downloadNeeded) {
          manager.downloadFile(key, path).then(() => {
            mainWindow.webContents.send('file-downloaded', {
              status: 'download-success',
              id,
            });
          });
        } else {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-new-file',
            id,
          });
        }
      },
      (error) => {
        if (error.statusCode === 612) {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-file',
            id,
          });
        }
      }
    );
  });

  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true);
    const manager = createManager();
    const filesObj = fileStore.get('files') || {};
    const uploadPromiseArr = Object.keys(filesObj).map((key) => {
      const file = filesObj[key];
      return manager.uploadFile(`${file.title}.md`, file.path);
    });
    Promise.all(uploadPromiseArr)
      .then((result) => {
        console.log(result);
        // show uploaded message
        dialog.showMessageBox({
          type: 'info',
          title: `成功上传了${result.length}个文件`,
          message: `成功上传了${result.length}个文件`,
        });
        mainWindow.webContents.send('files-uploaded');
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
      })
      .finally(() => {
        mainWindow.webContents.send('loading-status', false);
      });
  });

  ipcMain.on('rename-file', (event, data) => {
    const { id, srcKey, destKey } = data;
    const manager = createManager();
    manager
      .renameFile(srcKey, destKey)
      .then(() => {
        mainWindow.webContents.send('file-renamed', { id });
      })
      .catch((err) => {
        console.log('rename-file: ', err);
        dialog.showErrorBox('重命名失败', '请检查七牛云参数是否正确');
      });
  });

  ipcMain.on('download-all', () => {
    // 1. get all the file list from qiniu
    const manager = createManager();
    manager.downloadAllFiles().then(({ items }) => {
      console.log('download-all', items);
      if (!Array.isArray(items) || items.length === 0) {
        dialog.showErrorBox(
          'there are no files in cloud',
          'there are no files in cloud'
        );
      }
      // 2. compare with local files in the store, only download
      // the latest file and file which is not in local
      const localFiles = fileStore.get('files') || {};
      let filteredFiles = [];
      let newDownloadedFiles = [];
      let updatedFiles = [];

      if (Object.getOwnPropertyNames(localFiles).length) {
        newDownloadedFiles = items
          .filter((item) => {
            const needDownload = Object.values(localFiles).find((file) => {
              return item.key !== `${file.title}.md`;
            });
            return needDownload;
          })
          .map((item) => {
            item.path = path.join(savedLocation, item.key);
            return item;
          });

        updatedFiles = items
          .filter((item) => {
            const needDownload = Object.values(localFiles).find((file) => {
              return (
                item.key === `${file.title}.md` &&
                isDownloadNeeded(item.putTime, file.updatedAt)
              );
            });
            return needDownload;
          })
          .map((item) => {
            let localFile = Object.values(localFiles).find((file) => {
              return item.key === `${file.title}.md`;
            });
            item.id = localFile.id;
            item.path = path.join(savedLocation, item.key);
            return item;
          });

        filteredFiles = newDownloadedFiles.concat(updatedFiles);
      } else {
        filteredFiles = items;
      }

      if (filteredFiles.length === 0) {
        mainWindow.webContents.send('all-downloaded', {
          status: 'no-new-files',
          newDownloadedFiles,
          updatedFiles,
        });
      }
      mainWindow.webContents.send('loading-status', true);
      // 3. send download request for filtered list

      const downloadAllPromiseArr = filteredFiles.map((file) => {
        return manager.downloadFile(file.key, file.path);
      });

      Promise.all(downloadAllPromiseArr)
        .then((results) => {
          console.log('downloadAllPromiseArr: ', results);
          mainWindow.webContents.send('all-downloaded', {
            status: 'download-success',
            newDownloadedFiles,
            updatedFiles,
          });
          dialog.showMessageBox({
            type: 'info',
            title: `downloaded ${results.length} 个file success`,
            message: `downloaded ${results.length} 个file success`,
          });
        })
        .catch((err) => {
          console.log('download-all', err);
          dialog.showErrorBox('download-all失败', '请检查七牛云参数是否正确');
        })
        .finally(() => {
          mainWindow.webContents.send('loading-status', false);
        });
    });
  });

  ipcMain.on('delete-file', (event, data) => {
    const { key } = data;
    const manager = createManager();
    manager
      .deleteFile(key)
      .then(() => {
        dialog.showMessageBox({
          type: 'info',
          title: `${key} is deleted`,
          message: `${key} is deleted`,
        });
      })
      .catch((err) => {
        console.log('delete-file: ', err);
        dialog.showErrorBox('删除失败', '请检查七牛云参数是否正确');
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
