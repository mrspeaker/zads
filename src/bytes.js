export const nib = (byte) => [byte >> 4, byte % 16];
export const byte_from = (nib1, nib2) => (nib1 << 4) + nib2;
export const nib3_to_byte = (nib1, nib2, nib3) =>
  (nib1 << 8) + (nib2 << 4) + nib3;
export const nib2_to_byte = (nib1, nib2) => nib3_to_byte(0, nib1, nib2);

export const bytes_to_fw = (a, b, c, d) => {
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

export const chkBytes = (arr, bytes, offset = 0) =>
  bytes.every((b, i) => arr[offset + i] === b);

export const memcpy = (bytes, mem, offset) => {
  bytes.forEach((b, i) => (mem[i + offset] = b));
};

const regval = (r) => bytes_to_fw(...r);
export const regset = (r, num) => {
  const bytes = fw_to_bytes(num);
  r[0] = bytes[0];
  r[1] = bytes[1];
  r[2] = bytes[2];
  r[3] = bytes[3];
};

export const disp_to_nibs = (d) => [(d & 0xf00) >> 8, (d & 0xf0) >> 4, d & 0xf];

const disp = (n1, n2, n3) => (n1 << 8) + (n2 << 4) + n3;
export const base_displace = (x, b, d1, d2, d3) => {
  const D = disp(d1, d2, d3);
  const xx = regval(x);
  const bb = regval(b);
  return (xx ?? 0) + (bb ?? 0) + D;
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
