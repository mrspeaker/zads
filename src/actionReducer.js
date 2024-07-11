import { step } from "./emulate.js";
import { assemble } from "./assemble.js";
import { bind } from "./bind.js";
import { mk_program_from_obj } from "./program.js";
import { memset, regset } from "./bytes.js";
import { mk_program } from "./state.js";
import { chunk } from "./utils.js";
import { actionSpriteReducer } from "./actionSpriteReducer.js";
import { vic_regs } from "./vic.js";

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
        s.zads.console = ["loaded " + value];
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

    case "PROGRAM_NEW":
      s.selected = null;
      s.program = mk_program();
      s.program.src = "";
      s.zads.console = [];
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
      s.machine.psw.conditionCode = 0;
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
      s.program.code_txt = [];
      s.program.obj = [];
      break;
    case "ASSEMBLE_SRC":
      {
        try {
          s.zads.console = [`assembling... (${Date.now()})`];
          if (!s.program) {
            s.zads.console.push("no program (press 'new')");
            throw new Error("no program");
          }
          const { stmts, bytes, symbols, addressing, err } = assemble(
            value,
            (eqs) => {
              eqs.EX_EQU = "10";
            },
            (symbols) => {
              // Inject screen and prite symbols
              const { base, regs, screen, maps } = s.machine.vic;
              const vic = base + regs;
              symbols["vic"] = { pc: vic };
              symbols["screen"] = { pc: base + screen, len: 4 };
              symbols["maps"] = { pc: base + maps, len: 4 };
              symbols["time"] = { pc: vic + 0, len: 2 };
              for (let i = 0; i < s.sprites.num_sprites; i++) {
                const sym = `spr${i}_`;
                ["idx", "x", "y"].forEach((suf) => {
                  symbols[sym + suf] = {
                    pc: vic + vic_regs[(sym + suf).toUpperCase()],
                    len: 1,
                  };
                });
              }
              ["left", "right", "up", "down", "fire", "fire_2"].forEach(
                (k, i) => {
                  const key = "key_" + k;
                  symbols[key] = {
                    pc: vic + vic_regs[key.toUpperCase()],
                    len: 1,
                  };
                }
              );
            }
          );
          if (err.length) {
            err
              .reverse()
              .forEach((e) => s.zads.console.push(e.type + ": " + e.msg));
          }

          // Reset the machine (TODO: move this to function. It's duplicated)
          s.machine.psw.pc = 0;
          s.machine.psw.conditionCode = 0;
          s.machine.regs.forEach((r) => regset(r, 0));
          s.machine.mem = s.machine.mem.fill(0);

          // Dump code to memory
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

          // set the maps
          if (s.sprites.use_maps) {
            memset(s.sprites.map, s.machine.mem, symbols.maps.pc);
          }
          s.program.symbols = symbols;
          s.program.addressing.base = addressing.base;
          s.program.addressing.base_addr = addressing.base_addr;
          s.program.stmts = stmts;
          s.zads.console.push(
            "done. ",
            `${s.program.obj.reduce((ac, el) => ac + el.length, 0)} bytes ${
              s.program.stmts.length
            } stmts`
          );
        } catch (e) {
          console.warn("error:", e);
          s.zads.console.push("failed. Error in source.");
          if (s.program) s.program.src = value;
        }
      }
      break;
    case "REG_SET":
      regset(s.machine.regs[value.reg], value.val);
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
        s.machine.psw.conditionCode = 0;
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
