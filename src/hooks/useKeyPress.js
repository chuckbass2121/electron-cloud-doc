import { useState, useEffect } from 'react';

function useKeyPress(targetKeyCode) {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const keyDownHandler = ({ keyCode }) => {
      if (targetKeyCode === keyCode) {
        setPressed(true);
      }
    };

    const keyUpHandler = ({ keyCode }) => {
      if (targetKeyCode === keyCode) {
        setPressed(false);
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, [targetKeyCode]);

  return pressed;
}

export default useKeyPress;
