export const nib = (byte) => [byte >> 4, byte % 16];
export const byte_from = (nib1, nib2) => (nib1 << 4) + nib2;
export const nib3_to_byte = (nib1, nib2, nib3) =>
  (nib1 << 8) + (nib2 << 4) + nib3;
export const nib2_to_byte = (nib1, nib2) => nib3_to_byte(0, nib1, nib2);
export const fullword = (a, b, c, d) => (a << 24) + (b << 16) + (c << 8) + d;

export const chkBytes = (arr, bytes, offset = 0) =>
  bytes.every((b, i) => arr[offset + i] === b);

export const memcpy = (bytes, mem, offset) => {
  bytes.forEach((b, i) => (mem[i + offset] = b));
};

const regval = (r) => fullword(...r);

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
