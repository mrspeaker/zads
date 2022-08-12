import { displayObj } from "./emulate.js";
import { bindAssembleUI, assembleText } from "./assemble.js";

const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) => [...Array(num)].fill(0).map((r) => [0, 0, 0, 0]);
const mk_state = () => ({
  env: {
    pc: 0,
    regs: mk_regs(15),
    mem: mk_mem(4096),
  },
  src: "",
  obj: [],
  action: function (type, value) {
    const s = this;
    console.log(type);
    switch (type) {
      case "LOAD_OBJ":
        console.log(value.obj);
        s.obj = value.obj;
        return s;
      default:
        console.log("Unhandled ", type);
    }
  },
});

export const $ = (sel) => document.querySelector(sel);
export const $click = (sel, f) => $(sel).addEventListener("click", f, false);

function display(msg) {
  alert(msg);
}

function refresh(state) {
  const { env, obj } = state;
  $("#obj").value = obj;
  $("#regs").value = env.regs.join("\n");
  $("#mem").value = env.mem;
}

const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.text())
    .then((r) => r);

  const bytes = obj
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .split(" ")
    .filter((b) => b.trim())
    .map((b) => b.toString(16))
    .map((b) => parseInt(b, 16));

  return bytes;
};

(async function main(state) {
  bindAssembleUI((obj) => {
    state.action("LOAD_OBJ", { obj });
    refresh(state);
  });

  const obj = await loadTxtObj("/a.obj");
  state.action("LOAD_OBJ", { obj });
  displayObj(state.obj, state.env);
  run(state.obj, state.env);
  refresh(state);
})(mk_state());

function run(obj, env) {
  env.mem[10] = 0xff;

  env.pc = step(obj, env);
  env.pc = step(obj, env);
  env.pc = step(obj, env);
  env.pc = step(obj, env);
}

const nib = (byte) => [byte >> 4, byte % 16];
const byte_from = (nib1, nib2) => (nib1 << 4) + nib;
const nib3_to_byte = (nib1, nib2, nib3) => (nib1 << 8) + (nib2 << 4) + nib3;

function step(bytes, env) {
  console.log(bytes, env);
  const { regs, mem } = env;
  let { pc } = env;
  const op = bytes[pc++];
  let opers;
  let r1, r2, r3, b2, d1, d2, d3, x1, x2;
  let d;

  switch (op) {
    case 0x07:
      //BCR M1,R2 [RR] - 2 bytes
      //0:'07' 8: M1 12: R2
      opers = bytes[pc++];
      console.log("BCR", opers);
      break;
    case 0x5a:
      // A R1,D2(X2,B2) [rx] - 4 bytes
      // 0:"5a" 8:r1 12:x2, 16:b2, 20:d2
      opers = bytes
        .slice(pc, pc + 3)
        .map(nib)
        .flat();
      pc += 3;
      [r1, x2, b2, d1, d2, d3] = opers;
      d = nib3_to_byte(d1, d2, d3);
      regs[r1][3] = regs[r1][3] + mem[x2 + b2 + d2];
      console.log("A", r1, x2, b2, d, regs[r1]); // 2 7 12 22
      break;
    case 0x98:
      // LM R1,R3,D2(b2) - 4bytes
      // 0:"98" 8:r1 12:r3 16:b2 20:d2
      // load from r1 to r3 from storage addr.
      opers = bytes
        .slice(pc, pc + 3)
        .map(nib)
        .flat();
      pc += 3;
      [r1, r2, r3, d1, d2, d3] = opers;
      d = nib3_to_byte(d1, d2, d3);

      let ptr = regs[r3][3] + d;
      regs[r1][3] = mem[ptr++];
      regs[r2][3] = mem[ptr++];
      regs[r3][3] = mem[ptr++];

      console.log("LM", regs[r1], regs[r2], regs[r3]);

      break;
    case 0x0d:
      // BSR - 2bytes
      const r1r2 = bytes[pc++];
      console.log("BSR", r1r2);

      break;
    default:
      console.log("wat op?", op, op.toString(16));
  }
  return pc;
}
