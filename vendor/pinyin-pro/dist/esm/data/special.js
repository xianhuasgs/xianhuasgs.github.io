import { Priority } from "../common/constant.js";
import { stringLength } from "../common/utils.js";
const InitialList = [
  "zh",
  "ch",
  "sh",
  "z",
  "c",
  "s",
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "k",
  "h",
  "j",
  "q",
  "x",
  "r",
  "y",
  "w",
  ""
];
const SpecialInitialList = ["j", "q", "x"];
const SpecialFinalList = [
  "uān",
  "uán",
  "uǎn",
  "uàn",
  "uan",
  "uē",
  "ué",
  "uě",
  "uè",
  "ue",
  "ūn",
  "ún",
  "ǔn",
  "ùn",
  "un",
  "ū",
  "ú",
  "ǔ",
  "ù",
  "u"
];
const SpecialFinalMap = {
  uān: "üān",
  uán: "üán",
  uǎn: "üǎn",
  uàn: "üàn",
  uan: "üan",
  uē: "üē",
  ué: "üé",
  uě: "üě",
  uè: "üè",
  ue: "üe",
  ūn: "ǖn",
  ún: "ǘn",
  ǔn: "ǚn",
  ùn: "ǜn",
  un: "ün",
  ū: "ǖ",
  ú: "ǘ",
  ǔ: "ǚ",
  ù: "ǜ",
  u: "ü"
};
const doubleFinalList = [
  "ia",
  "ian",
  "iang",
  "iao",
  "ie",
  "iu",
  "iong",
  "ua",
  "uai",
  "uan",
  "uang",
  "ue",
  "ui",
  "uo",
  "üan",
  "üe",
  "van",
  "ve"
];
const Numbers = {
  一: "yì",
  二: "èr",
  三: "sān",
  四: "sì",
  五: "wǔ",
  六: "liù",
  七: "qī",
  八: "bā",
  九: "jiǔ",
  十: "shí",
  百: "bǎi",
  千: "qiān",
  万: "wàn",
  亿: "yì",
  单: "dān",
  两: "liǎng",
  双: "shuāng",
  多: "duō",
  几: "jǐ",
  十一: "shí yī",
  零一: "líng yī",
  第一: "dì yī",
  一十: "yī shí",
  一十一: "yī shí yī"
};
const NumberWordMap = {
  重: "chóng",
  行: "háng",
  斗: "dǒu",
  更: "gēng"
};
function genNumberDict() {
  const dict = {
    零一: "líng yī",
    "〇一": "líng yī",
    十一: "shí yī",
    一十: "yī shí",
    第一: "dì yī",
    一十一: "yī shí yī"
  };
  for (let number in Numbers) {
    for (let key in NumberWordMap) {
      const word = `${number}${key}`;
      const pinyin = `${Numbers[number]} ${NumberWordMap[key]}`;
      dict[word] = pinyin;
    }
  }
  return dict;
}
const NumberDict = genNumberDict();
const PatternNumberDict = Object.keys(NumberDict).map((key) => ({
  zh: key,
  pinyin: NumberDict[key],
  probability: 1e-12,
  length: stringLength(key),
  priority: Priority.Normal,
  dict: /* @__PURE__ */ Symbol("rule")
}));
const toneSandhiMap = {
  // 说不说，说一说，叠词之间发音为轻声
  不: {
    bú: [4]
    // "不" 后面跟 4 声时，变调为 2 声
  },
  一: {
    yí: [4],
    yì: [1, 2, 3]
  }
};
const toneSandhiIgnoreSuffix = {
  不: ["的", "而", "之", "后", "也", "还", "地"],
  一: ["的", "而", "之", "后", "也", "还", "是"]
};
const toneSandhiList = Object.keys(toneSandhiMap);
export {
  InitialList,
  PatternNumberDict,
  SpecialFinalList,
  SpecialFinalMap,
  SpecialInitialList,
  doubleFinalList,
  toneSandhiIgnoreSuffix,
  toneSandhiList,
  toneSandhiMap
};
