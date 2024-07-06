export const editor = (input, onSave, onSelect, allowTab = true) => {
  // ctrl-s Save and/or tab key
  (onSave || allowTab) &&
    input.addEventListener("keydown", (e) => {
      const { which, metaKey } = e;
      if (allowTab && which === 9 /* tab */) {
        e.preventDefault();
        input.setRangeText(
          "    ",
          input.selectionStart,
          input.selectionStart,
          "end"
        );
        return null;
      }
      if (onSave && metaKey && which === 83 /* cmd-s */) {
        e.preventDefault();
        return onSave(input.value);
      }
      return null;
    });

  // Selection change
  onSelect &&
    input.addEventListener("selectionchange", ({ target }) => {
      const { selectionStart, selectionEnd } = target;
      const txt = target.value.substring(selectionStart, selectionEnd);
      onSelect(txt, selectionStart, selectionEnd);
    });
};
