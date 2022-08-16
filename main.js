import { displayObj } from "./emulate.js";
import { bindAssembleUI, assembleText } from "./assemble.js";

const chunk = (arr, size) =>
  arr.reduce(
    (ac, el) => {
      const a = ac[ac.length - 1];
      if (a.length === size) ac.push([]);
      ac[ac.length - 1].push(el);
      return ac;
    },
    [[]]
  );

const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) => [...Array(num)].fill(0).map((r) => [0, 0, 0, 0]);
const mk_state = () => ({
  env: {
    pc: 0,
    regs: mk_regs(15),
    mem: mk_mem(4096),
    inst: [],
  },
  goff: false,
  src: "",
  obj: [],
  action: function (type, value) {
    const s = this;
    console.log(type);
    switch (type) {
      case "LOAD_OBJ":
        s.goff = value.obj[0] === 3 && value.obj[1] === 0xf0;
        s.obj = chunk(value.obj, 80);
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
  const { env, obj, goff } = state;
  $("#format").innerText = goff ? "GOFF" : "OBJ";
  $("#obj").value = chunk(obj, 80).join("\n\n");

  $("#regs").value = env.regs.join("\n");
  $("#mem").value = env.mem;
  $("#src").value = env.inst.join("\n");
}

const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.blob())
    .then((r) => r);

  //const byteArray = new Uint8Array(arrayBuffer);
  //    byteArray.forEach((element, index)) => {
  //      // do something with each byte in the array
  //    }
  const b = await obj.arrayBuffer();
  const bytes = new Uint8Array(b);
  return bytes;
};

const chkBytes = (arr, bytes, offset = 0) =>
  bytes.every((b, i) => arr[offset + i] === b);

(async function main(state) {
  bindAssembleUI((obj) => {
    state.action("LOAD_OBJ", { obj });
    refresh(state);
  });

  const obj = await loadTxtObj("/one.o");
  state.action("LOAD_OBJ", { obj });

  state.obj.forEach((o, i) => {
    console.log(i, o[1], o[2], o[3]);
  });

  const txt = state.obj.filter((r) => chkBytes(r, [0x2, 0xe3, 0xe7, 0xe3]));
  txt.forEach((t) => {
    const size = t[11];
    const code = t.slice(16, 16 + size);
    if (code[0] !== 0) {
      run(code, state.env);
    } else {
      console.log("DATA?", code);
    }
  });
  refresh(state);
})(mk_state());

function run(obj, env) {
  env.mem[10] = 0xff;
  env.pc = 0; // Ah, not PC but Location Counter!
  while (env.pc < obj.length) {
    env.pc = step(obj, env);
  }
}

const nib = (byte) => [byte >> 4, byte % 16];
const byte_from = (nib1, nib2) => (nib1 << 4) + nib;
const nib3_to_byte = (nib1, nib2, nib3) => (nib1 << 8) + (nib2 << 4) + nib3;

const nop = () => {};
const ops = {
  0x05: ["BALR", 2, nop],
  0x07: ["BCR", 2, nop],
  0x0b: ["BSM", 2, nop],
  0x0d: ["BSR", 2, nop],
  0x18: ["LR", 2, ([r1, r2], regs) => (regs[r1] = regs[r2])],
  0x41: ["LA", 4, nop],
  0x50: ["ST", 4, nop],
  0x58: ["L", 4, nop],
  0x5a: [
    "A",
    4,
    (ops, regs, mem) => {
      const [r1, x2, b2, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      regs[r1][3] = regs[r1][3] + mem[x2 + b2 + d2];
    },
  ],
  0x90: ["STM", 4, nop],
  0x98: [
    "LM",
    4,
    (ops, regs, mem) => {
      const [r1, r2, r3, d1, d2, d3] = ops;
      const d = nib3_to_byte(d1, d2, d3);
      let ptr = regs[r3][3] + d;
      regs[r1][3] = mem[ptr++];
      regs[r2][3] = mem[ptr++];
      regs[r3][3] = mem[ptr++];
    },
  ],
  0xd7: ["XC", 6, nop],
};

function step(obj, env) {
  const { regs, mem } = env;
  let { pc } = env;
  const op = obj[pc++];
  const o = ops[op];
  if (o) {
    const [name, bytes, f] = o;
    const num = bytes - 1;
    const opers = obj
      .slice(pc, pc + num)
      .map(nib)
      .flat();
    console.log(name, f === nop ? "-NOP-" : ".", opers);
    env.inst.push(name + " " + opers.join("."));
    f(opers, regs, mem);
    pc += num;
  } else {
    console.log("wat op?", pc, op.toString(16), "(", op, ")");
  }
  return pc;
}
