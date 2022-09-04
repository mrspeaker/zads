import { disassemble } from "../src/disassemble.js";

const bytes = disassemble([0x18, 0x12], {}, false);
console.log("00: LR 1.2", bytes);
