/* ==========================================================================
   OsonQonun — asosiy skript
   Kutubxonasiz, kichik modullar. Har biri o‘z elementi bo‘lmasa jim o‘tib ketadi,
   shuning uchun bu faylni har bir sahifaga ulash mumkin.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE = { fontScale: "oq-font-scale" };

  /* localStorage ba’zi brauzer rejimlarida (masalan, maxfiy oyna) xato berishi mumkin */
  var store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* e’tiborsiz */ } }
  };

  /* ---------- 1. Mobil menyu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("mobile-nav");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menyuni yopish" : "Menyuni ochish");
      menu.hidden = !open;
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    /* Esc bosilganda menyu yopiladi va fokus tugmaga qaytadi */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* Ekran kengayib desktop menyu chiqsa, mobil menyu yopiq holatga qaytadi */
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- 2. Shrift o‘lchami (A− / A / A+) ---------- */
  function initFontScale() {
    var buttons = document.querySelectorAll("[data-font-scale]:not(html)");
    if (!buttons.length) return;

    function apply(scale) {
      root.setAttribute("data-font-scale", scale);
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.dataset.fontScale === scale));
      });
    }

    apply(store.get(STORAGE.fontScale) || "md");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.dataset.fontScale);
        store.set(STORAGE.fontScale, btn.dataset.fontScale);
      });
    });
  }

  /* ---------- 3. Qidiruv va tezkor so‘rovlar ---------- */
  function initSearch() {
    var form = document.getElementById("hero-search");
    if (!form) return;
    var input = form.querySelector("input[name='q']");

    /* "Ko‘p qidiriladi" chiplari so‘rovni maydonga yozadi va formani yuboradi */
    document.querySelectorAll("[data-query]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        input.value = chip.dataset.query;
        form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });

    /* Bo‘sh so‘rov yuborilmaydi — foydalanuvchi maydonga qaytariladi */
    form.addEventListener("submit", function (event) {
      if (!input.value.trim()) {
        event.preventDefault();
        input.focus();
      }
    });
  }

  /* ---------- 4. Footer yili ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initFontScale();
    initSearch();
    initYear();
  });
})();
