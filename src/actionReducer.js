import { run } from "./emulate.js";
import { assemble } from "./assemble.js";
import { bind } from "./bind.js";
import { mk_program_from_obj } from "./program.js";
import { memcpy } from "./bytes.js";
import { mk_program } from "./state.js";

const actionReducer = (s, render) => (type, value) => {
  console.log("Action", type);
  switch (type) {
    case "PROG_LOADED":
      s.program = value;
      break;
    case "STORAGE_LOADED":
      value.forEach((p) => {
        s.programs[p.name] = p.asm;
      });
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
        const code_bytes = [
          ...assemble(value)
            .filter((s) => !["DS"].includes(s.stmt.op.toUpperCase()))
            .map((s) => s.bytes.bytes),
        ].flat();
        s.program.obj = bind(code_bytes);
        s.program = mk_program_from_obj(s.program.obj, value);
      }
      break;
    default:
      console.log("Unhandled ", type);
  }
  render(s);
  return s;
};

export default actionReducer;
