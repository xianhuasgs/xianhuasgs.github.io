import { getNumOfTone, getPinyinWithoutTone } from "../pinyin/handle.js";
const DefaultConvertOptions = {
  separator: " ",
  format: "numToSymbol"
};
const toneMap = {
  a: ["a", "ā", "á", "ǎ", "à"],
  o: ["o", "ō", "ó", "ǒ", "ò"],
  e: ["e", "ē", "é", "ě", "è"],
  ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
  v: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
  ui: ["ui", "uī", "uí", "uǐ", "uì"],
  iu: ["iu", "iū", "iú", "iǔ", "iù"],
  i: ["i", "ī", "í", "ǐ", "ì"],
  u: ["u", "ū", "ú", "ǔ", "ù"],
  n: ["n", "n̄", "ń", "ň", "ǹ"],
  m: ["m", "m̄", "ḿ", "m̌", "m̀"],
  ê: ["ê", "ê̄", "ế", "ê̌", "ề"]
};
function convert(pinyin, options) {
  options = Object.assign(Object.assign({}, DefaultConvertOptions), options || {});
  const originType = typeof pinyin;
  if (typeof pinyin === "string") {
    pinyin = pinyin.split(options.separator);
  }
  pinyin = pinyin.map((item) => {
    const format = options.format;
    if (format === "numToSymbol") {
      return formatNumToSymbol(item);
    } else if (format === "symbolToNum") {
      return formatSymbolToNum(item);
    } else if (format === "toneNone") {
      return formatToneNone(item);
    }
    return item;
  });
  if (originType === "string") {
    return pinyin.join(options.separator);
  } else {
    return pinyin;
  }
}
function formatNumToSymbol(pinyin) {
  let suffixR = "";
  if (pinyin.length > 2 && pinyin.endsWith("r")) {
    const secondToLast = Number(pinyin[pinyin.length - 2]);
    if (secondToLast >= 0 && secondToLast <= 4) {
      suffixR = "r";
      pinyin = pinyin.slice(0, -1);
    }
  }
  const lastChar = Number(pinyin[pinyin.length - 1]);
  if (lastChar >= 0 && lastChar <= 4) {
    for (let key in toneMap) {
      if (pinyin.includes(key)) {
        return pinyin.slice(0, pinyin.length - 1).replace(key, toneMap[key][lastChar]) + suffixR;
      }
    }
    return pinyin + suffixR;
  } else {
    return pinyin + suffixR;
  }
}
function formatSymbolToNum(pinyin) {
  if (pinyin.endsWith("r") && pinyin.length > 1 && !/^[eēéěè]r$/.test(pinyin)) {
    const pinyinWithoutR = pinyin.slice(0, -1);
    const toneNum = getNumOfTone(pinyinWithoutR);
    if (toneNum !== "" && toneNum !== "0") {
      return `${getPinyinWithoutTone(pinyinWithoutR)}${toneNum}r`;
    }
  }
  return `${getPinyinWithoutTone(pinyin)}${getNumOfTone(pinyin)}`;
}
function formatToneNone(pinyin) {
  return getPinyinWithoutTone(pinyin);
}
export {
  convert
};
