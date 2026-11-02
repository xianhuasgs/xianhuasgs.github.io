import DICT1 from "../../data/dict1.js";
import { customMultipleDict } from "../custom/state.js";
import Surnames from "../../data/surname.js";
const getAllPinyin = (char, surname = "off") => {
  let pinyin = DICT1.get(char) ? DICT1.get(char).split(" ") : [];
  if (customMultipleDict.get(char)) {
    pinyin = customMultipleDict.get(char).split(" ");
  } else if (surname !== "off") {
    const surnamePinyin = Surnames[char];
    if (surnamePinyin) {
      pinyin = [surnamePinyin].concat(pinyin.filter((py) => py !== surnamePinyin));
    }
  }
  return pinyin;
};
export {
  getAllPinyin
};
