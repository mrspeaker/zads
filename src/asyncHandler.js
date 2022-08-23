import { load_prog, mk_program_from_obj } from "./program.js";

const tryerr =
  (f) =>
  async (...args) => {
    try {
      return [null, await f(...args)];
    } catch (err) {
      return [err, []];
    }
  };

const asyncHandler = (action) => async (type, value) => {
  switch (type) {
    case "PROG_LOAD":
      {
        const [err, { obj, src }] = await tryerr(load_prog)(value);
        if (!err) {
          const prog = mk_program_from_obj(obj, src);
          action("PROG_LOADED", prog);
        }
      }
      break;
    default:
      action(type, value);
  }
};

export default asyncHandler;
