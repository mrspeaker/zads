import { arrEq } from "../src/utils.js";
import {
  to_nibs,
  from_nibs,
  bytes_to_fw,
  fw_to_bytes,
  bytes_eq,
  base_displace,
} from "../src/bytes.js";

const to_nib_1 = () => arrEq(to_nibs(0xf, 1), [0xf]);

const byte_from_nib_test = () => from_nibs(0xf, 0xf) === 0xff;
const bytes_to_fw_min = () =>
  bytes_to_fw([0x00, 0x00, 0x00, 0x00]) === 0x00000000;
const bytes_to_fw_one = () =>
  bytes_to_fw([0x00, 0x00, 0x00, 0x01]) === 0x00000001;
const bytes_to_fw_max = () =>
  bytes_to_fw([0xff, 0xff, 0xff, 0xff]) === 0xffffffff;

const fw_to_bytes_min = () =>
  arrEq(fw_to_bytes(0x00000000), [0x00, 0x00, 0x00, 0x00]);
const fw_to_bytes_one = () =>
  arrEq(fw_to_bytes(0x00000001), [0x00, 0x00, 0x00, 0x01]);
const fw_to_bytes_max = () =>
  arrEq(fw_to_bytes(0xffffffff), [0xff, 0xff, 0xff, 0xff]);

const bytes_eq_0 = () => bytes_eq([], [], 0);
const bytes_eq_1 = () => bytes_eq([1], [1, 2], 0);
const bytes_eq_offset = () => bytes_eq([1, 2, 3], [0, 0, 1, 2, 3, 4, 5], 2);

const base_disp_zero = () => base_displace(0, 0, 0, 0, 0) === 0;
const base_disp_max_d = () => base_displace(0, 0, 0xf, 0xf, 0xf) === 0xfff;
const base_disp_regs = () =>
  base_displace([0, 0, 0, 1], [0, 0, 0, 2], 0, 0, 3) === 6;

export default [
  to_nib_1,
  byte_from_nib_test,
  bytes_to_fw_min,
  bytes_to_fw_one,
  bytes_to_fw_max,
  fw_to_bytes_max,
  fw_to_bytes_one,
  fw_to_bytes_min,
  bytes_eq_0,
  bytes_eq_1,
  bytes_eq_offset,
  base_disp_zero,
  base_disp_max_d,
  base_disp_regs,
];
