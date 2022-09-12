import { parseBaseDisplace } from "../src/assemble.js";

const base_full = () => {
  const o = parseBaseDisplace("100(1,2)", 15, {});
  return o.join(",") === "1,2,0,6,4";
};

const base_no_idx = () => {
  const o = parseBaseDisplace("100(,2)", 15, {});
  return o.join(",") === "0,2,0,6,4";
};

export default [base_full, base_no_idx];
