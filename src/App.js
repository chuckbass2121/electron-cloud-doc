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

import 'easymde/dist/easymde.min.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import defaultFiles from './utils/defaultFiles';

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

function App() {
  const [files, setFiles] = useState(defaultFiles);
  const [activeFileId, setActiveFileId] = useState('');
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [unsavedFileIds, setUnsavedFilesIds] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);

  let openedFiles = [];
  openedFileIds.forEach((fileId) => {
    const file = files.find((file) => file.id === fileId);
    if (file) {
      openedFiles.push(file);
    }
  });

  const activeFile = files.find((file) => file.id === activeFileId);

  const handleFileClick = (id) => {
    setActiveFileId(id);
    if (!openedFileIds.includes(id)) {
      setOpenedFileIds([...openedFileIds, id]);
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
    const newFiles = files.map((file) => {
      if (file.id === id) {
        file.body = value;
      }
      return file;
    });
    setFiles(newFiles);

    if (!unsavedFileIds.includes(id)) {
      setUnsavedFilesIds([...unsavedFileIds, id]);
    }
  };

  const handleFileDelete = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
    if (openedFileIds.includes(id)) {
      handleTabClose(id);
    }
  };

  const handleFileSearch = (searchStr) => {
    const newFiles = files.filter((file) => file.title.includes(searchStr));
    setSearchedFiles(newFiles);
  };

  const handleSaveEdit = (id, value) => {
    const newFiles = files.map((file) => {
      if (file.id === id) {
        file.title = value;
      }
      return file;
    });
    setFiles(newFiles);
  };

  const createNewFile = () => {
    const newFiles = [
      ...files,
      {
        id: uuidv4(),
        title: '',
        body: '## 请输出 Markdown',
        createdAt: new Date().getTime(),
        isNew: true,
      },
    ];
    setFiles(newFiles);
  };

  return (
    <div className="container-fluid">
      <div className="row no-gutters min-vh-100">
        <div className="col-3">
          <FileSearch title="My Document" onFileSearch={handleFileSearch} />
          <FileList
            files={searchedFiles.length ? searchedFiles : files}
            onFileClick={handleFileClick}
            onFileDelete={handleFileDelete}
            onSaveEdit={handleSaveEdit}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
