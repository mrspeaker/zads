export const bind = (bytes) =>
  [
    ...header_0_3,
    ...fill(4, 10),
    bytes.length,
    ...fill(12, 15),
    ...bytes,
  ].flat();

const header_0_3 = [2, 227, 231, 227]; // 2, TXT
const fill = (from, to) => [...Array(to - from)].fill(0x40);
