import { pinyin } from "../pinyin/index.js";
const DefaultHtmlOptions = {
  resultClass: "py-result-item",
  chineseClass: "py-chinese-item",
  pinyinClass: "py-pinyin-item",
  nonChineseClass: "py-non-chinese-item",
  wrapNonChinese: false,
  toneType: "symbol",
  customClassMap: {},
  toneSandhi: true,
  rp: true,
  v: false,
  traditional: false
};
const html = (text, options) => {
  const completeOptions = Object.assign(Object.assign({}, DefaultHtmlOptions), options || {});
  const pinyinArray = pinyin(text, Object.assign({ type: "all" }, completeOptions));
  const result = pinyinArray.map((item) => {
    let additionalClass = "";
    for (const classname in completeOptions.customClassMap) {
      const dict = completeOptions.customClassMap[classname];
      if (dict.includes(item.origin)) {
        additionalClass += ` ${classname}`;
      }
    }
    if (item.isZh) {
      const resultClass = completeOptions.resultClass || DefaultHtmlOptions.resultClass;
      const chineseClass = completeOptions.chineseClass || DefaultHtmlOptions.chineseClass;
      const pinyinClass = completeOptions.pinyinClass || DefaultHtmlOptions.pinyinClass;
      return `<span class="${resultClass}${additionalClass}"><ruby><span class="${chineseClass}">${item.origin}</span>${completeOptions.rp ? "<rp>(</rp>" : ""}<rt class="${pinyinClass}">${item.pinyin}</rt>${completeOptions.rp ? "<rp>)</rp>" : ""}</ruby></span>`;
    } else {
      if (completeOptions.wrapNonChinese) {
        const nonChineseClass = completeOptions.nonChineseClass || DefaultHtmlOptions.nonChineseClass;
        return `<span class="${nonChineseClass}${additionalClass}">${item.origin}</span>`;
      } else {
        return item.origin;
      }
    }
  });
  return result.join("");
};
export {
  html
};
