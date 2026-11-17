const splashScreen = document.querySelector("[data-splash-screen]");

if (splashScreen) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    splashScreen.remove();
  } else {
    splashScreen.addEventListener("animationend", (event) => {
      if (event.target === splashScreen) {
        splashScreen.remove();
      }
    });
  }
}

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
const reservationDialog = document.querySelector("[data-reservation-dialog]");
const reservationMessage = document.querySelector("[data-reservation-message]");
const reservationDateSummary = document.querySelector("[data-reservation-date]");
const reservationTimeSummary = document.querySelector("[data-reservation-time]");
const reservationGuests = document.querySelector("[data-reservation-guests]");
const closeReservationDialog = document.querySelector("[data-close-reservation-dialog]");
const reservationList = document.querySelector("[data-reservation-list]");
const reservationStorageKey = "poliankaReservations";

if (
  reservationForm &&
  formStatus &&
  reservationDialog &&
  reservationMessage &&
  reservationDateSummary &&
  reservationTimeSummary &&
  reservationGuests &&
  closeReservationDialog &&
  reservationList
) {
  document.body.append(reservationDialog);

  const isValidDate = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsedDate = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  };

  const isReservation = (value) =>
    value &&
    typeof value.name === "string" &&
    typeof value.phone === "string" &&
    typeof value.date === "string" &&
    isValidDate(value.date) &&
    typeof value.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) &&
    ["1", "2", "3", "4", "5", "6"].includes(value.guests) &&
    typeof value.childChair === "boolean" &&
    typeof value.notes === "string";

  const getReservations = () => {
    const storedReservations = window.localStorage.getItem(reservationStorageKey);
    if (storedReservations === null) return [];

    const reservations = JSON.parse(storedReservations);
    if (!Array.isArray(reservations) || !reservations.every(isReservation)) {
      throw new Error("Uložené rezervácie majú neplatný formát.");
    }

    return reservations;
  };

  const formatDate = (date) =>
    new Intl.DateTimeFormat("sk-SK", { dateStyle: "long" }).format(
      new Date(`${date}T00:00:00`),
    );

  const formatGuestCount = (guests) => {
    const count = Number(guests);
    if (count === 1) return `${guests} osoba`;
    return count <= 4 ? `${guests} osoby` : `${guests} osôb`;
  };

  const renderReservations = (reservations) => {
    reservationList.replaceChildren();

    if (reservations.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "saved-reservations-empty";
      emptyMessage.textContent = "Zatiaľ nemáte uložené žiadne rezervácie.";
      reservationList.append(emptyMessage);
      return;
    }

    reservations.forEach((reservation) => {
      const card = document.createElement("article");
      card.className = "saved-reservation";

      const name = document.createElement("h3");
      name.textContent = reservation.name;
      card.append(name);

      const details = document.createElement("dl");
      const entries = [
        ["Dátum", formatDate(reservation.date)],
        ["Čas", reservation.time],
        ["Počet osôb", formatGuestCount(reservation.guests)],
        ["Telefón", reservation.phone],
        ["Detská stolička", reservation.childChair ? "Áno" : "Nie"],
      ];
      if (reservation.notes) entries.push(["Poznámky", reservation.notes]);

      entries.forEach(([label, value]) => {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = value;
        row.append(term, description);
        details.append(row);
      });

      card.append(details);
      reservationList.append(card);
    });
  };

  try {
    renderReservations(getReservations());
  } catch (error) {
    console.error("Nepodarilo sa načítať lokálne rezervácie.", error);
    formStatus.textContent = "Uložené rezervácie sa nepodarilo načítať.";
  }

  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const guestName = reservationForm.elements.namedItem("name").value.trim();
    const guestCount = reservationForm.elements.namedItem("guests").value;
    const reservation = {
      name: guestName,
      phone: reservationForm.elements.namedItem("phone").value.trim(),
      date: reservationForm.elements.namedItem("date").value,
      time: reservationForm.elements.namedItem("time").value,
      guests: guestCount,
      childChair: reservationForm.elements.namedItem("child-chair").checked,
      notes: reservationForm.elements.namedItem("notes").value.trim(),
    };

    let reservations;
    try {
      reservations = getReservations();
      reservations.push(reservation);
      window.localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
    } catch (error) {
      console.error("Nepodarilo sa uložiť lokálnu rezerváciu.", error);
      formStatus.textContent =
        "Rezerváciu sa nepodarilo uložiť. Skontrolujte úložisko prehliadača a skúste znova.";
      return;
    }

    renderReservations(reservations);
    reservationMessage.textContent = `Ďakujeme za rezerváciu, ${guestName}! 🏔️ Tešíme sa na vašu návštevu v Reštaurácii Tatranská Polianka.`;
    reservationDateSummary.textContent = formatDate(reservation.date);
    reservationTimeSummary.textContent = reservation.time;
    reservationGuests.textContent = formatGuestCount(reservation.guests);
    formStatus.textContent = "Rezervácia bola uložená v tomto prehliadači.";
    reservationDialog.showModal();
  });

  closeReservationDialog.addEventListener("click", () => {
    reservationDialog.close();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== reservationStorageKey && event.key !== null) return;

    try {
      renderReservations(getReservations());
    } catch (error) {
      console.error("Nepodarilo sa obnoviť lokálne rezervácie.", error);
      formStatus.textContent = "Uložené rezervácie sa nepodarilo načítať.";
    }
  });
}