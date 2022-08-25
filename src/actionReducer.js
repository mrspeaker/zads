import { run } from "./emulate.js";
import { assembleText } from "./assemble.js";
import { mk_program_from_obj } from "./program.js";
import { memcpy } from "./bytes.js";

const actionReducer = (s, render) => (type, value) => {
  console.log("Action", type);
  switch (type) {
    case "PROG_LOADED":
      s.program = value;
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
        const bytes = [
          ...assembleText(value)
            .filter((s) => !["DS"].includes(s.stmt.op.toUpperCase()))
            .map((s) => s.bytes),
        ].flat();
        s.program.obj = [
          2,
          227,
          231,
          227,
          0x40,
          0x40,
          0x40,
          0x40,
          0x40,
          0x40,
          0x40,
          bytes.length,
          0x40,
          0x40,
          0x40,
          0x40,
          ...bytes,
        ].flat();
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
