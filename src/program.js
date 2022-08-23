import { chunk } from "./utils.js";
import { chkBytes } from "./bytes.js";
import { mk_program } from "./state.js";

export const mk_program_from_obj = (obj, src) =>
  Object.assign(mk_program(), {
    goff: obj[0] === 3 && obj[1] === 0xf0,
    obj: chunk(obj, 80),
    src,
    code: codeFromObj(chunk(obj, 80)),
  });

const codeFromObj = (obj) => {
  const txt = obj.filter((r) => chkBytes(r, [0x2, 0xe3, 0xe7, 0xe3]));
  return txt
    .map((t) => {
      const size = t[11];
      return t.slice(16, 16 + size);
    })
    .flat();
};

export const load_prog = async (name) => {
  const obj = await loadTxtObj(`../obj/${name}.o`);
  const src = await loadAsm(`../obj/${name}.asm`);
  return { obj, src };
};

const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.blob())
    .then((r) => r);
  const buf = await obj.arrayBuffer();
  return new Uint8Array(buf);
};

const loadAsm = (path) =>
  fetch(path)
    .then((r) => r.text())
    .then((r) => r);
