import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function BottomBtn(props) {
  const { text, colorClass, icon, onBtnClick } = props;

  return (
    <button
      type="button"
      className={`btn btn-block border-0 ${colorClass}`}
      onClick={onBtnClick}
    >
      <FontAwesomeIcon icon={icon} />
      {text}
    </button>
  );
}

BottomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.string,
  onBtnClick: PropTypes.func,
};

export default BottomBtn;
