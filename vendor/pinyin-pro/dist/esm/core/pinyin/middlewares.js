import { stringLength } from "../../common/utils.js";
import { getMultiplePinyin, getFinalParts, getFirstLetter, getInitialAndFinal, getNumOfTone, getPinyinWithNum, getPinyinWithoutTone, getFinalPartsFromFinal } from "./handle.js";
import DICT1 from "../../data/dict1.js";
import { getAllPinyin } from "./all.js";
const validateType = (word) => {
  if (typeof word !== "string") {
    console.error("The first param of pinyin is error: " + word + ' is not assignable to type "string".');
    return false;
  } else {
    return true;
  }
};
function isNonZhScope(char, scope) {
  if (scope instanceof RegExp) {
    if (scope.global || scope.sticky) {
      scope.lastIndex = 0;
    }
    return scope.test(char);
  }
  return true;
}
const middleWareNonZh = (list, options) => {
  let nonZh = options.nonZh;
  if (nonZh === "removed") {
    return list.filter((item) => item.isZh || !isNonZhScope(item.origin, options.nonZhScope));
  } else if (nonZh === "consecutive") {
    for (let i = list.length - 2; i >= 0; i--) {
      const cur = list[i];
      const pre = list[i + 1];
      if (!cur.isZh && !pre.isZh && isNonZhScope(cur.origin, options.nonZhScope) && isNonZhScope(pre.origin, options.nonZhScope)) {
        cur.origin += pre.origin;
        cur.result += pre.result;
        pre.delete = true;
      }
    }
    return list.filter((item) => !item.delete);
  } else {
    return list;
  }
};
const middlewareMultiple = (word, options) => {
  if (options.multiple && stringLength(word) === 1) {
    return getMultiplePinyin(word, options.surname);
  } else {
    return false;
  }
};
const middlewarePattern = (list, options) => {
  switch (options.pattern) {
    case "pinyin":
      break;
    case "num":
      list.forEach((item) => {
        item.result = item.isZh ? getNumOfTone(item.result) : "";
      });
      break;
    case "initial":
      list.forEach((item) => {
        item.result = item.isZh ? getInitialAndFinal(item.result, options.initialPattern).initial : "";
      });
      break;
    case "final":
      list.forEach((item) => {
        item.result = item.isZh ? getInitialAndFinal(item.result, options.initialPattern).final : "";
      });
      break;
    case "first":
      list.forEach((item) => {
        item.result = getFirstLetter(item.result, item.isZh);
      });
      break;
    case "finalHead":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).head : "";
      });
      break;
    case "finalBody":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).body : "";
      });
      break;
    case "finalTail":
      list.forEach((item) => {
        item.result = item.isZh ? getFinalParts(item.result).tail : "";
      });
      break;
  }
};
const middlewareToneType = (list, options) => {
  switch (options.toneType) {
    case "symbol":
      break;
    case "none":
      list.forEach((item) => {
        if (item.isZh) {
          item.result = getPinyinWithoutTone(item.result);
        }
      });
      break;
    case "num": {
      list.forEach((item) => {
        if (item.isZh) {
          item.result = getPinyinWithNum(item.result, item.originPinyin);
        }
      });
      break;
    }
  }
};
const middlewareV = (list, options) => {
  if (options.v) {
    list.forEach((item) => {
      if (item.isZh) {
        item.result = item.result.replace(/ü/g, typeof options.v === "string" ? options.v : "v");
      }
    });
  }
};
const middlewareType = (list, options, word) => {
  if (options.multiple && stringLength(word) === 1) {
    let last = "";
    list = list.filter((item) => {
      const res = item.result !== last;
      last = item.result;
      return res;
    });
  }
  if (options.type === "array") {
    return list.map((item) => item.result);
  }
  if (options.type === "all") {
    return list.map((item) => {
      const pinyin = item.isZh ? item.result : "";
      const { initial, final } = getInitialAndFinal(pinyin, options.initialPattern);
      const { head, body, tail } = getFinalPartsFromFinal(final);
      let polyphonic = [];
      if (pinyin !== "") {
        polyphonic = [pinyin].concat(getAllPinyin(item.origin, options.surname).filter((item2) => item2 !== pinyin));
      }
      return {
        origin: item.origin,
        pinyin,
        initial,
        final,
        first: getFirstLetter(item.result, item.isZh),
        finalHead: head,
        finalBody: body,
        finalTail: tail,
        num: Number(getNumOfTone(item.originPinyin)),
        isZh: item.isZh,
        polyphonic,
        inZhRange: !!DICT1.get(item.origin),
        result: item.result
      };
    });
  }
  return list.map((item) => item.result).join(options.separator);
};
const thirdToneToSecondToneMap = {
  ǎ: "á",
  ǒ: "ó",
  ě: "é",
  ǐ: "í",
  ǔ: "ú",
  ǚ: "ǘ",
  ň: "ń",
  "m̌": "ḿ",
  "ê̌": "ế"
};
const thirdTonePattern = /ǎ|ǒ|ě|ǐ|ǔ|ǚ|ň|m̌|ê̌/;
const isThirdTone = (item) => item.isZh && thirdTonePattern.test(item.result);
const convertThirdToneToSecondTone = (pinyin) => {
  return pinyin.replace(thirdTonePattern, (thirdTone) => thirdToneToSecondToneMap[thirdTone]);
};
const resolveToneSandhi = (toneSandhi) => {
  var _a, _b, _c;
  if (toneSandhi === false) {
    return { yi: false, bu: false, thirdTone: false };
  }
  if (toneSandhi && typeof toneSandhi === "object") {
    return {
      yi: (_a = toneSandhi.yi) !== null && _a !== void 0 ? _a : true,
      bu: (_b = toneSandhi.bu) !== null && _b !== void 0 ? _b : true,
      thirdTone: (_c = toneSandhi.thirdTone) !== null && _c !== void 0 ? _c : false
    };
  }
  return { yi: true, bu: true, thirdTone: false };
};
const applyThirdToneSandhi = (list) => {
  for (let start = 0; start < list.length; ) {
    if (!isThirdTone(list[start])) {
      start += 1;
      continue;
    }
    let end = start + 1;
    while (end < list.length && isThirdTone(list[end])) {
      end += 1;
    }
    if (end - start === 2) {
      const pinyin = convertThirdToneToSecondTone(list[start].result);
      list[start].result = pinyin;
      list[start].originPinyin = pinyin;
    }
    start = end;
  }
};
const middlewareToneSandhi = (list, toneSandhi) => {
  const { yi, bu, thirdTone } = resolveToneSandhi(toneSandhi);
  if (thirdTone) {
    applyThirdToneSandhi(list);
  }
  if (!yi || !bu) {
    list.forEach((item) => {
      if (!yi && item.origin === "一") {
        item.result = item.originPinyin = "yī";
      } else if (!bu && item.origin === "不") {
        item.result = item.originPinyin = "bù";
      }
    });
  }
  return list;
};
export {
  isNonZhScope,
  middleWareNonZh,
  middlewareMultiple,
  middlewarePattern,
  middlewareToneSandhi,
  middlewareToneType,
  middlewareType,
  middlewareV,
  validateType
};
