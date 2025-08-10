document.addEventListener("DOMContentLoaded", function() {
  const html = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("icon-sun");
  const moonIcon = document.getElementById("icon-moon");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    html.classList.toggle("dark", savedTheme === "dark");
  } else {
    html.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  const updateIcons = () => {
    if (html.classList.contains("dark")) {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      moonIcon.classList.remove("hidden");
      sunIcon.classList.add("hidden");
    }
  };
  updateIcons();

  btn.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
    updateIcons();
  });
});
