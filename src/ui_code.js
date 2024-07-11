import { editor } from "./textarea.js";
import { $$, $, $click, $on } from "./utils.js";
import { ops } from "./ops.js";
import { get_help_text } from "./help.js";

export function ui_code(state, action) {
  // Source code panel
  editor(
    $("#src"),
    // On save
    (text) => action("ASSEMBLE_SRC", text),
    // On selection change
    (txt, start, end) => {
      // TODO: move to reducer+render
      const help = get_help_text(txt);
      if (!help) return;
      const { mn, desc, type, form, pdf } = help;
      const link = pdf ? `<a href="#">${pdf}<a>` : "";
      $(
        "#help"
      ).innerHTML = `<span>&nbsp;<span title="${desc}" style="color:var(--highlight-warm)">${mn}</span> [${type}] ${form} ${link}</span>`;
    }
  );

  // Memory dump panel
  editor(
    $("#mem"),
    // save
    (text) => updateMem(text),
    // on selection change
    (txt, start) => {
      const byte = Math.floor(start / 3);
      if (byte < 0 || byte > state.machine.mem.length) {
        return;
      }
      const hex_byte = byte.toString(16).toUpperCase();
      const val = state.machine.mem[byte];
      const hex = val.toString(16).toUpperCase().padStart(2, 0);
      const bin = val.toString(2).padStart(8, 0);
      $(
        "#mem_cur"
      ).innerText = `0x${hex_byte} (${byte}): 0x${hex} ${val} ${bin}`;
    },
    // no tabs plz
    false
  );
  $("#mem").addEventListener("change", (e) => updateMem(e.target.value), false);

  // Disassembly panel
  editor(
    $("#dis"),
    (text) => updateDis(text),
    (txt) => {
      const val = parseInt(txt, 16);
      state.program.breakpoint = isNaN(val) ? null : val;
    }
  );

  // Registers
  editor(
    $("#regs"),
    (text) => {
      console.log(text);
    },
    (txt) => {
      const reg_num = parseInt(txt, 10);
      if (!isNaN(reg_num) && reg_num > 0 && reg_num < 16) {
        const inp = prompt("Set R" + reg_num + " to:").trim();
        const val = parseInt(inp, 10);
        if (!isNaN(val)) {
          action("REG_SET", { reg: reg_num, val });
        }
      }
    }
  );

  $click("#fs", () => toggleFullscreen());

  $on("#fontPicker", "change", (e) => {
    e.target.value &&
      new FontFace("vga", `url("res/${e.target.value}.woff") format("woff")`)
        .load()
        .then((f) => {
          document.fonts.add(f);
        })
        .catch((e) => {
          console.log("error loading font", e);
        });
  });

  $click("#btnSprites", (e) => {
    $("#screen_sprite").style.display = "grid";
    $("#screen_code").style.display = "none";
    e.target.classList.add("ok");
    $("#btnCode").classList.remove("ok");
    action("SPRITES_SCREEN");
  });
  $click("#btnCode", (e) => {
    $("#screen_sprite").style.display = "none";
    $("#screen_code").style.display = "grid";
    e.target.classList.add("ok");
    $("#btnSprites").classList.remove("ok");
  });

  $click("#btnDumMem", () => {
    dumBG(state);
    action("NOP");
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
  $click("#btnNewPgm", () => {
    action("PROGRAM_NEW");
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
      .split(" ")
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
