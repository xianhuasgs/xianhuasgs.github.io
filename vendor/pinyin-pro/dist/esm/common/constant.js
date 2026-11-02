const DoubleUnicodePrefixReg = /^[\uD800-\uDBFF]$/;
const DoubleUnicodeSuffixReg = /^[\uDC00-\uDFFF]$/;
const DoubleUnicodeReg = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var Probability;
(function(Probability2) {
  Probability2[Probability2["Unknown"] = 1e-13] = "Unknown";
  Probability2[Probability2["Rule"] = 1e-12] = "Rule";
  Probability2[Probability2["DICT"] = 2e-8] = "DICT";
  Probability2[Probability2["Surname"] = 1] = "Surname";
  Probability2[Probability2["Custom"] = 1] = "Custom";
})(Probability || (Probability = {}));
const Priority = {
  Normal: 1,
  Surname: 10,
  Custom: 100
};
export {
  DoubleUnicodePrefixReg,
  DoubleUnicodeReg,
  DoubleUnicodeSuffixReg,
  Priority,
  Probability
};
