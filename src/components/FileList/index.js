import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useKeyPress from '../../hooks/useKeyPress';
// import './index.css';

function FileList(props) {
  const { files, onFileClick, onSaveEdit, onFileDelete } = props;
  const [editId, setEditId] = useState('');
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);

  const handleEdit = (file) => {
    setEditId(file.id);
    setValue(file.title);
  };

  const closeSearch = () => {
    setEditId('');
    setValue('');
  };

  useEffect(() => {
    const editItem = files.find((file) => file.id === editId);
    if (enterPressed && editId) {
      onSaveEdit(editItem.id, value);
      setEditId('');
      setValue('');
    }
    if (escPressed && editId) {
      closeSearch(editItem);
    }
  });

  return (
    <ul className="list-group list-group-flush">
      {files.map((file) => (
        <li
          className="list-group-item bg-light row d-flex align-items-center no-gutters"
          key={file.id}
        >
          {file.id !== editId && (
            <>
              <span className="col-2">
                <FontAwesomeIcon icon={['fab', 'markdown']} />
              </span>
              <span
                className="col-8"
                onClick={() => {
                  onFileClick(file.id);
                }}
              >
                {file.title}
              </span>
              <span className="col-1" onClick={() => handleEdit(file)}>
                <FontAwesomeIcon icon="edit" />
              </span>
              <span className="col-1" onClick={() => onFileDelete(file.id)}>
                <FontAwesomeIcon icon="trash" />
              </span>
            </>
          )}
          {file.id === editId && (
            <>
              <input
                className="form-control col-10"
                ref={inputRef}
                value={value}
                placeholder="请输入文件名称"
                onChange={(e) => {
                  setValue(e.target.value);
                }}
              />
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  closeSearch(file);
                }}
              >
                <FontAwesomeIcon title="关闭" size="lg" icon="times" />
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

FileList.propTypes = {
  files: PropTypes.array.isRequired,
  onFileClick: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
};

export default FileList;
