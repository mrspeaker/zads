import { disassemble } from "../src/disassemble.js";
import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";

const dis_lr = () => {
  const bytes = disassemble([0x18, 0x12], {}, false);
  return bytes[0] === "00: LR 1.2";
};

const op_lr = () => {
  const env = { regs: [[0, 0, 0, 0], [0, 0, 0, 1]], psw: { pc: 0 } };
  const op = ops[op_by_mn["LR"]];
  const obj = [...op.code, 1];
  step(obj, env);
  return env.regs[0][3] === 1;
};

const tests = () => {
  return [dis_lr, op_lr].map((f) => {
    const name = f.name;
    const passed = !!f();
    return { name, passed };
  });
};

function main() {
  tests().forEach(({ name, passed }) => {
    const div = document.createElement("div");
    div.innerText = `${name}: ${passed ? "OK" : "FAIL"}`;
    document.body.appendChild(div);
  });
}
main();
