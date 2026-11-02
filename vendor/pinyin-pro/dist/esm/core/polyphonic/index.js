import { validateType, middleWareNonZh, middlewarePattern, middlewareToneType, middlewareV } from "../pinyin/middlewares.js";
import DICT1 from "../../data/dict1.js";
import { getInitialAndFinal, getFinalPartsFromFinal, getNumOfTone, getFirstLetter } from "../pinyin/handle.js";
import { getCustomPolyphonicDict } from "../custom/index.js";
import { splitString } from "../../common/utils.js";
const DEFAULT_OPTIONS = {
  pattern: "pinyin",
  toneType: "symbol",
  type: "string",
  v: false,
  nonZh: "spaced"
};
function polyphonic(text, options = DEFAULT_OPTIONS) {
  const legal = validateType(text);
  if (!legal) {
    return [];
  }
  if (text === "") {
    return [];
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
  let list = getPolyphonicList(text);
  list = middleWareNonZh(list, options);
  const doubleList = getSplittedPolyphonicList(list);
  const result = [];
  for (const itemList of doubleList) {
    middlewarePattern(itemList, options);
    middlewareToneType(itemList, options);
    middlewareV(itemList, options);
    result.push(handleType(itemList, options));
  }
  return result;
}
const getPolyphonicList = (text) => {
  const customPolyphonicDict = getCustomPolyphonicDict();
  return splitString(text).map((char) => {
    const pinyin = customPolyphonicDict.get(char) || DICT1.get(char) || char;
    return {
      origin: char,
      result: pinyin,
      isZh: pinyin !== char,
      originPinyin: pinyin
    };
  });
};
const getSplittedPolyphonicList = (list) => {
  return list.map((item) => {
    if (!item.isZh) {
      return [item];
    }
    if (!item.result.includes(" ")) {
      return [
        {
          origin: item.origin,
          result: item.result,
          isZh: true,
          originPinyin: item.result
        }
      ];
    }
    return item.result.split(" ").map((pinyin) => ({
      origin: item.origin,
      result: pinyin,
      isZh: true,
      originPinyin: pinyin
    }));
  });
};
const handleType = (list, options) => {
  if (options.type !== "all") {
    const result2 = /* @__PURE__ */ new Set();
    for (const item of list) {
      result2.add(item.result);
    }
    const values = Array.from(result2);
    return options.type === "array" ? values : values.join(" ");
  }
  const result = [];
  for (const item of list) {
    const pinyin = item.isZh ? item.result : "";
    const { initial, final } = getInitialAndFinal(pinyin, options.initialPattern);
    const { head, body, tail } = getFinalPartsFromFinal(final);
    result.push({
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
      inZhRange: !!DICT1.get(item.origin)
    });
  }
  return result;
};
export {
  handleType,
  polyphonic
};
