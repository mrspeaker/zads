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
    console.log(which, metaKey);
    if (metaKey && which === 83 /* s */) {
      console.log("what");
      e.preventDefault();
      return onSave(input.value);
    }
    return null;
  });
};
