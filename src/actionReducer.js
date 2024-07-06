import { step } from "./emulate.js";
import { assemble } from "./assemble.js";
import { bind } from "./bind.js";
import { mk_program_from_obj } from "./program.js";
import { memset, regset } from "./bytes.js";
import { mk_program } from "./state.js";
import { chunk } from "./utils.js";
import { actionSpriteReducer } from "./actionSpriteReducer.js";

const save = async (progs) => {
  if (!window.localStorage) return;
  localStorage.setItem("programs", JSON.stringify(progs));
};
const saveSettings = async (settings) => {
  if (!window.localStorage) return;
  localStorage.setItem("settings", JSON.stringify(settings));
};

const saveSprites = async (sprites) => {
  if (!window.localStorage) return;
  localStorage.setItem("sprites", JSON.stringify(sprites));
};

const actionReducer = (s, render, sprite_render) => (type, value) => {
  console.log("Action", type);

  // Just mutating sprites. Soz.
  const do_render_sprites = actionSpriteReducer(s.sprites, type, value);
  let do_render = true;
  switch (type) {
    case "PROG_LOADED":
      s.program = value;
      break;
    case "STORAGE_LOADED":
      s.programs = value;
      break;
    case "PROGRAM_SELECT":
      if (value !== "-1") {
        s.program = mk_program();
        s.program.src = s.programs[value];
        s.selected = value;
      } else {
        s.selected = null;
      }
      saveSettings({ selected: s.selected });
      break;
    case "PROGRAM_SAVE":
      if (!s.selected) {
        const name = prompt("save as?");
        if (name) {
          const p = mk_program();
          p.src = value;
          s.program = p;
          s.programs[name] = p.src;
          s.selected = name;
        }
      } else {
        s.programs[s.selected] = value;
        s.program.src = value;
      }
      // how to do this properly? (async)
      save(s.programs);
      break;

    case "PROGRAM_DELETE":
      if (s.selected) {
        delete s.programs[s.selected];
        const p = mk_program();
        s.program = p;
        s.selected = null;
        save(s.programs);
      }
      break;
    case "UPDATE_OBJ":
      s.program.code = value.code;
      memset(s.program.code, s.machine.mem, 0);

      break;
    case "OBJ_BYTES":
      s.zads.showObjBytes = !s.zads.showObjBytes;
      break;
    case "STOP":
      {
        // TODO/doing : note! messing around with this being a "run to cursor"
        // button. If you select an address in #dis, and run - will run to taht
        // breakpoint. Hitting run again resets, but hitting stop will continue.
        const stopped = s.machine.psw.halt;
        if (!stopped) {
          s.machine.psw.halt = true;
          break;
        }
        s.machine.psw.halt = false;
      }
      break;
    case "RUN":
      if (!s.machine.psw.halt) {
        s.machine.psw.halt = true; // toggle run
        break;
      }
      memset(s.program.code, s.machine.mem, 0);
      s.machine.psw.pc = 0;
      s.machine.psw.halt = false;
      // TODO: need to relocate prg.
      regset(s.machine.regs[15], 0);
      s.program.code_txt = [];
      break;
    case "STEP":
      {
        if (s.program.breakpoint === s.machine.psw.pc && !s.program.broke) {
          s.machine.psw.halt = true;
          s.program.broke = true;
          break;
        }
        s.program.broke = false;
        const code_txt = step(s.machine.mem, s.machine);
        s.program.code_txt = [code_txt, ...s.program.code_txt.slice(0, 25)];
        if (!s.machine.psw.halt) do_render = false;
      }
      break;
    case "MEM_UPDATE":
      if (value.length === s.machine.mem.length) {
        s.machine.mem = value;
      }
      break;
    case "MEM_RESET":
      s.machine.mem = s.machine.mem.fill(0);
      s.machine.regs.forEach((r) => regset(r, 0));
      break;
    case "ASSEMBLE_SRC":
      {
        const { stmts, bytes, symbols, addressing } = assemble(
          value,
          (eqs) => {
            eqs.EX_EQU = "10";
          },
          (symbols) => {
            symbols["vic"] = {
              pc: s.machine.vic.base + s.machine.vic.regs,
            };
            symbols["screen"] = {
              pc: s.machine.vic.base + s.machine.vic.screen,
            };
          }
        );

        const code_bytes = [
          ...bytes
            .filter((s) => !["ds"].includes(s.stmt.mn.toLowerCase()))
            .map((s) => s.bytes.bytes),
        ].flat();

        /// break into segments
        const ch = chunk(code_bytes, 64).map(bind);
        s.program.obj = ch.reduce((ac, el) => {
          return [...ac, ...el];
        }, []);
        s.program = mk_program_from_obj(s.program.obj, value);
        memset(s.program.code, s.machine.mem, 0);
        s.machine.psw.pc = 0;

        s.program.symbols = symbols;
        s.program.addressing.base = addressing.base;
        s.program.addressing.base_addr = addressing.base_addr;
        s.program.stmts = stmts;
      }
      break;
    case "CYCLES_SET":
      {
        const v = parseInt(value, 10);
        if (!isNaN(v)) {
          s.cyclesPerFrame = Math.max(0, v);
        }
      }
      break;
    case "PSW_PC_SET":
      {
        const v = parseInt(value, 10);
        if (!isNaN(v)) {
          s.machine.psw.pc = Math.max(0, v);
        }
      }
      break;
    case "PSW_PC_RESET":
      {
        s.machine.psw.pc = 0;
        s.program.code_txt = [];
      }
      break;
    default:
      !do_render_sprites && console.log("Unhandled ", type);
  }
  do_render && render(s);
  if (do_render_sprites) {
    saveSprites(s.sprites);
    sprite_render(s.sprites);
  }
  return s;
};

export default actionReducer;
