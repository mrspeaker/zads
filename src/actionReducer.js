import { run } from "./emulate.js";
import { assembleText } from "./assemble.js";
import { memcpy } from "./utils.js";

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
    case "ASSEMBLE_SRC":
      // TODO: should do mk_prog_from_obj(obj,src)
      // once assembler works!
      s.program.obj = [[2, 227, 231, 227, ...assembleText(value)]];
      break;
    default:
      console.log("Unhandled ", type);
  }
  render(s);
  return s;
};

export default actionReducer;
