const CONTACT_EMAIL = "hello.inkwell.designs@gmail.com";
const THEME_STORAGE_KEY = "vdesign-theme";

const readSavedTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch (error) {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {}
};

document.addEventListener("DOMContentLoaded", () => {
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  const themeWelcome = document.querySelector("[data-theme-welcome]");
  const themeChoices = document.querySelectorAll("[data-theme-choice]");
  const continueButton = document.querySelector("[data-theme-continue]");
  let selectedTheme = readSavedTheme();

  const updateThemeControls = (theme) => {
    themeToggles.forEach((toggle) => {
      const nextTheme = theme === "light" ? "dark" : "light";
      toggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      const label = toggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "light" ? "Light" : "Dark";
    });
    themeChoices.forEach((choice) => {
      const isSelected = choice.dataset.themeChoice === theme;
      choice.classList.toggle("is-selected", isSelected);
      choice.setAttribute("aria-pressed", String(isSelected));
    });
  };

  const applyTheme = (theme, shouldSave = false) => {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.dataset.theme = theme;
    selectedTheme = theme;
    updateThemeControls(theme);
    if (shouldSave) saveTheme(theme);
  };

  const savedTheme = readSavedTheme();
  applyTheme(savedTheme || "dark");

  if (!savedTheme && themeWelcome) {
    themeWelcome.classList.add("is-open");
    themeWelcome.setAttribute("aria-hidden", "false");
    document.body.classList.add("theme-lock");
  }

  themeChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
      applyTheme(choice.dataset.themeChoice);
      if (continueButton) continueButton.disabled = false;
    });
  });

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!selectedTheme) return;
      saveTheme(selectedTheme);
      if (themeWelcome) {
        themeWelcome.classList.remove("is-open");
        themeWelcome.setAttribute("aria-hidden", "true");
        document.body.classList.remove("theme-lock");
      }
    });
  }

  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      applyTheme(nextTheme, true);
    });
  });

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".desktop-nav a, .mobile-nav a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  document.querySelectorAll(".glow-surface").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      surface.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projects = document.querySelectorAll("[data-project-trigger][data-category]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        project.hidden = filter !== "all" && project.dataset.category !== filter;
      });
    });
  });

  const modal = document.querySelector(".project-modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalType = document.querySelector(".modal-type");
  const modalDescription = document.querySelector(".modal-description");
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };
  document.querySelectorAll("[data-project-trigger]").forEach((project) => {
    project.addEventListener("click", () => {
      if (!modal) return;
      modalTitle.textContent = project.dataset.title || "Project";
      modalType.textContent = project.dataset.type || "Website project";
      modalDescription.textContent = project.dataset.description || "A thoughtful website built around a real business.";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    });
  });
  document.querySelectorAll("[data-modal-close]").forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get("name");
      const business = formData.get("business");
      const message = formData.get("message");
      const subject = encodeURIComponent(`Website enquiry from ${name}`);
      const body = encodeURIComponent(`Hi vdesign,\n\nMy name is ${name}. I run: ${business}.\n\nWhat I need:\n${message}\n\nThanks!`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  document.querySelectorAll("[data-year]").forEach((item) => {
    item.textContent = new Date().getFullYear();
  });
});