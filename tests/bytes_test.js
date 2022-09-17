import { arrEq } from "../src/utils.js";
import {
  to_nibs,
  from_nibs,
  bytes_to_fw,
  fw_to_bytes,
  bytes_eq,
  base_displace,
  base_displace_regs,
  regset,
  regval,
  reg_to_mem,
  mem_to_reg,
  memval,
} from "../src/bytes.js";

const to_nib_1 = () => arrEq(to_nibs(0xf, 1), [0xf]);

const byte_from_nib_test = () => from_nibs([0xf, 0xf]) === 0xff;

const nib_byte_nib = () => from_nibs(to_nibs(0xfe)) === 0xfe;
// TODO: fix overflow
const nib_overflow = () => to_nibs(0xf1, 1) === 0x01;

const bytes_to_fw_min = () =>
  bytes_to_fw([0x00, 0x00, 0x00, 0x00]) === 0x00000000;
const bytes_to_fw_one = () =>
  bytes_to_fw([0x00, 0x00, 0x00, 0x01]) === 0x00000001;
const bytes_to_fw_max = () =>
  bytes_to_fw([0xff, 0xff, 0xff, 0xff]) === 0xffffffff;

// TODO: fix overflow
const bytes_overflow = () => bytes_to_fw([0x00, 0x00, 0x00, 256]) === 0xff;

const fw_to_bytes_min = () =>
  arrEq(fw_to_bytes(0x00000000), [0x00, 0x00, 0x00, 0x00]);
const fw_to_bytes_one = () =>
  arrEq(fw_to_bytes(0x00000001), [0x00, 0x00, 0x00, 0x01]);
const fw_to_bytes_max = () =>
  arrEq(fw_to_bytes(0xffffffff), [0xff, 0xff, 0xff, 0xff]);

const fw_bytes_fw = () => bytes_to_fw(fw_to_bytes(0xff00ee11)) === 0xff00ee11;

const bytes_eq_0 = () => bytes_eq([], [], 0);
const bytes_eq_1 = () => bytes_eq([1], [1, 2], 0);
const bytes_eq_offset = () => bytes_eq([1, 2, 3], [0, 0, 1, 2, 3, 4, 5], 2);

const base_disp_zero = () => base_displace(0, 0, 0, 0, 0) === 0;
const base_disp_max_d = () => base_displace(0, 0, 0xf, 0xf, 0xf) === 0xfff;
const base_disp_regs = () =>
  base_displace([0, 0, 0, 1], [0, 0, 0, 2], 0, 0, 3) === 6;

const base_disp_regs_b0x0 = () =>
  base_displace_regs([[0, 0, 0, 0xff]], 0, 0, 0, 0, 1) === 1;
const base_disp_regs_b0x1 = () =>
  base_displace_regs([[0, 0, 0, 0], [0, 0, 0, 0xff]], 0, 1, 0, 0, 1) === 0x100;
const base_disp_regs_b1x0 = () =>
  base_displace_regs([[0, 0, 0, 0x0f], [0, 0, 0, 0xf0]], 1, 0, 0, 0, 0) ===
  0xf0;
const base_disp_regs_b1x1 = () =>
  base_displace_regs([[0, 0, 0, 0xf0], [0, 0, 0x1, 0]], 1, 1, 0, 0, 0) ===
  0x200;

const regset_max = () =>
  arrEq(regset([0, 0, 0, 0], 0xfffefdfc), [0xff, 0xfe, 0xfd, 0xfc]);
const regset_one = () =>
  arrEq(regset([0xff, 0xff, 0xff, 0xff], 0x1), [0, 0, 0, 1]);
const regval_max = () =>
  regval(regset([0, 0, 0, 0], 0xfffefdfc)) === 0x0fffefdfc;

const reg_mem_1 = () => {
  const mem = [0, 0, 0, 0];
  reg_to_mem([0xff, 0xff, 0xff, 0xff], mem);
  return arrEq([0xff, 0xff, 0xff, 0xff], mem);
};
const reg_mem_offset = () => {
  const mem = [0, 0, 0, 0, 0, 0, 0, 0];
  reg_to_mem([0xff, 0xff, 0xff, 0xff], mem, 2);
  return arrEq([0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0], mem);
};

const mem_reg_1 = () => {
  const mem = [0, 0, 0xff, 0xff, 0xff, 0xff];
  const r = mem_to_reg([0, 0, 0, 0], mem, 2);
  return arrEq(r, [0xff, 0xff, 0xff, 0xff]);
};

const memval_max = () =>
  memval([0xff, 0xff, 0xff, 0xff]) === bytes_to_fw([0xff, 0xff, 0xff, 0xff]);

export default [
  to_nib_1,
  nib_overflow,
  byte_from_nib_test,
  nib_byte_nib,
  bytes_to_fw_min,
  bytes_to_fw_one,
  bytes_to_fw_max,
  bytes_overflow,
  fw_to_bytes_max,
  fw_to_bytes_one,
  fw_to_bytes_min,
  fw_bytes_fw,
  bytes_eq_0,
  bytes_eq_1,
  bytes_eq_offset,
  base_disp_zero,
  base_disp_max_d,
  base_disp_regs,
  base_disp_regs_b0x0,
  base_disp_regs_b1x0,
  base_disp_regs_b0x1,
  base_disp_regs_b1x1,
  regset_max,
  regset_one,
  regval_max,
  reg_mem_1,
  reg_mem_offset,
  mem_reg_1,
  memval_max,
];
