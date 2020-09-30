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

  const openedFiles = openedFileIds.map((fileId) => {
    return files[fileId];
  });

  const activeFile = files[activeFileId];

  return (
    <div className="container-fluid">
      <div className="row no-gutters min-vh-100">
        <div className="col-3">
          <FileSearch title="My Document" onFileSearch={() => {}} />
          <FileList
            files={files}
            onFileClick={(id) => {
              console.log(id);
            }}
            onFileDelete={(id) => {
              console.log(id);
            }}
            onSaveEdit={(id, value) => {
              console.log(id, value);
            }}
          />
          <div className="d-flex align-items-baseline bottom-btn-group">
            <BottomBtn text="新建" colorClass="btn-primary" icon="plus" />
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
                onTabClick={(id) => {
                  console.log('click tab', id);
                }}
                onCloseTab={(id) => {
                  console.log('close tab', id);
                }}
              />
              <SimpleMDE
                onChange={() => {}}
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
