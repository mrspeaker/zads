const mk_mem = (size) => [...Array(size)].fill(0);
const mk_regs = (num) =>
  [...Array(num)].fill(0).map((r) => [0, 0, 0, 0, 0, 0, 0, 0]);

const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.text())
    .then((r) => r);

  const bytes = obj
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .split(" ")
    .filter((b) => b.trim())
    .map((b) => b.toString(16));

  return bytes;
};

(async function main() {
  const bytes = await loadTxtObj("/a.obj");
  run(bytes);
})();

function run(bytes) {
  const env = {
    pc: 0,
    regs: mk_regs(15),
    mem: mk_mem(100),
  };
  env.pc = step(bytes, env);
  env.pc = step(bytes, env);
  env.pc = step(bytes, env);
  env.pc = step(bytes, env);
}

function step(bytes, env) {
  let idx = env.pc;
  const op = bytes[idx++];
  let opers;
  switch (op) {
    case "07":
      //BCR M1,R2 [RR] - 2 bytes
      //0:'07' 8: M1 12: R2
      opers = bytes[idx++];
      console.log("BCR", opers);
      break;
    case "5a":
      // A R1,D2(X2,B2) [rx] - 4 bytes
      // 0:"5a" 8:r1 12:x2, 16:b2, 20:d2
      opers = bytes.slice(idx, idx + 3);
      idx += 3;
      console.log("A", opers);
      break;
    case "98":
      // LM R1,R3,D2(b2) - 4bytes
      // 0:"98" 8:r1 12:r3 16:b2 20:d2
      opers = bytes.slice(idx, idx + 3);
      idx += 3;
      console.log("LM", opers);

      break;
    case "0d":
      // BSR - 2bytes
      const r1r2 = bytes[idx++];
      console.log("BSR", r1r2);

      break;
    default:
      console.log("wat op?", op);
  }
  return idx;
}
