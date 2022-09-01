import { load_prog, mk_program_from_obj } from "./program.js";
import defaultPrograms from "./defaultPrograms.js";

const tryerr = (f) => async (...args) => {
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
    case "STORAGE_LOAD":
      {
        let programs = defaultPrograms;
        if (window.localStorage) {
          const progs = window.localStorage.getItem("programs");
          if (progs) {
            try {
              programs = JSON.parse(progs);
            } catch (e) {
              console.error("Error loading", e, progs);
            }
          }
        }
        action("STORAGE_LOADED", programs);
      }
      break;

    default:
      action(type, value);
  }
};

export default asyncHandler;
