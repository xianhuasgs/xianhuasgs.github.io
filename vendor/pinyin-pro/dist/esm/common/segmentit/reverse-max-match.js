function isIgnorablePattern(cur, pre) {
  if (pre.index + pre.length <= cur.index) {
    return false;
  }
  if (pre.priority > cur.priority) {
    return false;
  }
  if (pre.priority === cur.priority && pre.length > cur.length) {
    return false;
  }
  return true;
}
function reverseMaxMatch(patterns) {
  const filteredArr = [];
  for (let i = patterns.length - 1; i >= 0; ) {
    const { index } = patterns[i];
    let j = i - 1;
    while (j >= 0 && isIgnorablePattern(patterns[i], patterns[j])) {
      j--;
    }
    if (j < 0 || patterns[j].index + patterns[j].length <= index) {
      filteredArr.push(patterns[i]);
    }
    i = j;
  }
  return filteredArr.reverse();
}
export {
  reverseMaxMatch
};
