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
import { arrToObj, objToArr } from './utils/helper';

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
  const [files, setFiles] = useState(arrToObj(defaultFiles));
  const [activeFileId, setActiveFileId] = useState('');
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [unsavedFileIds, setUnsavedFilesIds] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);

  const filesArr = objToArr(files);
  const openedFiles = openedFileIds.map((id) => files[id]);
  const activeFile = files[activeFileId];

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
    const modifiedFile = { ...files[id], body: value };
    setFiles({ ...files, [id]: modifiedFile });

    if (!unsavedFileIds.includes(id)) {
      setUnsavedFilesIds([...unsavedFileIds, id]);
    }
  };

  const handleFileDelete = (id) => {
    const newFiles = filesArr.filter((file) => file.id !== id);
    setFiles(arrToObj(newFiles));
    if (openedFileIds.includes(id)) {
      handleTabClose(id);
    }
  };

  const handleFileSearch = (searchStr) => {
    const newFiles = filesArr.filter((file) => file.title.includes(searchStr));
    setSearchedFiles(newFiles);
  };

  const handleSaveEdit = (id, value) => {
    const modifiedFile = { ...files[id], title: value, isNew: false };
    setFiles({ ...files, [id]: modifiedFile });
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

  return (
    <div className="container-fluid">
      <div className="row no-gutters min-vh-100">
        <div className="col-3">
          <FileSearch title="My Document" onFileSearch={handleFileSearch} />
          <FileList
            files={searchedFiles.length ? searchedFiles : filesArr}
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
