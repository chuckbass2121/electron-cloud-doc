import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useKeyPress from '../../hooks/useKeyPress';
import './index.css';

function FileSearch(props) {
  const { title, onFileSearch, inputActive, setInputActive } = props;

  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);

  const closeSearch = () => {
    setInputActive(false);
    setValue('');
    onFileSearch(false);
  };

  useEffect(() => {
    if (inputActive) {
      inputRef.current.focus();
    }
  }, [inputActive]);

  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value);
    }
    if (escPressed && inputActive) {
      closeSearch();
    }
  });

  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
      {!inputActive && (
        <>
          <span>{title}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setInputActive(true);
            }}
          >
            <FontAwesomeIcon icon="search" />
          </button>
        </>
      )}
      {inputActive && (
        <>
          <input
            className="form-control"
            type="text"
            value={value}
            ref={inputRef}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
          <button type="button" className="icon-button" onClick={closeSearch}>
            <FontAwesomeIcon icon="times" />
          </button>
        </>
      )}
    </div>
  );
}

FileSearch.propTypes = {
  title: PropTypes.string.isRequired,
  onFileSearch: PropTypes.func.isRequired,
  inputActive: PropTypes.bool.isRequired,
  setInputActive: PropTypes.func.isRequired,
};

export default FileSearch;
