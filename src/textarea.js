export const makeTabable = (input) => {
  input.addEventListener("keydown", (e) => {
    if (e.which === 9) {
      e.preventDefault();
      input.setRangeText(
        "    ",
        input.selectionStart,
        input.selectionStart,
        "end"
      );
    }
  });
};
