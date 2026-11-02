import { splitString } from "../../common/utils.js";
import { getPinyin } from "./handle.js";
import { validateType, middlewareToneSandhi, middleWareNonZh, middlewareMultiple, middlewarePattern, middlewareToneType, middlewareV, middlewareType } from "./middlewares.js";
const DEFAULT_OPTIONS = {
  pattern: "pinyin",
  toneType: "symbol",
  type: "string",
  multiple: false,
  mode: "normal",
  removeNonZh: false,
  nonZh: "spaced",
  v: false,
  separator: " ",
  toneSandhi: true,
  segmentit: 2
};
function pinyin(word, options) {
  options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options || {});
  const legal = validateType(word);
  if (!legal) {
    return word;
  }
  if (word === "") {
    return options.type === "array" || options.type === "all" ? [] : "";
  }
  if (options.surname === void 0) {
    if (options.mode === "surname") {
      options.surname = "all";
    } else {
      options.surname = "off";
    }
  }
  if (options.type === "all") {
    options.pattern = "pinyin";
  }
  if (options.pattern === "num") {
    options.toneType = "none";
  }
  if (options.removeNonZh) {
    options.nonZh = "removed";
  }
  const zhChars = splitString(word);
  let _list = Array(zhChars.length);
  let { list } = getPinyin(word, _list, options.surname, options.segmentit, options.traditional, zhChars);
  list = middlewareToneSandhi(list, options.toneSandhi);
  list = middleWareNonZh(list, options);
  const multipleList = middlewareMultiple(word, options);
  if (multipleList) {
    list = multipleList;
  }
  middlewarePattern(list, options);
  middlewareToneType(list, options);
  middlewareV(list, options);
  return middlewareType(list, options, word);
}
export {
  pinyin
};
