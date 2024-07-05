import render from "./render.js";
import actionReducer from "./actionReducer.js";
import asyncHandler from "./asyncHandler.js";
import { mk_state } from "./state.js";
import { $$, $ } from "./utils.js";
import { pal_to_hex, updateVic } from "./vic.js";
import { key_handler, gamepad_handler } from "./input.js";
import { ui_code } from "./ui_code.js";
import { ui_sprites } from "./ui_sprites.js";

const state = mk_state();
const action = asyncHandler(actionReducer(state, render));

(async function main(state, action) {
  ui_code(state, action);
  ui_sprites(state.sprites, action);

  // make the screen pretty
  dumColors();

  // bind inputs
  const keys = key_handler(document.body);
  const pad = gamepad_handler(window);

  // load from storage
  action("STORAGE_LOAD");
  if (!state.selected) {
    action("PROG_LOAD", "mark6");
  }

  let cur_but = -1;
  let but_timer = 0;
  const $buttons = $$("button,input");

  // let's go...
  function update() {
    if (!state.machine.psw.halt) {
      for (let i = 0; i < state.cyclesPerFrame; i++) {
        action("STEP");
        if (state.machine.psw.halt) {
          break;
        }
      }
      updateVic(state.machine.vic, state.machine.mem, {
        left: keys.down(37) || pad.left(),
        right: keys.down(39) || pad.right(),
        up: keys.down(38) || pad.up(),
        down: keys.down(40) || pad.down(),
        fire: keys.down(90) || pad.a(),
        fire_2: keys.down(88) || pad.b(),
      });
      render(state);

      // dum lights
      but_timer = (but_timer + 1) % 5;
      if (but_timer == 0) {
        if (cur_but > -1) {
          $buttons[cur_but].classList.remove("blinkn");
        }
        cur_but = (cur_but + 1) % $buttons.length;
        $buttons[cur_but].classList.add("blinkn");
      }
    }
    requestAnimationFrame(update);
  }
  update();
})(state, action);

function dumColors() {
  $$("textarea").forEach((t, i) => {
    let c = ((i * 3) % 16) + 14;
    if (i === 1) c = 9;
    t.style.color = pal_to_hex(c);
  });
  $("#docs").style.color = pal_to_hex(3);
}
