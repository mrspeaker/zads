export const bind = (bytes) =>
  [
    ...header_id,
    ...fill(4, 10),
    bytes.length,
    ...fill(12, 15),
    ...bytes,
  ].flat();

const header_id = [2, 227, 231, 227]; // 2, TXT
const fill = (from, to) => [...Array(to - from)].fill(0x40);
