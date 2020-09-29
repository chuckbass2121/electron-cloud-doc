import React from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faSearch,
  faTimes,
  faEdit,
  faTrash,
  faPlus,
  faFileImport,
} from '@fortawesome/free-solid-svg-icons';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import defaultFiles from './utils/defaultFiles';

library.add(fab, faSearch, faTimes, faEdit, faTrash, faPlus, faFileImport);

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-5">
          <FileSearch title="My Document" onFileSearch={() => {}} />
          <FileList
            files={defaultFiles}
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
          <div className="d-flex align-items-baseline">
            <BottomBtn text="新建" colorClass="btn-primary" icon="plus" />
            <BottomBtn
              text="导入"
              colorClass="btn-success"
              icon="file-import"
            />
          </div>
        </div>
        <div className="col-5">right</div>
      </div>
    </div>
  );
}

export default App;
