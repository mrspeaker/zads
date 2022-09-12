export const to_nibs = (num, nibs = 2) =>
  [...Array(nibs)].fill(0).map((_, i) => {
    const idx = nibs - i - 1;
    return (num & (Math.pow(0x10, idx + 1) - 1)) >> (idx * 4);
  });

export const from_nibs = (...nibs) => {
  const len = nibs.length - 1;
  return nibs.reduce((total, nib, i) => total + (nib << ((len - i) * 4)), 0);
};
export const byte_from = from_nibs;

export const bytes_to_fw = ([a, b, c, d]) => {
  // Javascript shift ops are signed 32bit
  // ">>> 0" makes the result unsigned
  return ((a << 24) >>> 0) + (b << 16) + (c << 8) + d;
};

export const fw_to_bytes = (num) => [
  (num & 0xff000000) >>> 24,
  (num & 0x00ff0000) >> 16,
  (num & 0x0000ff00) >> 8,
  (num & 0x000000ff) >> 0,
];

export const bytes_eq = (bytes, mem, offset = 0) =>
  bytes.every((b, i) => mem[offset + i] === b);

export const memcpy = (bytes, mem, offset = 0) => {
  bytes.forEach((b, i) => (mem[i + offset] = b));
};
export const memval_f = (mem, offset) =>
  bytes_to_fw([mem[offset], mem[offset + 1], mem[offset + 2], mem[offset + 3]]);

export const regval = bytes_to_fw;
export const regset = (r, num) => {
  const bytes = fw_to_bytes(num);
  r[0] = bytes[0];
  r[1] = bytes[1];
  r[2] = bytes[2];
  r[3] = bytes[3];
};

export const reg_to_mem = (mem, offset, reg) => {
  mem[offset] = reg[0];
  mem[offset + 1] = reg[1];
  mem[offset + 2] = reg[2];
  mem[offset + 3] = reg[3];
};

export const mem_to_reg = (reg, mem, offset) => {
  reg[0] = mem[offset];
  reg[1] = mem[offset + 1];
  reg[2] = mem[offset + 2];
  reg[3] = mem[offset + 3];
};

export const base_displace = (x, b, d1, d2, d3) => {
  const D = from_nibs(d1, d2, d3);
  const xx = x === 0 ? 0 : regval(x);
  const bb = b === 0 ? 0 : regval(b);
  return xx + bb + D;
};
