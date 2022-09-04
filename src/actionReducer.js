import { run } from "./emulate.js";
import { assemble } from "./assemble.js";
import { bind } from "./bind.js";
import { mk_program_from_obj } from "./program.js";
import { memcpy } from "./bytes.js";
import { mk_program } from "./state.js";

const save = async (progs) => {
  if (!window.localStorage) return;
  localStorage.setItem("programs", JSON.stringify(progs));
};

const actionReducer = (s, render) => (type, value) => {
  console.log("Action", type);
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
      break;
    case "OBJ_BYTES":
      s.zads.showObjBytes = !s.zads.showObjBytes;
      break;
    case "RUN":
      // TODO: clear mem each run?
      memcpy(s.program.code, s.machine.mem, 0);
      s.program.code_txt = run(s.program.code, s.machine);
      break;
    case "MEM_UPDATE":
      if (value.length === s.machine.mem.length) {
        s.machine.mem = value;
      }
      break;
    case "ASSEMBLE_SRC":
      {
        const { stmts, bytes, symbols, addressing } = assemble(value);

        const code_bytes = [
          ...bytes
            .filter((s) => !["DS"].includes(s.stmt.op.toUpperCase()))
            .map((s) => s.bytes.bytes),
        ].flat();
        s.program.obj = bind(code_bytes);
        s.program = mk_program_from_obj(s.program.obj, value);
        s.program.symbols = symbols;
        s.program.addressing.base = addressing.base;
        s.program.addressing.base_addr = addressing.base_addr;
        s.program.stmts = stmts;
      }
      break;
    default:
      console.log("Unhandled ", type);
  }
  render(s);
  return s;
};

export default actionReducer;
