import { splitString } from "../../common/utils.js";
import { validateType, middlewareToneSandhi, middleWareNonZh, middlewareToneType, middlewareV } from "../pinyin/middlewares.js";
import { getPinyin } from "../pinyin/handle.js";
import { OutputFormat, middlewareSegment, middlewareOutputFormat } from "./middlewares.js";
const DEFAULT_OPTIONS = {
  toneType: "symbol",
  mode: "normal",
  nonZh: "spaced",
  v: false,
  separator: " ",
  toneSandhi: true,
  segmentit: 2,
  format: OutputFormat.AllSegment,
  traditional: false
};
function segment(word, options) {
  options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options || {});
  const legal = validateType(word);
  if (!legal) {
    return word;
  }
  if (options.surname === void 0) {
    if (options.mode === "surname") {
      options.surname = "all";
    } else {
      options.surname = "off";
    }
  }
  const zhChars = splitString(word);
  let _list = Array(zhChars.length);
  let { list, matches } = getPinyin(word, _list, options.surname, options.segmentit, options.traditional, zhChars);
  list = middlewareToneSandhi(list, options.toneSandhi);
  list = middleWareNonZh(list, options);
  middlewareToneType(list, options);
  middlewareV(list, options);
  const segments = middlewareSegment(list, matches);
  return middlewareOutputFormat(segments, { format: options.format, separator: options.separator });
}
export {
  OutputFormat,
  segment
};
