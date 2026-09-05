(() => {
  const checklistCheckboxSelector = ".page-checklist .checklist-items input[type='checkbox']";
  const resetButton = document.querySelector("#resetChecklistButton");

  const getChecklistCheckboxes = () => Array.from(document.querySelectorAll(checklistCheckboxSelector));

  const focusChecklistItem = (currentCheckbox, direction) => {
    const checkboxes = getChecklistCheckboxes();
    const currentIndex = checkboxes.indexOf(currentCheckbox);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= checkboxes.length) return;

    checkboxes[nextIndex].focus();
    checkboxes[nextIndex].scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  resetButton?.addEventListener("click", () => {
    getChecklistCheckboxes().forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });

    getChecklistCheckboxes()[0]?.focus();
  });

  document.addEventListener("keydown", (event) => {
    const checkbox = event.target;
    if (!(checkbox instanceof HTMLInputElement) || !checkbox.matches(checklistCheckboxSelector)) return;

    if (event.key === "Enter") {
      event.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusChecklistItem(checkbox, 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusChecklistItem(checkbox, -1);
    }
  });
})();
