import { arrEq } from "../src/utils.js";

const arrEq_empty_test = () => arrEq([], []);
const arrEq_empty_a_test = () => !arrEq([], [1, 2, 3]);
const arrEq_empty_b_test = () => !arrEq([1, 2, 3], []);
const arrEq_both_test = () => arrEq([1, 2, 3], [1, 2, 3]);
const arrEq_diff_test = () => !arrEq([1, 2, 3], [1, 2, 3, 4]);

export default [
  arrEq_empty_test,
  arrEq_empty_a_test,
  arrEq_empty_b_test,
  arrEq_both_test,
  arrEq_diff_test,
];
