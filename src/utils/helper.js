export const arrToObj = (arr) => {
  return arr.reduce((prev, curr) => {
    prev[curr.id] = curr;
    return prev;
  }, {});
};

export const objToArr = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};

export const getParentNode = (node, parentClassName) => {
  let current = node;
  while (current !== null) {
    if (current.classList.contains(parentClassName)) {
      return current;
    }
    current = current.parentNode;
  }
  return false;
};

export const timestampToString = (timeStamp) => {
  const date = new Date(timeStamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
