const carousel = document.querySelector("[data-carousel]");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");
const pages = Array.from(document.querySelectorAll("[data-page]"));
const routeLinks = Array.from(document.querySelectorAll("[data-route-link]"));

const getRoute = () => {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith("menu-")) return "menu";
  return pages.some((page) => page.dataset.page === hash) ? hash : "uvod";
};

let activeRoute = "";

const renderRoute = () => {
  const route = getRoute();
  const routeChanged = route !== activeRoute;
  activeRoute = route;

  pages.forEach((page) => {
    page.hidden = page.dataset.page !== route;
  });

  routeLinks.forEach((link) => {
    const isCurrent = link.dataset.routeLink === route;
    link.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (routeChanged) {
    window.scrollTo(0, 0);
  }

  if (route === "menu" && window.location.hash.startsWith("#menu-")) {
    requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    });
  }
};

renderRoute();
window.addEventListener("hashchange", renderRoute);

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll(".carousel-image"));
  const dots = Array.from(carousel.querySelectorAll(".carousel-dot"));
  const currentSlide = carousel.querySelector("[data-current-slide]");
  let activeIndex = 0;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    currentSlide.textContent = String(activeIndex + 1);
  };

  carousel.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      showSlide(activeIndex + Number(button.dataset.direction));
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.index));
    });
  });
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navToggle.setAttribute("aria-label", isExpanded ? "Otvoriť navigáciu" : "Zavrieť navigáciu");
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Otvoriť navigáciu");
      primaryNav.classList.remove("is-open");
    }
  });
}

const reservationForm = document.querySelector("[data-reservation-form]");
const formStatus = document.querySelector("[data-form-status]");

if (reservationForm && formStatus) {
  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Táto ukážka neprenáša rezerváciu. Rezerváciu potvrďte telefonicky na +421 949 212 446.";
  });
}