import { arrEq } from "../src/utils.js";
import { parseBaseDisplace } from "../src/addressing.js";

const base_full = () => {
  const o = parseBaseDisplace("100(1,2)", 15, {});
  return arrEq(o, [1, 2, 0, 6, 4]);
};

const base_no_idx = () => {
  const o = parseBaseDisplace("100(,2)", 15, {});
  return arrEq(o, [0, 2, 0, 6, 4]);
};

const base_only_idx = () => {
  const o = parseBaseDisplace("100(2)", 15, {});
  return arrEq(o, [2, 15, 0, 6, 4]);
};

const base_symbol = () => {
  const o = parseBaseDisplace("a1", 15, { a1: { pc: 100 } });
  return arrEq(o, [0, 15, 0, 6, 4]);
};

const base_just_displace = () => {
  const o = parseBaseDisplace("100", 15, {});
  return arrEq(o, [0, 0, 0, 6, 4]);
};

export default [
  base_full,
  base_no_idx,
  base_only_idx,
  base_symbol,
  base_just_displace,
];
