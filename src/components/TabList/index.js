import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './index.scss';

function TabList(props) {
  const { files, activeId, unsavedIds, onTabClick, onCloseTab } = props;
  const handleClickTab = (e, id) => {
    e.preventDefault();
    onTabClick(id);
  };
  const handleCloseTab = (e, id) => {
    e.stopPropagation();
    onCloseTab(id);
  };

  return (
    <ul className="nav nav-pills tab-list">
      {files.map((file) => {
        const isActive = file.id === activeId;
        const unSaved = unsavedIds.includes(file.id);

        return (
          <li className="nav-item" key={file.id}>
            <a
              className={classNames('nav-link', {
                active: isActive,
                unsaved: unSaved,
              })}
              href="/#"
              onClick={(e) => {
                handleClickTab(e, file.id);
              }}
            >
              {file.title}
              <FontAwesomeIcon
                icon="times"
                className="ml-1 close-icon"
                onClick={(e) => {
                  handleCloseTab(e, file.id);
                }}
              />
              {unSaved && (
                <FontAwesomeIcon
                  icon="circle"
                  className="ml-1 unsaved-icon"
                  color="red"
                />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsavedIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func,
};

export default TabList;
