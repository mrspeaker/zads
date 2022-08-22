import { load_prog, mk_program_from_obj } from "./program.js";

const asyncHandler = (action) => async (type, value) => {
  switch (type) {
    case "PROG_LOAD":
      {
        const { obj, src } = await load_prog(value);
        const prog = mk_program_from_obj(obj, src);
        action("PROG_LOADED", prog);
      }
      break;
    default:
      action(type, value);
  }
};

export default asyncHandler;
