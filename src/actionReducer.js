import { chunk, chkBytes, memcpy } from "./utils.js";
import { run } from "./emulate.js";

const codeFromObj = (obj) => {
  const txt = obj.filter((r) => chkBytes(r, [0x2, 0xe3, 0xe7, 0xe3]));
  return txt
    .map((t) => {
      const size = t[11];
      return t.slice(16, 16 + size);
    })
    .flat();
};

const actionReducer = (s, render) => (type, value) => {
  console.log("Action", type);
  switch (type) {
    case "PROG_LOADED":
      s.program = value;
      break;
    case "LOAD_OBJ":
      s.goff = value.obj[0] === 3 && value.obj[1] === 0xf0;
      s.obj = chunk(value.obj, 80);
      s.code = codeFromObj(s.obj);
      break;
    case "UPDATE_OBJ":
      s.code = value.code;
      break;
    case "OBJ_BYTES":
      s.program.showObjBytes = !s.program.showObjBytes;
      break;
    case "RUN":
      // TODO: clear mem each run
      memcpy(s.program.code, s.machine.mem, 0);
      s.program.code_txt = run(s.program.code, s.machine);
      break;

    default:
      console.log("Unhandled ", type);
  }
  render(s);
  return s;
};

export default actionReducer;
