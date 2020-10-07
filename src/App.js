import React, { useState } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faSearch,
  faTimes,
  faEdit,
  faTrash,
  faPlus,
  faFileImport,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import { v4 as uuidv4 } from 'uuid';

import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import Loader from './components/Loader';
// import defaultFiles from './utils/defaultFiles';
import { arrToObj, objToArr, timestampToString } from './utils/helper';
import fileHelper from './utils/fileHelper';

import 'easymde/dist/easymde.min.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useIpcRenderer from './hooks/useIpcRenderer';
library.add(
  fab,
  faSearch,
  faTimes,
  faEdit,
  faTrash,
  faPlus,
  faFileImport,
  faCircle
);
const { join, dirname, basename, extname } = require('path');
const fs = require('fs');
const { remote, ipcRenderer } = require('electron');

const Store = require('electron-store');
const fileStore = new Store({ name: 'Files Data' });
const settingsStore = new Store({ name: 'Settings' });

const getAutoSync = () =>
  ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(
    (key) => !!settingsStore.get(key)
  );

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updatedAt } = file;
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt,
    };
    return result;
  }, {});
  fileStore.set('files', filesStoreObj);
};

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const [activeFileId, setActiveFileId] = useState('');
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [unsavedFileIds, setUnsavedFilesIds] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);
  const [inputActive, setInputActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filesArr = objToArr(files);
  const openedFiles = openedFileIds.map((id) => files[id]);
  const activeFile = files[activeFileId];

  const savedLocation =
    settingsStore.get('savedFileLocation') || remote.app.getPath('documents');

  const handleFileClick = (fileID) => {
    setActiveFileId(fileID);
    const { isLoaded, title, path, id } = files[fileID];
    if (!isLoaded) {
      if (getAutoSync()) {
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id });
      } else {
        const value = fileHelper.readFile(path);
        const newFile = { ...files[fileID], body: value, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
      }
    }
    if (!openedFileIds.includes(fileID)) {
      setOpenedFileIds([...openedFileIds, fileID]);
    }
  };

  const handleTabClick = (id) => {
    setActiveFileId(id);
  };

  const handleTabClose = (id) => {
    const _openedFileIds = openedFileIds.filter((fileId) => fileId !== id);
    setOpenedFileIds(_openedFileIds);
    if (_openedFileIds.length) {
      setActiveFileId(_openedFileIds[0]);
    } else {
      setActiveFileId('');
    }
  };

  const handleFileChange = (id, value) => {
    if (value !== files[id].body) {
      const modifiedFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: modifiedFile });

      if (!unsavedFileIds.includes(id)) {
        setUnsavedFilesIds([...unsavedFileIds, id]);
      }
    }
  };

  const handleFileDelete = (id) => {
    const { isNew, path, title } = files[id];
    if (isNew) {
      const { [id]: value, ...afterDelete } = files;
      setFiles(afterDelete);
    } else {
      fileHelper.deleteFile(path);
      const { [id]: value, ...afterDelete } = files;
      setFiles(afterDelete);
      saveFilesToStore(afterDelete);
      if (getAutoSync()) {
        ipcRenderer.send('delete-file', {
          id,
          key: `${title}.md`,
        });
      }
      // close the tab if opened
      if (openedFileIds.includes(id)) {
        handleTabClose(id);
      }
    }
  };

  const handleFileSearch = (searchStr) => {
    const newFiles = filesArr.filter((file) => file.title.includes(searchStr));
    setSearchedFiles(newFiles);
  };

  const handleFileRename = (id, title, isNew) => {
    // newPath should be different based on isNew
    // if isNew is false, path should be old dirname + new title
    const newFileName = `${title}.md`;
    let newPath = '';

    if (isNew) {
      newPath = join(savedLocation, newFileName);
      if (fs.existsSync(newPath)) {
        remote.dialog.showErrorBox(
          'file already exists',
          'file already exists'
        );
        return;
      }
    } else {
      newPath = join(dirname(files[id].path), newFileName);
    }

    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };

    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body);
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    } else {
      //rename
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath);
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    }

    if (getAutoSync()) {
      const oldFileName = `${files[id].title}.md`;
      console.log('newFileName: ', newFileName);
      ipcRenderer.send('rename-file', {
        id,
        srcKey: oldFileName,
        destKey: newFileName,
      });
    }
  };

  const createNewFile = () => {
    const id = uuidv4();
    const newFile = {
      id: id,
      title: '',
      body: '## 请输出 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    };
    setFiles({ ...files, [id]: newFile });
  };

  const saveCurrentFile = () => {
    const { path, body, title } = activeFile;
    fileHelper.writeFile(path, body);
    setUnsavedFilesIds(unsavedFileIds.filter((id) => id !== activeFile.id));
    if (getAutoSync()) {
      ipcRenderer.send('upload-file', { key: `${title}.md`, path });
    }
  };

  const importFiles = () => {
    remote.dialog
      .showOpenDialog({
        title: '选择导入的 Markdown 文件',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Markdown files', extensions: ['md'] }],
      })
      .then(({ filePaths }) => {
        console.log(filePaths);
        if (Array.isArray(filePaths)) {
          // filter out the path we already have in electron store
          // ["/Users/liusha/Desktop/name1.md", "/Users/liusha/Desktop/name2.md"]
          const filteredPaths = filePaths.filter((path) => {
            const title = basename(path, extname(path));
            const alreadyAdded = Object.values(files).find((file) => {
              return file.path === path || file.title === title;
            });
            return !alreadyAdded;
          });
          // extend the path array to an array contains files info
          // [{id: '1', path: '', title: ''}, {}]
          const importFilesArr = filteredPaths.map((path) => {
            return {
              id: uuidv4(),
              title: basename(path, extname(path)),
              path,
            };
          });
          // get the new files object in flattenArr
          const newFiles = { ...files, ...arrToObj(importFilesArr) };
          // setState and update electron store
          setFiles(newFiles);
          saveFilesToStore(newFiles);
          if (importFilesArr.length > 0) {
            return remote.dialog.showMessageBox({
              type: 'info',
              title: `成功导入了${importFilesArr.length}个文件`,
              message: `成功导入了${importFilesArr.length}个文件`,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        remote.dialog.showErrorBox('import failed', `${err}`);
      });
  };

  const activeFileUploaded = () => {
    const { id } = activeFile;
    const modifiedFile = {
      ...files[id],
      isSynced: true,
      updatedAt: new Date().getTime(),
    };
    const newFiles = { ...files, [id]: modifiedFile };
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  const activeFileDownloaded = (event, message) => {
    const currentFile = files[message.id];
    const { id, path } = currentFile;
    const value = fileHelper.readFile(path);
    let newFile;
    if (message.status === 'download-success') {
      newFile = {
        ...files[id],
        body: value,
        isLoaded: true,
        isSynced: true,
        updatedAt: new Date().getTime(),
      };
    } else {
      newFile = { ...files[id], body: value, isLoaded: true };
    }
    const newFiles = { ...files, [id]: newFile };
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  const allFilesDownloaded = (event, message) => {
    console.log('allFilesDownloaded:', message);
    const { status, newDownloadedFiles, updatedFiles } = message;
    if (status === 'download-success') {
      const _newDownloadedFiles = newDownloadedFiles.map((file) => {
        const { key, path } = file;
        return {
          id: uuidv4(),
          title: key.match(/^(\w+).md$/)[1],
          path: path,
          body: fileHelper.readFile(path),
          isLoaded: true,
          isSynced: true,
          updatedAt: new Date().getTime(),
        };
      });
      const _updatedFiles = updatedFiles.length
        ? updatedFiles.map((file) => {
            return {
              ...files[file.id],
              body: fileHelper.readFile(file.path),
              isLoaded: true,
              isSynced: true,
              updatedAt: new Date().getTime(),
            };
          })
        : [];
      const newFiles = arrToObj([..._newDownloadedFiles, ..._updatedFiles]);
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    }
  };

  const filesUploaded = () => {
    const newFiles = objToArr(files).reduce((result, file) => {
      const currentTime = new Date().getTime();
      result[file.id] = {
        ...files[file.id],
        isSynced: true,
        updatedAt: currentTime,
      };
      return result;
    }, {});
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  const fileRenamed = (event, message) => {
    const id = message.id;
    const modifiedFile = {
      ...files[id],
      isSynced: true,
      updatedAt: new Date().getTime(),
    };
    const newFiles = { ...files, [id]: modifiedFile };
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'search-file': () => {
      setInputActive(true);
    },
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'all-downloaded': allFilesDownloaded,
    'files-uploaded': filesUploaded,
    'file-renamed': fileRenamed,
    'loading-status': (message, status) => {
      setIsLoading(status);
    },
  });

  return (
    <div className="container-fluid">
      {isLoading && <Loader />}
      <div className="row no-gutters min-vh-100">
        <div className="col-3">
          <FileSearch
            title="My Document"
            onFileSearch={handleFileSearch}
            inputActive={inputActive}
            setInputActive={setInputActive}
          />
          <FileList
            files={searchedFiles.length ? searchedFiles : filesArr}
            onFileClick={handleFileClick}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
          />
          <div className="d-flex align-items-baseline bottom-btn-group">
            <BottomBtn
              text="新建"
              colorClass="btn-primary"
              icon="plus"
              onBtnClick={createNewFile}
            />
            <BottomBtn
              text="导入"
              colorClass="btn-success"
              icon="file-import"
              onBtnClick={importFiles}
            />
          </div>
        </div>
        <div className="col-9">
          {!activeFile ? (
            <div className="start-page">选择或者创建新的 Markdown 文档</div>
          ) : (
            <>
              <TabList
                files={openedFiles}
                unsavedIds={unsavedFileIds}
                activeId={activeFileId}
                onTabClick={handleTabClick}
                onCloseTab={handleTabClose}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => handleFileChange(activeFile.id, value)}
                options={{
                  minHeight: '85vh',
                }}
              />
              {activeFile.isSynced && (
                <span className="sync-status">
                  已同步，上次同步{timestampToString(activeFile.updatedAt)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
