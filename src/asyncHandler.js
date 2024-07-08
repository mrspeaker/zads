import { load_prog, mk_program_from_obj } from "./program.js";
import defaultPrograms from "./defaultPrograms.js";

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
    case "STORAGE_LOAD":
      {
        if (!window.localStorage) return;
        let programs = defaultPrograms;
        const progs = window.localStorage.getItem("programs");
        if (progs) {
          programs = JSON.parse(progs);
        }
        action("STORAGE_LOADED", programs);

        let settings = JSON.parse(window.localStorage.getItem("settings"));
        if (settings?.selected) {
          action("PROGRAM_SELECT", settings.selected);
        }

        const sprite_data = JSON.parse(window.localStorage.getItem("sprites"));
        console.log("FUUUUUUUUUU", sprite_data);
        if (sprite_data) {
          action("SET_SPRITES", sprite_data);
        }
      }
      break;

    default:
      action(type, value);
  }
};

export default asyncHandler;
