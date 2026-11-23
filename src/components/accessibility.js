// Rend un élément non-bouton cliquable au clavier (Entrée / Espace) et annoncé comme bouton
export const a11yClick = (fn, label) => ({
  role: "button",
  tabIndex: 0,
  onClick: fn,
  onKeyDown: (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn(e);
    }
  },
  ...(label ? { "aria-label": label } : {}),
});
