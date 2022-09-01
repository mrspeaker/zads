export const editor = (input, onSave) => {
  input.addEventListener("keydown", (e) => {
    const { which, metaKey } = e;
    if (which === 9 /* tab */) {
      e.preventDefault();
      input.setRangeText(
        "    ",
        input.selectionStart,
        input.selectionStart,
        "end"
      );
      return null;
    }
    if (metaKey && which === 83 /* cmd-s */) {
      e.preventDefault();
      return onSave(input.value);
    }
    return null;
  });
};
