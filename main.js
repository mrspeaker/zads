import { bindAssembleUI, assembleText } from "./assemble.js";
import { ops, op_name, nop } from "./ops.js";
import { nib, chunk, $ } from "./utils.js";

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
  action: function(type, value) {
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

function refresh(state) {
  const { env, obj, goff } = state;
  $("#format").innerText = goff ? "GOFF" : "OBJ";
  $("#obj").value = obj.join(",\n\n");

  $("#regs").value = env.regs.join("\n");
  $("#mem").value = env.mem;
  $("#dis").value = env.inst.join("\n");
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
