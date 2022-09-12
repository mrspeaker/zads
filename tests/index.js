import { disassemble } from "../src/disassemble.js";
import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";
import { byte_from, regval, fw_to_bytes } from "../src/bytes.js";
import { parseBaseDisplace } from "../src/assemble.js";

const dis_lr = () => {
  const bytes = disassemble([0x18, 0x12], {}, false);
  return bytes[0] === "00: LR 1.2";
};

const op_lr = () => {
  const env = {
    regs: [fw_to_bytes(10), fw_to_bytes(42)],
    psw: { pc: 0, conditionCode: 0 },
  };
  const op = ops[op_by_mn["LR"]];
  const obj = [...op.code, byte_from(0, 1)];

  step(obj, env);

  const { regs, psw } = env;
  const [r0, r1] = regs;
  return (
    regval(r1) === 42 && regval(r0) === regval(r1) && psw.conditionCode === 0
  );
};

const base_displace = () => {
    const base_full = () => {
        const o = parseBaseDisplace("100(1,2)", 15, {});
        return o.join(",") === "1,2,0,6,4";
    };
    const base_no_idx = () => {
        const o = parseBaseDisplace("100(,2)", 15, {});
        return o.join(",") === "0,2,0,6,4";
    };
    return [base_full, base_no_idx];
}

const tests = () => {
    return [dis_lr, op_lr, ...base_displace()].map((f) => {
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
