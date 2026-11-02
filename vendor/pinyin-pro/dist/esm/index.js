import { getFinalParts, getInitialAndFinal, getNumOfTone } from "./core/pinyin/handle.js";
import { pinyin } from "./core/pinyin/index.js";
import { clearCustomDict, customPinyin } from "./core/custom/index.js";
import { addDict, removeDict } from "./core/dict/index.js";
import { match } from "./core/match/index.js";
import { html } from "./core/html/index.js";
import { polyphonic } from "./core/polyphonic/index.js";
import { convert } from "./core/convert/index.js";
import { segment } from "./core/segment/index.js";
import { addTraditionalDict, getTraditionalDict } from "./core/traditional/index.js";
import { OutputFormat } from "./core/segment/middlewares.js";
export {
  OutputFormat,
  addDict,
  addTraditionalDict,
  clearCustomDict,
  convert,
  customPinyin,
  getFinalParts,
  getInitialAndFinal,
  getNumOfTone,
  getTraditionalDict,
  html,
  match,
  pinyin,
  polyphonic,
  removeDict,
  segment
};
