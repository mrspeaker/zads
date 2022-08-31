import render from "./render.js";
import actionReducer from "./actionReducer.js";
import asyncHandler from "./asyncHandler.js";
import { mk_state } from "./state.js";
import { $, $click, $on } from "./utils.js";
import { editor } from "./textarea.js";

const state = mk_state();
const action = asyncHandler(actionReducer(state, render));

(async function main(state) {
  bindUI(state, action);
  action("STORAGE_LOAD");
  action("PROG_LOAD", "max");
})(state, action);

function bindUI(state, action) {
  editor($("#src"), (text) => action("ASSEMBLE_SRC", text));
  editor($("#mem"), (text) => updateMem(text));
  editor($("#dis"), (text) => updateDis(text));

  $on("#programs", "change", (e) => {
    action("PROGRAM_SELECT", e.target.value);
  });

  $click("#btnAsm", () => {
    const src = $("#src").value;
    action("ASSEMBLE_SRC", src);
  });

  $click("#btnObjBytes", () => action("OBJ_BYTES"));

  $click("#btnUpdate", () => {
    updateDis($("#dis"));
  });

  const updateDis = (txt) => {
    const code = txt
      .split("\n")
      .map((r) =>
        r
          .slice("00: ".length)
          .split(",")
          .map((v) => parseInt(v, 16))
      )
      .flat();

    action("UPDATE_OBJ", { code });
  };
  const updateMem = (txt) => {
    const data = txt
      .trim()
      .split(",")
      .map((v, i) => {
        const val = parseInt(v, 16);
        if (isNaN(val)) {
          console.warn("bad mem at ", i, ":", v);
          return 0;
        }
        return val;
      });
    action("MEM_UPDATE", data);
  };

  $click("#btnRun", () => action("RUN"));
  $("#mem").addEventListener("change", (e) => updateMem(e.target.value), false);
}
