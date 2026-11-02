import { acTree, ensureAcBuilt } from "../../common/segmentit/index.js";
import { Priority } from "../../common/constant.js";
import { stringLength, splitString } from "../../common/utils.js";
import DICT1 from "../../data/dict1.js";
import { customMultipleDict, customPolyphonicDict } from "./state.js";
let customDict = {};
const CustomDictName = /* @__PURE__ */ Symbol("custom");
function rebuildCustomPatterns() {
  const customPatterns = Object.keys(customDict).map((word) => ({
    zh: word,
    pinyin: customDict[word],
    probability: 1 + stringLength(word),
    length: stringLength(word),
    priority: Priority.Custom,
    dict: CustomDictName
  }));
  acTree.removeDict(CustomDictName);
  acTree.build(customPatterns);
}
function customPinyin(config = {}, options) {
  ensureAcBuilt();
  const words = Object.keys(config).sort((word1, word2) => stringLength(word2) - stringLength(word1));
  words.forEach((word) => {
    customDict[word] = config[word];
  });
  if (words.length) {
    acTree.setPendingBuild(rebuildCustomPatterns);
  }
  if (options === null || options === void 0 ? void 0 : options.multiple) {
    addCustomConfigToDict(config, customMultipleDict, options.multiple);
  }
  if (options === null || options === void 0 ? void 0 : options.polyphonic) {
    addCustomConfigToDict(config, customPolyphonicDict, options.polyphonic);
  }
}
function addCustomConfigToDict(config, dict, handleType) {
  for (let word in config) {
    const pinyins = config[word];
    const pinyinList = pinyins.split(" ");
    splitString(word).forEach((char, index) => {
      const pinyin = pinyinList[index] || "";
      const current = dict.get(char);
      const base = current || DICT1.get(char);
      if (handleType === "replace" || handleType === "add" && !base) {
        dict.set(char, pinyin);
      } else {
        const merged = base;
        if (!current) {
          dict.set(char, merged);
        }
        if (!merged.split(" ").includes(pinyin)) {
          dict.set(char, `${merged} ${pinyin}`.trim());
        }
      }
    });
  }
}
const getCustomPolyphonicDict = () => {
  return customPolyphonicDict;
};
function clearCustomDict(dict) {
  if (dict === "pinyin" || dict.indexOf("pinyin") !== -1) {
    Object.keys(customDict).forEach(function(word) {
      delete customDict[word];
    });
    acTree.clearPendingBuild();
    acTree.removeDict(CustomDictName);
  }
  if (dict === "multiple" || dict.indexOf("multiple") !== -1) {
    customMultipleDict.clear();
  }
  if (dict === "polyphonic" || dict.indexOf("polyphonic") !== -1) {
    customPolyphonicDict.clear();
  }
}
export {
  clearCustomDict,
  customPinyin,
  getCustomPolyphonicDict
};
