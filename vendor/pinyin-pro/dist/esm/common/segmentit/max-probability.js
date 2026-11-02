import { Priority } from "../constant.js";
function getMaxProbability(a, b) {
  if (!a) {
    return b;
  }
  if (a.decimal < b.decimal) {
    return a;
  } else if (a.decimal === b.decimal) {
    return a.probability > b.probability ? a : b;
  } else {
    return b;
  }
}
function checkDecimal(prob) {
  if (prob.probability < 1e-300) {
    prob.probability *= 1e300;
    prob.decimal += 1;
  }
}
function getPatternDecimal(pattern) {
  if (pattern.priority === Priority.Custom) {
    return -(pattern.length * pattern.length * 100);
  }
  if (pattern.priority === Priority.Surname) {
    return -(pattern.length * pattern.length * 10);
  }
  return 0;
}
function maxProbability(patterns, length) {
  const dp = [];
  const terminalDP = {
    probability: 1,
    decimal: 0,
    nextIndex: length
  };
  let patternIndex = patterns.length - 1;
  let pattern = patterns[patternIndex];
  for (let i = length - 1; i >= 0; i--) {
    const suffixDP = i + 1 >= length ? terminalDP : dp[i + 1];
    const nextIndex = suffixDP.pattern ? i + 1 : suffixDP.nextIndex;
    while (pattern && pattern.index + pattern.length - 1 === i) {
      const startIndex = pattern.index;
      const curDP = {
        probability: pattern.probability * suffixDP.probability,
        decimal: suffixDP.decimal + getPatternDecimal(pattern),
        pattern,
        nextIndex
      };
      checkDecimal(curDP);
      dp[startIndex] = getMaxProbability(dp[startIndex], curDP);
      pattern = patterns[--patternIndex];
    }
    const iDP = {
      probability: 1e-13 * suffixDP.probability,
      decimal: 0,
      nextIndex
    };
    checkDecimal(iDP);
    dp[i] = getMaxProbability(dp[i], iDP);
  }
  const result = [];
  let index = 0;
  while (index < length) {
    const item = dp[index];
    if (item.pattern) {
      result.push(item.pattern);
    }
    index = item.nextIndex;
  }
  return result;
}
export {
  maxProbability
};
