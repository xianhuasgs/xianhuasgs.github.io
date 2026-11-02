import { PatternNumberDict } from "./special.js";
import { Pattern2 } from "./dict2.js";
import { Pattern3 } from "./dict3.js";
import { Pattern4 } from "./dict4.js";
import { Pattern5 } from "./dict5.js";
import { PatternSurname } from "./surname.js";
const PatternsNormal = [
  ...Pattern5,
  ...Pattern4,
  ...Pattern3,
  ...Pattern2,
  ...PatternNumberDict,
  ...PatternSurname
];
export {
  PatternsNormal
};
