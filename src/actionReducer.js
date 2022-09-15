import { step } from "./emulate.js";
import { assemble } from "./assemble.js";
import { bind } from "./bind.js";
import { mk_program_from_obj } from "./program.js";
import { memset, regset } from "./bytes.js";
import { mk_program } from "./state.js";
import { chunk } from "./utils.js";

const save = async (progs) => {
  if (!window.localStorage) return;
  localStorage.setItem("programs", JSON.stringify(progs));
};
const saveSettings = async (settings) => {
  if (!window.localStorage) return;
  localStorage.setItem("settings", JSON.stringify(settings));
};

const actionReducer = (s, render) => (type, value) => {
  console.log("Action", type);
  let do_render = true;
  switch (type) {
    case "PROG_LOADED":
      s.program = value;
      break;
    case "STORAGE_LOADED":
      s.programs = value;
      break;
    case "PROGRAM_SELECT":
      if (value !== "-1") {
        s.program = mk_program();
        s.program.src = s.programs[value];
        s.selected = value;
      } else {
        s.selected = null;
      }
      saveSettings({ selected: s.selected });
      break;
    case "PROGRAM_SAVE":
      if (!s.selected) {
        const name = prompt("save as?");
        if (name) {
          const p = mk_program();
          p.src = value;
          s.program = p;
          s.programs[name] = p.src;
          s.selected = name;
        }
      } else {
        s.programs[s.selected] = value;
        s.program.src = value;
      }
      // how to do this properly? (async)
      save(s.programs);
      break;

    case "PROGRAM_DELETE":
      if (s.selected) {
        delete s.programs[s.selected];
        const p = mk_program();
        s.program = p;
        s.selected = null;
        save(s.programs);
      }
      break;
    case "UPDATE_OBJ":
      s.program.code = value.code;
      memset(s.program.code, s.machine.mem, 0);

      break;
    case "OBJ_BYTES":
      s.zads.showObjBytes = !s.zads.showObjBytes;
      break;
    case "STOP":
      s.machine.psw.halt = true;
      break;
    case "RUN":
      if (!s.machine.psw.halt) {
        s.machine.psw.halt = true;
        break;
      }
      memset(s.program.code, s.machine.mem, 0);
      s.machine.psw.pc = 0;
      s.machine.psw.halt = false;
      // TODO: need to relocate prg.
      regset(s.machine.regs[15], 0);
      s.program.code_txt = [];
      break;
    case "STEP":
      {
        //const code_txt = step(s.program.code, s.machine);
        const code_txt = step(s.machine.mem, s.machine);
        s.program.code_txt = [code_txt, ...s.program.code_txt.slice(0, 25)];
        if (!s.machine.psw.halt) do_render = false;
      }
      break;
    case "MEM_UPDATE":
      if (value.length === s.machine.mem.length) {
        s.machine.mem = value;
      }
      break;
    case "MEM_RESET":
      s.machine.mem = s.machine.mem.fill(0);
      s.machine.regs.forEach((r) => regset(r, 0));
      break;
    case "ASSEMBLE_SRC":
      {
        const { stmts, bytes, symbols, addressing } = assemble(value);

        const code_bytes = [
          ...bytes
            .filter((s) => !["DS"].includes(s.stmt.mn.toUpperCase()))
            .map((s) => s.bytes.bytes),
        ].flat();

        /// break into segments
        const ch = chunk(code_bytes, 64).map(bind);
        s.program.obj = ch.reduce((ac, el) => {
          return [...ac, ...el];
        }, []);
        s.program = mk_program_from_obj(s.program.obj, value);
        memset(s.program.code, s.machine.mem, 0);
        s.machine.psw.pc = 0;

        s.program.symbols = symbols;
        s.program.addressing.base = addressing.base;
        s.program.addressing.base_addr = addressing.base_addr;
        s.program.stmts = stmts;
      }
      break;
    case "CYCLES_SET":
      {
        const v = parseInt(value, 10);
        if (!isNaN(v)) {
          s.cyclesPerFrame = Math.max(0, parseInt(value, 10));
        }
      }
      break;
    default:
      console.log("Unhandled ", type);
  }
  do_render && render(s);
  return s;
};

export default actionReducer;
