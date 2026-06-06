
// ========================================
// Init + DOMContentLoaded (VERSIÓN LIMPIA)
// ========================================
(() => {
  "use strict";

  // ---------- Viewport fix: --vh (fallback real en móviles) ----------
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  // Throttle con requestAnimationFrame para no recalcular de más
  let rafId = null;
  const onResize = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(setVH);
  };

  setVH();
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(setVH, 250), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onResize, { passive: true });
  }


const scrollIndicator = document.querySelector(".scroll-indicator");

if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  });
}


  // ---------- Helpers ----------
  const byId = (id) => document.getElementById(id);

  // ---------- Main ----------
  document.addEventListener("DOMContentLoaded", () => {
    const container = byId("container");
    const contentPage2 = byId("content-page2");
    const flash = byId("flash");

    const music = byId("music");
    const audioToggle = byId("audio-toggle");

    let started = false;
    let countdownTimer = null;

    // ===== AUDIO (botón) =====
    const updateAudioButton = () => {
      if (!music || !audioToggle) return;
      const isPlaying = !music.paused;
      audioToggle.textContent = isPlaying ? "⏸ Pausar música" : "▶ Reprod. música";
      audioToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      audioToggle.classList.toggle("playing", isPlaying);
    };

    if (music && audioToggle) {
      music.volume = 0.35;

      audioToggle.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (music.paused) await music.play();
          else music.pause();
        } catch {
          // Autoplay/Play bloqueado por políticas del navegador
          // El usuario puede volver a pulsar el botón.
        }
        updateAudioButton();
      });

      music.addEventListener("play", updateAudioButton);
      music.addEventListener("pause", updateAudioButton);
      updateAudioButton();
    }

    // ===== COUNTDOWN (se inicia cuando se abre el sobre) =====
    const startCountdown = () => {
      const elDays = byId("days");
      const elHours = byId("hours");
      const elMinutes = byId("minutes");
      const elSeconds = byId("seconds");

      if (!elDays || !elHours || !elMinutes || !elSeconds) return;

      const targetDate = new Date("August 1, 2026 00:00:00").getTime();
      const fmt = (n, p) => String(n).padStart(p, "0");

      const tick = () => {
        const distance = targetDate - Date.now();

        if (distance <= 0) {
          elDays.textContent = "000";
          elHours.textContent = "00";
          elMinutes.textContent = "00";
          elSeconds.textContent = "00";
          if (countdownTimer) clearInterval(countdownTimer);
          return;
        }

        const days = Math.floor(distance / 86400000);
        const hours = Math.floor((distance % 86400000) / 3600000);
        const minutes = Math.floor((distance % 3600000) / 60000);
        const seconds = Math.floor((distance % 60000) / 1000);

        elDays.textContent = fmt(days, 3);
        elHours.textContent = fmt(hours, 2);
        elMinutes.textContent = fmt(minutes, 2);
        elSeconds.textContent = fmt(seconds, 2);
      };

      tick();
      countdownTimer = setInterval(tick, 1000);
    };

    // ===== ANIMACIONES (IntersectionObserver) =====
    const setupAnimations = () => {
      const els = document.querySelectorAll(".animate");
      if (!els.length) return;

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "50px" });

      els.forEach((el) => observer.observe(el));
    };

    setupAnimations(); // puede ejecutarse ya

    // ===== CONFETI (BOTÓN APORTACIÓN) =====
    const confettiCanvas = byId("confetti-canvas");
    const confettiCtx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
    let confettiAnimating = false;
    let confettiLastTime = 0;
    const resizeConfetti = () => {
      if (!confettiCanvas || !confettiCtx) return;
      const dpr = window.devicePixelRatio || 1;
      confettiCanvas.width = window.innerWidth * dpr;
      confettiCanvas.height = window.innerHeight * dpr;
      confettiCanvas.style.width = `${window.innerWidth}px`;
      confettiCanvas.style.height = `${window.innerHeight}px`;
      confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const startConfettiAnimation = () => {
      if (!confettiCanvas || confettiAnimating) return;
      confettiAnimating = true;
      confettiLastTime = 0;
      confettiCanvas.classList.add("confetti-show");
      requestAnimationFrame(drawConfetti);
    };

    const confettiParticles = [];
    const createConfetti = (x, y, count = 120) => {
      if (!confettiCtx) return;
      const colors = ["#ff4d4f", "#ffd700", "#40a9ff", "#73d13d", "#ff85c0"];
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI - Math.PI / 2;
        const speed = 220 + Math.random() * 240;
        confettiParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed * 0.8 + (Math.random() - 0.5) * 80,
          vy: Math.sin(angle) * speed * 0.8 + (Math.random() - 0.5) * 80,
          size: 6 + Math.random() * 8,
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 720,
          color: colors[Math.floor(Math.random() * colors.length)],
          gravity: 900 + Math.random() * 300,
          life: 0,
          duration: 1800 + Math.random() * 800,
        });
      }
      startConfettiAnimation();
    };

    const drawConfetti = (time) => {
      if (!confettiCanvas || !confettiCtx) return;
      const now = time || performance.now();
      const delta = confettiLastTime ? Math.min((now - confettiLastTime) / 1000, 0.04) : 0.016;
      confettiLastTime = now;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      for (let i = confettiParticles.length - 1; i >= 0; i -= 1) {
        const p = confettiParticles[i];
        p.life += delta * 1000;
        if (p.life > p.duration) {
          confettiParticles.splice(i, 1);
          continue;
        }

        p.vy += p.gravity * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.rotation += p.vr * delta;
        const opacity = 1 - p.life / p.duration;

        confettiCtx.save();
        confettiCtx.globalAlpha = opacity;
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.35);
        confettiCtx.restore();
      }

      if (confettiParticles.length) {
        requestAnimationFrame(drawConfetti);
      } else {
        confettiAnimating = false;
        confettiLastTime = 0;
        confettiCanvas.classList.remove("confetti-show");
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    };

    resizeConfetti();
    window.addEventListener("resize", resizeConfetti, { passive: true });

    // ===== SOBRE -> ABRIR =====
    const openEnvelope = async () => {
      if (!container || !contentPage2) return;
      if (started) return;
      started = true;

      document.body.style.overflow = "hidden";
      void container.offsetHeight; // reflow para disparar transición

      container.classList.add("open");

      setTimeout(() => flash?.classList.add("active"), 900);

      setTimeout(async () => {
        container.style.display = "none";
        contentPage2.classList.remove("content-page2-hidden");
        contentPage2.classList.add("content-page2-visible");

        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);

        // Iniciar contador cuando ya está visible
        startCountdown();

        // Reproducir música (hay gesto del usuario)
        if (music) {
          try { await music.play(); } catch {}
          updateAudioButton();
        }
      }, 1400);
    };

    if (container) {
      // Accesibilidad: también por teclado en desktop/móvil
      container.setAttribute("role", "button");
      container.setAttribute("tabindex", "0");
      container.setAttribute("aria-label", "Haz clic para abrir la invitación");

      container.addEventListener("click", openEnvelope);
      container.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openEnvelope();
        }
      });
    }

// =========================================================
// SECCIÓN 4: DETALLES2 (Aportación: CUADRO VERDE + toggles)
// y  Formulario
// =========================================================
const giftBtn = byId("d2VideoBtn");     // reutilizamos tu mismo botón
const giftPop = byId("d2GiftPop");

const toggleYape = byId("toggleYape");
const yapeData = byId("yapeData");
const toggleIbam = byId("toggleIbam");
const ibamData = byId("ibamData");

const openGift = () => {
  if (!giftBtn || !giftPop) return;
  giftPop.classList.add("is-open");
  giftBtn.classList.add("is-active");
  giftPop.setAttribute("aria-hidden", "false");
  giftBtn.setAttribute("aria-expanded", "true");
};

const closeGift = () => {
  if (!giftBtn || !giftPop) return;
  giftPop.classList.remove("is-open");
  giftBtn.classList.remove("is-active");
  giftPop.setAttribute("aria-hidden", "true");
  giftBtn.setAttribute("aria-expanded", "false");
};

const toggleGift = () => {
  if (!giftPop) return;
  const isOpen = giftPop.classList.contains("is-open");
  if (isOpen) closeGift();
  else openGift();
};

if (giftBtn && giftPop) {
  giftBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ Mantengo tu confeti cuando se pulsa Aportación
    const rect = giftBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createConfetti(x, y, 110);

    toggleGift();
  });

  // Cerrar al hacer click fuera (sin mover layout)
  document.addEventListener("click", (e) => {
    if (!giftPop.classList.contains("is-open")) return;
    const clickInside = giftPop.contains(e.target) || giftBtn.contains(e.target);
    if (!clickInside) closeGift();
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && giftPop.classList.contains("is-open")) {
      closeGift();
    }
  });
}

// --- Toggle Mostrar YAPE ---
if (toggleYape && yapeData) {
  toggleYape.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = yapeData.hasAttribute("hidden");
    if (isHidden) {
      yapeData.removeAttribute("hidden");
      toggleYape.setAttribute("aria-expanded", "true");
    } else {
      yapeData.setAttribute("hidden", "");
      toggleYape.setAttribute("aria-expanded", "false");
    }
  });
}

// --- Toggle Mostrar IBAM ---
if (toggleIbam && ibamData) {
  toggleIbam.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = ibamData.hasAttribute("hidden");
    if (isHidden) {
      ibamData.removeAttribute("hidden");
      toggleIbam.setAttribute("aria-expanded", "true");
    } else {
      ibamData.setAttribute("hidden", "");
      toggleIbam.setAttribute("aria-expanded", "false");
    }
  });
}


    // -------- FORMULARIO OVERLAY --------
    const formBtn = byId("d2FormBtn");
    const modal = byId("d2Modal");
    const backdrop = byId("d2Backdrop");
    const form = byId("d2Form");

    const openModal = () => {
      if (!formBtn || !modal) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      formBtn.classList.add("is-active");
      formBtn.setAttribute("aria-expanded", "true");
    };

    const closeModal = () => {
      if (!formBtn || !modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      formBtn.classList.remove("is-active");
      formBtn.setAttribute("aria-expanded", "false");
    };

    if (formBtn && modal) {
      formBtn.addEventListener("click", openModal);
    }

    if (backdrop) {
      backdrop.addEventListener("click", closeModal);
    }

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Enviar a Formspree y cerrar (sin salir de la página)
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = byId("d2Submit");
        if (submitBtn) submitBtn.disabled = true;

        try {
          const data = new FormData(form);
          const res = await fetch(form.action, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
          });

          // cerrar siempre como pediste
          closeModal();
          form.reset();

          // fallback si falla
          if (!res.ok) form.submit();
        } catch {
          closeModal();
          form.submit();
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  });
})();


/* =========================================================
   ITINERARIO: activar animación al entrar en pantalla
   (compatible con tu .animate / .visible)
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const it2Els = document.querySelectorAll(".it2-section, .it2-row");

  if (!("IntersectionObserver" in window)) {
    it2Els.forEach(el => el.classList.add("visible"));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  it2Els.forEach(el => obs.observe(el));
});
