export const arrToObj = (arr) => {
  return arr.reduce((prev, curr) => {
    prev[curr.id] = curr;
    return prev;
  }, {});
};

export const objToArr = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};
