window.addEventListener("load", function () {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  }, 3000);
});

(function () {
  "use strict";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       PROFILE CRT+SCANLINE
       ========================= */
    (function initCRT() {
      const crt = $(".profile.crt");
      const scan = $(".scanline");

      if (!crt || !scan) return;

      setTimeout(() => {
        crt.classList.add("play");
        scan.classList.add("play");
      }, 120);

      crt.addEventListener("animationend", (e) => {
        if (e.animationName === "revealFollowScan") {
          crt.style.clipPath = "inset(0 0 0 0)";
          crt.classList.remove("play");
        }
      });

      scan.addEventListener("animationend", (e) => {
        if (e.animationName === "scanlineMove") {
          scan.style.top = "0";
          scan.classList.remove("play");
        }
      });
    })();

    /* =========================
       TYPEWRITER
       ========================= */
    (function initTypewriter() {
      const typewriterEls = $$(".typewriter");
      if (!typewriterEls.length) return;

      function typeElement(el, callback) {
        const originalText = el.dataset.text || el.textContent.trim();
        const speed = parseInt(el.dataset.speed || "80", 10) || 80;

        el.innerHTML = "";
        const textSpan = document.createElement("span");
        textSpan.className = "type-text";
        el.appendChild(textSpan);

        const caretSpan = document.createElement("span");
        caretSpan.className = "caret";
        el.appendChild(caretSpan);

        let i = 0;
        function typeChar() {
          if (i < originalText.length) {
            textSpan.textContent = originalText.substring(0, i + 1);
            i++;
            setTimeout(typeChar, speed);
          } else {
            setTimeout(() => {
              if (caretSpan.parentNode) caretSpan.remove();
            }, 400);
            if (typeof callback === "function") setTimeout(callback, 400);
          }
        }
        typeChar();
      }

      // sequential typing
      let idx = 0;
      function next() {
        if (idx < typewriterEls.length) {
          typeElement(typewriterEls[idx], () => {
            idx++;
            next();
          });
        }
      }
      //delay for till booting panel is gone!
      setTimeout(next, 3000);
    })();

    /* =========================
       STICKY NAV
       ========================= */
    (function initStickyNav() {
      const nav = $("nav");
      const scrollButton = $(".scroll-button a") || null;

      if (!nav) return;

      window.addEventListener(
        "scroll",
        () => {
          const scrolled = document.documentElement.scrollTop || window.scrollY;
          if (scrolled > 20) {
            nav.classList.add("sticky");
            if (scrollButton) scrollButton.style.display = "block";
          } else {
            nav.classList.remove("sticky");
            if (scrollButton) scrollButton.style.display = "none";
          }
        },
        { passive: true },
      );
    })();

    /* =========================
       GRID PARALLAX
       ========================= */
    (function initGridParallax() {
      window.addEventListener(
        "scroll",
        () => {
          const offset = window.scrollY * 0.05;
          document.body.style.setProperty("--grid-offset", `${offset}px`);
        },
        { passive: true },
      );
    })();

    /* =========================
       SMOOTH SCROLL
       ========================= */

    (function initSmoothAnchors() {
      const anchors = $$('a[href^="#"]');
      if (!anchors.length) return;
      const navEl = $("nav");

      anchors.forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          if (!href || href === "#") return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();

          const navHeight = navEl ? navEl.offsetHeight || 70 : 70;
          const targetPos =
            target.getBoundingClientRect().top +
            window.scrollY -
            (navHeight + 6);

          window.scrollTo({
            top: targetPos,
            behavior: "smooth",
          });

          // Close mobile sidebar if open
          if (document.body.classList.contains("sidebar-open")) {
            document.body.classList.remove("sidebar-open");
            const btn = document.querySelector(".menu-btn.mobile-menu-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");
          }
        });
      });
    })();

    /* =========================
       MOBILE SIDEBAR & HAMBURGER
       ========================= */
    (function initMobileSidebar() {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;

      // avoid creating duplicates
      let menuBtn = document.querySelector(".menu-btn.mobile-menu-btn");
      if (!menuBtn) {
        menuBtn = document.createElement("button");
        menuBtn.className = "menu-btn mobile-menu-btn";
        menuBtn.setAttribute("aria-label", "Open menu");
        menuBtn.setAttribute("aria-expanded", "false");

        const icon = document.createElement("i");
        icon.className = "fas fa-bars";
        icon.setAttribute("aria-hidden", "true");
        menuBtn.appendChild(icon);
        navbar.appendChild(menuBtn);
      } else {
        if (!menuBtn.querySelector("i.fas")) {
          menuBtn.innerHTML = "";
          const icon = document.createElement("i");
          icon.className = "fas fa-bars";
          icon.setAttribute("aria-hidden", "true");
          menuBtn.appendChild(icon);
        }
      }

      let sidebar = document.querySelector(".mobile-sidebar");
      if (!sidebar) {
        sidebar = document.createElement("nav");
        sidebar.className = "mobile-sidebar";
        sidebar.setAttribute("aria-label", "Mobile navigation");
        sidebar.innerHTML = `
          <button class="mobile-close" aria-label="Close menu">&times;</button>
          <ul class="mobile-menu-list" role="menu">
            <li role="none"><a role="menuitem" href="#home">Home</a></li>
            <li role="none"><a role="menuitem" href="#about">About</a></li>
            <li role="none"><a role="menuitem" href="#projects">Projects</a></li>
            <li role="none"><a role="menuitem" href="#foot">Contact</a></li>
          </ul>
        `;
        document.body.appendChild(sidebar);
      }

      let overlay = document.querySelector(".mobile-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "mobile-overlay";
        document.body.appendChild(overlay);
      }

      function openSidebar() {
        document.body.classList.add("sidebar-open");
        menuBtn.setAttribute("aria-expanded", "true");
        setTimeout(() => {
          const first = sidebar.querySelector("a");
          if (first) first.focus();
        }, 200);
      }
      function closeSidebar() {
        document.body.classList.remove("sidebar-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }

      // event bindings
      menuBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (document.body.classList.contains("sidebar-open")) closeSidebar();
        else openSidebar();
      });

      overlay.addEventListener("click", closeSidebar);

      const closeBtn = sidebar.querySelector(".mobile-close");
      if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

      // close on Escape
      document.addEventListener("keydown", (ev) => {
        if (
          ev.key === "Escape" &&
          document.body.classList.contains("sidebar-open")
        )
          closeSidebar();
      });

      // close on link click
      sidebar.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", () => closeSidebar());
      });

      // sidebar closes when resizing to desktop
      window.addEventListener("resize", () => {
        if (
          window.innerWidth > 900 &&
          document.body.classList.contains("sidebar-open")
        ) {
          document.body.classList.remove("sidebar-open");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });

      // Also close
      $$(".menu a").forEach((a) =>
        a.addEventListener("click", () => {
          if (document.body.classList.contains("sidebar-open")) {
            document.body.classList.remove("sidebar-open");
            menuBtn.setAttribute("aria-expanded", "false");
          }
        }),
      );
    })();

    /* ================================================== */
    (function tidyTopNavLinks() {
      const navBar = document.querySelector(".navbar");
      if (!navBar) return;
      $$(".menu li a").forEach((a) => {
        a.addEventListener("click", () => {
          navBar.classList.remove("active");
        });
      });
    })();

    /* =========================
       SHOW MORE FUNCTIONALITY
       ========================= */
    (function initShowMore() {
      const showMoreBtns = $$(".show-more-btn");
      if (!showMoreBtns.length) return;

      showMoreBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const target = this.getAttribute("data-target");
          let section;

          // Find the appropriate section
          if (target === "skills") {
            section = $(".skills .skills-details");
          } else if (target === "services") {
            section = $(".services .skills-details");
          } else if (target === "qualifications") {
            section = $(".qualifications .timeline");
          } else if (target === "projects") {
            section = $(".projects .projects-grid");
          }

          if (!section) return;

          // Toggle show-more-active class
          if (section.classList.contains("show-more-active")) {
            // Hide extra items
            section.classList.remove("show-more-active");
            this.textContent = "Show More";

            // Scroll back to section title smoothly
            const sectionElement = this.closest("section");
            if (sectionElement) {
              const navHeight = $("nav") ? $("nav").offsetHeight || 70 : 70;
              const targetPos =
                sectionElement.getBoundingClientRect().top +
                window.scrollY -
                (navHeight + 20);
              window.scrollTo({
                top: targetPos,
                behavior: "smooth",
              });
            }
          } else {
            // Show extra items
            section.classList.add("show-more-active");
            this.textContent = "Show Less";
          }
        });
      });
    })();

    /* =========================
       CLEAN SECTION TRANSITIONS
       ========================= */
    (function initSectionTransitions() {
      const sections = $$("section");
      if (!sections.length) return;

      let currentSectionIndex = 0;

      function updateSections() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Find which section is currently active (closest to viewport center)
        const viewportCenter = scrollPosition + windowHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        sections.forEach((section, index) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionCenter = sectionTop + sectionHeight / 2;

          const distance = Math.abs(sectionCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        // Apply styles to all sections
        sections.forEach((section, index) => {
          if (index === closestIndex) {
            // Active section - fully visible
            section.style.opacity = "1";
            section.style.transform = "scale(1) translateZ(0)";
            section.style.pointerEvents = "auto";
            section.style.zIndex = "10";
          } else {
            // Inactive sections - faded
            section.style.opacity = "0.3";
            section.style.transform = "scale(0.97) translateZ(0)";
            section.style.pointerEvents = "none";
            section.style.zIndex = "1";
          }
        });

        currentSectionIndex = closestIndex;
      }

      // Update on scroll with throttling
      let ticking = false;
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              updateSections();
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true },
      );

      // Initial update
      updateSections();

      // Update after short delay to ensure correct initial state
      setTimeout(updateSections, 100);
    })();
  });
})();

function openCert(src) {
  document.getElementById("modalImg").src = src;
  document.getElementById("certModal").classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent scrolling
}

function closeCert() {
  document.getElementById("certModal").classList.remove("active");
  document.body.style.overflow = "";
}

// Close on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCert();
});
