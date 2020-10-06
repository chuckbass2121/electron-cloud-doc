import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useKeyPress from '../../hooks/useKeyPress';
import useContextMenu from '../../hooks/useContextMenu';
import { getParentNode } from '../../utils/helper';

function FileList(props) {
  const { files, onFileClick, onFileRename, onFileDelete } = props;
  const [editId, setEditId] = useState('');
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);

  const closeSearch = useCallback(
    (editItem) => {
      setEditId('');
      setValue('');
      if (editItem.isNew) {
        onFileDelete(editItem.id);
      }
    },
    [onFileDelete]
  );

  useEffect(() => {
    const editItem = files.find((file) => file.id === editId);
    if (enterPressed && editId && value.trim() !== '') {
      onFileRename(editItem.id, value, editItem.isNew);
      setEditId('');
      setValue('');
    }
    if (escPressed && editId) {
      closeSearch(editItem);
    }
  }, [
    files,
    enterPressed,
    editId,
    escPressed,
    onFileRename,
    value,
    closeSearch,
  ]);

  useEffect(() => {
    const newFile = files.find((file) => file.isNew);
    if (newFile) {
      setEditId(newFile.id);
      setValue(newFile.title);
    }
  }, [files]);

  useEffect(() => {
    if (editId) {
      inputRef.current.focus();
    }
  }, [editId]);

  const clickedItem = useContextMenu(
    [
      {
        label: '打开',
        click: () => {
          const parentElement = getParentNode(
            clickedItem.current,
            'file-list-item'
          );
          if (parentElement) {
            onFileClick(parentElement.dataset.id);
          }
        },
      },
      {
        label: '重命名',
        click: () => {
          const parentElement = getParentNode(
            clickedItem.current,
            'file-list-item'
          );
          if (parentElement) {
            const { id, title } = parentElement.dataset;
            setEditId(id);
            setValue(title);
          }
        },
      },
      {
        label: '删除',
        click: () => {
          const parentElement = getParentNode(
            clickedItem.current,
            'file-list-item'
          );
          if (parentElement) {
            onFileDelete(parentElement.dataset.id);
          }
        },
      },
    ],
    '.file-list',
    files
  );

  return (
    <ul className="list-group list-group-flush file-list">
      {files.map((file) => (
        <li
          className="list-group-item bg-light row d-flex align-items-center no-gutters file-list-item"
          key={file.id}
          data-id={file.id}
          data-title={file.title}
        >
          {file.id === editId || file.isNew ? (
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
          ) : (
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
  onFileRename: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
};

export default FileList;
