import render from "./render.js";
import actionReducer from "./actionReducer.js";
import asyncHandler from "./asyncHandler.js";
import { mk_state } from "./state.js";
import { $, $click } from "./utils.js";

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
  $click("#btnAsm", () => {
    const src = $("#src").value;
    action("ASSEMBLE_SRC", src);
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
  $("#mem").addEventListener(
    "change",
    (e) => {
      const data = e.target.value
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
    },
    false
  );
}
