import { disassemble } from "../src/disassemble.js";

const dis_lr = () => {
  const bytes = disassemble([0x18, 0x12], {}, false);
  return bytes[0] === "00: LR 1.2";
};


export default [dis_lr];
