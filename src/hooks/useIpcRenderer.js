import { useEffect } from 'react';
const { ipcRenderer } = require('electron');

function useIpcRenderer(obj) {
  useEffect(() => {
    Object.keys(obj).forEach((key) => {
      ipcRenderer.on(key, obj[key]);
    });

    return () => {
      Object.keys(obj).forEach((key) => {
        ipcRenderer.removeListener(key, obj[key]);
      });
    };
  });
}

export default useIpcRenderer;
