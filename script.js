
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

// ✅ OBSERVER GLOBAL ÚNICO
const globalObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll(".animate")
  .forEach(el => globalObserver.observe(el));

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
    // NOTA: Las flores se manejan por separado abajo




    // ===== FLORES (Sistema de animación por scroll) =====
    const setupFlowerAnimations = () => {
      const flowers = document.querySelectorAll(".details-flower");
      if (!flowers.length) return;

      // Rastrear si la animación ya se inició
      const animated = new Set();

      const checkFlowersInView = () => {
        flowers.forEach((flower) => {
          if (animated.has(flower)) return;

          const rect = flower.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight && rect.bottom > 0;

          if (isInView && !flower.classList.contains("visible")) {
            flower.classList.add("visible");
            animated.add(flower);
          }
        });
      };

      // Ejecutar inmediatamente
      checkFlowersInView();

      // Y también al hacer scroll
      let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      checkFlowersInView();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
    };

    // Ejecutar cuando DOM esté completo
    requestAnimationFrame(() => setupFlowerAnimations());

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
========================================================= */



/* =========================================================
   HOJAS QUE CAEN - Secciones 4 (itinerario) y 6 (final)
   - Inicia al hacer scroll y se detiene cuando el usuario abandona la página
   ========================================================= */
// ========================================
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);

  // ===============================
  // ✅ HOJAS REALISTAS (NUEVO SISTEMA)
  // ===============================

  document.addEventListener("DOMContentLoaded", () => {

    try {
      const targets = [
        document.getElementById("itinerario"),
        document.querySelector(".final-section")
      ].filter(Boolean);

      if (!targets.length) return;

      const containers = new Map();
      const intervals = new Map();

      // 🔹 ARRAY GLOBAL
      const leaves = [];
      let leafAnimationRunning = false;
      let lastTime = 0;

      // 🔹 CONTENEDOR
      const createContainer = (section) => {
        if (containers.has(section)) return containers.get(section);

        const el = document.createElement("div");
        el.className = "leaves-container";
        el.setAttribute("aria-hidden", "true");

        section.appendChild(el);
        containers.set(section, el);

        return el;
      };

      // 🔹 CREAR HOJA
      const createLeaf = (container) => {
        const el = document.createElement("img");
        el.src = "img/leaf.png";
        el.className = "falling-leaf";

        const leaf = {
          el,
          x: Math.random() * window.innerWidth,
          y: -20,
          vx: (Math.random() - 0.5) * 20,
          vy: 40 + Math.random() * 15,
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 120,
          size: 0.6 + Math.random() * 0.6,
          life: 0,
          offset: Math.random() * 1000
        };

        el.style.width = `${40 * leaf.size*0.8*1*1}px`;
        el.style.position = "absolute";

        container.appendChild(el);
        leaves.push(leaf);

        if (!leafAnimationRunning) {
          leafAnimationRunning = true;
          requestAnimationFrame(animateLeaves);
        }
      };

      // 🔹 ANIMACIÓN ORGÁNICA
      const animateLeaves = (time) => {
        const dt = Math.min((time - lastTime) / 1000, 0.033);
        lastTime = time;

        for (let i = leaves.length - 1; i >= 0; i--) {
          const leaf = leaves[i];

          leaf.life += dt;

          // 🌬️ viento realista
          const windBase = Math.sin(leaf.life * 0.5 + leaf.offset) * 20;
const windDetail = Math.sin(leaf.life * 2.5 + leaf.offset * 0.3) * 8;

const wind = windBase + windDetail;
// 🍃 vibración natural de hoja (flutter)
const flutter = Math.sin(leaf.life * 8 + leaf.offset) * 3;
leaf.vx += flutter * dt;
          leaf.vx += wind * dt;
          leaf.vx *= 0.98;

          leaf.x += leaf.vx * dt * 1.65;
          leaf.y += leaf.vy * dt * 1.65;

          // rotación irregular
          leaf.vr += Math.sin(leaf.life * 2) * 2;
          leaf.rotation += leaf.vr * dt;

          // escala dinámica (profundidad)
          const scale = (0.85 + Math.sin(leaf.life * 2) * 0.1)*1.5 ;
          const rotX = Math.sin(leaf.life * 2 + leaf.offset) * 60;
          const rotY = Math.cos(leaf.life * 1.5 + leaf.offset) * 40;

leaf.el.style.transform = `
  translate(${leaf.x}px, ${leaf.y}px)
  rotate(${leaf.rotation}deg)
  rotateX(${rotX}deg)
  rotateY(${rotY}deg)
  scale(${scale})
`;
          // ✅ transparencia progresiva
          const opacity = 0.7 - (leaf.y / window.innerHeight) * 0.6;
          leaf.el.style.opacity = Math.max(opacity, 0.15);

          // eliminar cuando sale
          if (leaf.y > window.innerHeight + 100) {
            leaf.el.remove();
            leaves.splice(i, 1);
          }
        }

        if (leaves.length > 0) {
          requestAnimationFrame(animateLeaves);
        } else {
          leafAnimationRunning = false;
        }
      };

      // 🔹 SPAWN
      const startSpawning = (section) => {
        if (intervals.has(section)) return;

        const container = createContainer(section);

        const iv = setInterval(() => {
          createLeaf(container);
        }, 700 + Math.random() * 800);

        intervals.set(section, iv);
      };

      // 🔹 STOP
      const stopSpawning = (section) => {
        const iv = intervals.get(section);
        if (iv) {
          clearInterval(iv);
          intervals.delete(section);
        }
      };

      const stopAllAndClear = () => {
        intervals.forEach((iv) => clearInterval(iv));
        intervals.clear();

        leaves.forEach(l => l.el.remove());
        leaves.length = 0;
      };

      // 🔹 OBSERVER
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const sec = entry.target;
          if (entry.isIntersecting) startSpawning(sec);
          else stopSpawning(sec);
        });
      }, { threshold: 0.12 });

      targets.forEach((t) => observer.observe(t));

      // 🔹 PERFORMANCE
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAllAndClear();
      });

      window.addEventListener("pagehide", stopAllAndClear);
      window.addEventListener("beforeunload", stopAllAndClear);

    } catch (e) {
      console.warn("Leaf animation failed:", e);
    }
  });

})();