import render from "./render.js";
import actionReducer from "./actionReducer.js";
import asyncHandler from "./asyncHandler.js";
import { bindAssembleUI } from "./assemble.js";
import { mk_state } from "./state.js";
import { $, $click, eb2asc, loadTxtObj } from "./utils.js";

const state = mk_state();
const action = asyncHandler(actionReducer(state, render));

(async function main(state) {
  /*  state.obj.forEach((o, i) => {
    const [, a, b, c] = o;
    console.log(i, [a, b, c].map((c) => eb2asc(c)).join(""));
  });*/
  bindUI(state, action);
  action("PROG_LOAD", "max");
})(state, action);

function bindUI(state, action) {
  bindAssembleUI((obj) => {
    action("LOAD_OBJ", { obj });
  });

  $click("#btnObjBytes", () => action("OBJ_BYTES"));

  $click("#btnUpdate", () => {
    const code = $("#dis")
      .value.split("\n")
      .map((r) =>
        r
          .slice("00: ".length)
          .split(",")
          .map((v) => parseInt(v, 16))
      )
      .flat();

    action("UPDATE_OBJ", { code });
  });

  $click("#btnRun", () => action("RUN"));
}
