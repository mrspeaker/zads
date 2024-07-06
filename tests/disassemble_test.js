import { disassemble, disassemble_line } from "../src/disassemble.js";

const dis_lr = () => {
  const [psw, line] = disassemble_line(0, [0x18, 0x12], {}, false);
  return psw === 2 && line === "00: LR  1.2";
};

const dis_ri = () => {
  const [psw, line] = disassemble_line(0, [0xa7, 0x1a, 0x00, 0x01], {}, false);
  return psw === 4 && line === "00: AHI 1.10 0.0 0.1";
};

const dis_all = () => {
  const out = disassemble([0x18, 0x12, 0xa7, 0x1a, 0x00, 0x01], {}, false);
  return out.join(";") === "00: LR  1.2;02: AHI 1.10 0.0 0.1";
};

export default [dis_lr, dis_ri, dis_all];
