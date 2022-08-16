export const nib = (byte) => [byte >> 4, byte % 16];
export const byte_from = (nib1, nib2) => (nib1 << 4) + nib;
export const nib3_to_byte = (nib1, nib2, nib3) =>
  (nib1 << 8) + (nib2 << 4) + nib3;

export const chunk = (arr, size) =>
  arr.reduce(
    (ac, el) => {
      const a = ac[ac.length - 1];
      if (a.length === size) ac.push([]);
      ac[ac.length - 1].push(el);
      return ac;
    },
    [[]]
  );

export const $ = (sel) => document.querySelector(sel);
export const $click = (sel, f) => $(sel).addEventListener("click", f, false);
