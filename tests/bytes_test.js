import { arrEq } from "../src/utils.js";
import { to_nibs, byte_from, bytes_to_fw } from "../src/bytes.js";

const to_nib_1 = () => arrEq(to_nibs(0xf, 1), [0xf]);
const byte_from_nib_test = () => byte_from(0xf, 0xf) === 0xff;
const bytes_to_fw_min = () =>
  bytes_to_fw(0x00, 0x00, 0x00, 0x01) === 0x00000001;
const bytes_to_fw_max = () =>
  bytes_to_fw(0xff, 0xff, 0xff, 0xff) === 0xffffffff;

export default [to_nib_1, byte_from_nib_test, bytes_to_fw_min, bytes_to_fw_max];
