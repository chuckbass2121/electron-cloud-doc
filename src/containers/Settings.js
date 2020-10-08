import React, { useState } from 'react';
const { remote, ipcRenderer } = require('electron');
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' });

function Settings() {
  const store_savedFileLocation = settingsStore.get('savedFileLocation') || '';
  const store_accessKey = settingsStore.get('accessKey') || '';
  const store_secretKey = settingsStore.get('secretKey') || '';
  const store_bucketName = settingsStore.get('bucketName') || '';

  const [savedFileLocation, setSavedFileLocation] = useState(
    store_savedFileLocation
  );
  const [accessKey, setAccessKey] = useState(store_accessKey);
  const [secretKey, setSecretKey] = useState(store_secretKey);
  const [bucketName, setBucketName] = useState(store_bucketName);
  const [activeTabId, setActiveTabId] = useState('1');

  const selectNewLocation = () => {
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的存储路径',
      })
      .then((path) => {
        if (Array.isArray(path)) {
          setSavedFileLocation(path[0]);
        }
      });
  };

  const submitSettings = (e) => {
    e.preventDefault();
    if (accessKey && secretKey && bucketName) {
      settingsStore.set('accessKey', accessKey);
      settingsStore.set('secretKey', secretKey);
      settingsStore.set('bucketName', bucketName);
    } else {
      remote.dialog.showErrorBox(
        'all fields are required',
        'please fill all required fields'
      );
      return;
    }
    // sent a event back to main process to enable menu items if qiniu is configed
    ipcRenderer.send('config-is-saved');
    remote.getCurrentWindow().close();
  };

  const handleTabClick = (e, id) => {
    e.preventDefault();
    setActiveTabId(id);
  };

  return (
    <div className="container mt-4">
      <h5>设置</h5>
      <form id="settings-form" onSubmit={submitSettings}>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTabId === '1' ? 'active' : ''}`}
              href="/#"
              onClick={(e) => handleTabClick(e, '1')}
            >
              文件存储位置
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${activeTabId === '2' ? 'active' : ''}`}
              href="/#"
              onClick={(e) => handleTabClick(e, '2')}
            >
              七牛云同步
            </a>
          </li>
        </ul>
        <div
          id="1"
          className="config-area mt-4"
          style={{ display: activeTabId === '1' ? 'block' : 'none' }}
        >
          <div className="form-group">
            <label htmlFor="savedFileLocation">选择文件存储位置</label>
            <div className="input-group mb-2">
              <input
                type="text"
                value={savedFileLocation}
                className="form-control"
                placeholder="当前存储地址"
                readOnly
                required
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  id="select-new-location"
                  onClick={selectNewLocation}
                >
                  选择新的位置
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          id="2"
          className="config-area mt-4"
          style={{ display: activeTabId === '2' ? 'block' : 'none' }}
        >
          <div className="form-group row">
            <label htmlFor="accessKey" className="col-3 col-form-label">
              Access Key
            </label>
            <div className="col-9">
              <input
                type="text"
                className="form-control"
                value={accessKey}
                placeholder="Access Key"
                onChange={(e) => setAccessKey(e.target.value)}
                required
              />
              <small id="acHelp" className="form-text text-muted">
                请在七牛云密钥管理下查看
              </small>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="secretKey" className="col-3 col-form-label">
              Secret Key
            </label>
            <div className="col-9">
              <input
                type="password"
                className="form-control"
                value={secretKey}
                placeholder="Secret Key"
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <small id="skHelp" className="form-text text-muted">
                请在七牛云密钥管理下查看
              </small>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="bucketName" className="col-3 col-form-label">
              Bucket名称
            </label>
            <div className="col-9">
              <input
                type="text"
                className="form-control"
                value={bucketName}
                placeholder="请输入 Bucket 名称"
                onChange={(e) => setBucketName(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          保存
        </button>
      </form>
    </div>
  );
}

export default Settings;
