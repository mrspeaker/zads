import { editor } from "./textarea.js";
import { $$, $, $click, $on } from "./utils.js";
import { ops } from "./ops.js";
import { get_help_text } from "./help.js";

export function ui_code(state, action) {
  editor($("#src"), (text) => action("ASSEMBLE_SRC", text));
  editor($("#mem"), (text) => updateMem(text));
  editor($("#dis"), (text) => updateDis(text));

  $click("#fs", () => toggleFullscreen());

  $click("#btnSprites", () => {
    $("#screen_sprite").style.display = "grid";
    $("#screen_code").style.display = "none";
  });
  $click("#btnCode", () => {
    $("#screen_sprite").style.display = "none";
    $("#screen_code").style.display = "grid";
  });

  $click("#btnDumMem", () => {
    dumBG(state);
    action("NOP");
  });

  $on("#src", "selectionchange", (e) => {
    const area = e.target;
    const { selectionStart, selectionEnd, selectionDirection } = area;
    const txt = e.target.value.substring(selectionStart, selectionEnd);
    // TODO: move to reducer+render
    const help = get_help_text(txt);
    if (!help) return;
    const { mn, desc, type, form, pdf } = help;
    const link = pdf ? `<a href="#">${pdf}<a>` : "";
    $(
      "#help"
    ).innerHTML = `<span>&nbsp;<span title="${desc}" style="color:var(--highlight-warm)">${mn}</span> [${type}] ${form} ${link}</span>`;
  });

  $on("#mem", "selectionchange", (e) => {
    const { selectionStart } = e.target;
    // TODO: move to reducer+render
    const byte = Math.floor(selectionStart / 3);
    if (byte < 0 || byte > state.machine.mem.length) {
      return;
    }
    const hex_byte = byte.toString(16).toUpperCase();
    const val = state.machine.mem[byte];
    const hex = val.toString(16).toUpperCase().padStart(2, 0);
    const bin = val.toString(2).padStart(8, 0);

    $("#mem_cur").innerText = `0x${hex_byte} (${byte}): 0x${hex} ${val} ${bin}`;
  });

  $on("#dis", "selectionchange", (e) => {
    const { selectionStart, selectionEnd } = e.target;
    const txt = e.target.value.substring(selectionStart, selectionEnd);
    const val = parseInt(txt, 16);
    state.program.breakpoint = isNaN(val) ? null : val;
  });

  $on("#programs", "change", (e) => {
    action("PROGRAM_SELECT", e.target.value);
  });

  $click("#btnAsm", () => {
    const src = $("#src").value;
    action("ASSEMBLE_SRC", src);
  });

  $click("#btnObjBytes", () => action("OBJ_BYTES"));

  $click("#btnUpdate", () => {
    updateDis($("#dis").value);
  });

  $click("#btnSavePgm", () => {
    action("PROGRAM_SAVE", $("#src").value);
  });
  $click("#btnDeletePgm", () => {
    if (state.selected && confirm("Yeah?")) {
      action("PROGRAM_DELETE");
    }
  });
  $("#cycles").value = state.cyclesPerFrame;
  $on("#cycles", "change", (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) {
      action("CYCLES_SET", v);
    }
  });
  $click("#btnResetPC", () => {
    action("PSW_PC_RESET", 0);
  });

  $on("#psw_pc", "change", (e) => {
    const v = parseInt(e.target.value, 16);
    if (!isNaN(v)) {
      action("PSW_PC_SET", v);
    }
  });

  $("#mns").innerHTML = Object.values(ops)
    .sort((a, b) => (a.mn < b.mn ? -1 : 1))
    .map(
      ({ mn, desc, name }) =>
        `<span data-desc="${desc ?? "???"}"><strong>${mn}</strong> ${
          name ?? ""
        }</span>`
    )
    .join(" - ");
  $on("#docs", "click", (e) => {
    if (e.target.dataset.desc) {
      $("#desc").innerText = e.target.dataset.desc;
    }
  });

  $click("#btnResetMem", () => action("MEM_RESET"));

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
        const val = v === "__" ? 0 : parseInt(v, 16);
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
  $click("#btnStop", () => action("STOP"));
  $click("#btnStep", () => action("STEP"));
}

function dumBG(state, action) {
  const { machine } = state;
  const { vic, mem } = machine;
  const scrbase = vic.base + vic.screen;
  for (let j = 0; j < vic.rows; j++) {
    for (let i = 0; i < vic.cols; i++) {
      const v = Math.sin(i / 3) * Math.cos(j / 3);

      mem[scrbase + j * vic.cols + i] = v > 0.6 ? 11 : v > 0.4 ? 6 : 0;
    }
  }
}

function toggleFullscreen() {
  let elem = document.querySelector("#screen");

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      alert(
        `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    document.exitFullscreen();
  }
}
