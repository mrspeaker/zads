import { arrEq } from "../src/utils.js";
import { to_nibs, byte_from, bytes_to_fw, fw_to_bytes } from "../src/bytes.js";

const to_nib_1 = () => arrEq(to_nibs(0xf, 1), [0xf]);

const byte_from_nib_test = () => byte_from(0xf, 0xf) === 0xff;
const bytes_to_fw_min = () =>
  bytes_to_fw(0x00, 0x00, 0x00, 0x00) === 0x00000000;
const bytes_to_fw_one = () =>
  bytes_to_fw(0x00, 0x00, 0x00, 0x01) === 0x00000001;
const bytes_to_fw_max = () =>
  bytes_to_fw(0xff, 0xff, 0xff, 0xff) === 0xffffffff;

const fw_to_bytes_min = () =>
  arrEq(fw_to_bytes(0x00000000), [0x00, 0x00, 0x00, 0x00]);
const fw_to_bytes_one = () =>
  arrEq(fw_to_bytes(0x00000001), [0x00, 0x00, 0x00, 0x01]);
const fw_to_bytes_max = () =>
  arrEq(fw_to_bytes(0xffffffff), [0xff, 0xff, 0xff, 0xff]);

export default [
  to_nib_1,
  byte_from_nib_test,
  bytes_to_fw_min,
  bytes_to_fw_one,
  bytes_to_fw_max,
  fw_to_bytes_max,
  fw_to_bytes_one,
  fw_to_bytes_min,
];
