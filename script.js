/* =========================================================
   KAN STUDIO — JavaScript
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Menú hamburguesa ---------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- 2. Header con scroll + Back to top ---------- */
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 50);
    if (backToTop) backToTop.classList.toggle('show', y > 500);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 3. Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- 4. Cuenta regresiva Reto 21 días ---------- */
  const STORAGE_KEY = 'kan_reto_target';

  function getTargetDate() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return new Date(parseInt(stored, 10));

      const target = new Date();
      target.setDate(target.getDate() + 21);
      localStorage.setItem(STORAGE_KEY, String(target.getTime()));
      return target;
    } catch (e) {
      const target = new Date();
      target.setDate(target.getDate() + 21);
      return target;
    }
  }

  const targetDate = getTargetDate();
  const cdDias = document.getElementById('cd-dias');
  const cdHoras = document.getElementById('cd-horas');
  const cdMin = document.getElementById('cd-min');
  const cdSeg = document.getElementById('cd-seg');

  const pad = n => String(n).padStart(2, '0');

  function updateCountdown() {
    if (!cdDias || !cdHoras || !cdMin || !cdSeg) return;

    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    if (diff <= 0) {
      cdDias.textContent = '00';
      cdHoras.textContent = '00';
      cdMin.textContent = '00';
      cdSeg.textContent = '00';
      return;
    }

    cdDias.textContent = pad(Math.floor(diff / (1000 * 60 * 60 * 24)));
    cdHoras.textContent = pad(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    cdMin.textContent = pad(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    cdSeg.textContent = pad(Math.floor((diff % (1000 * 60)) / 1000));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- 5. Validación del formulario ---------- */
  const form = document.getElementById('kanForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    nombre: v => {
      if (!v.trim()) return 'El nombre es obligatorio.';
      if (v.trim().length < 2) return 'Ingresa al menos 2 caracteres.';
      return '';
    },
    email: v => {
      if (!v.trim()) return 'El correo es obligatorio.';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(v.trim()) ? '' : 'Ingresa un correo válido.';
    },
    privacidad: (_v, checked) => {
      return checked ? '' : 'Debes aceptar la política de privacidad.';
    }
  };

  function validateField(input) {
    const name = input.name;
    const errorSpan = document.querySelector(`.error-msg[data-for="${name}"]`);
    if (!errorSpan) return true;

    let error = '';
    if (name === 'privacidad') {
      error = validators.privacidad(null, input.checked);
    } else if (validators[name]) {
      error = validators[name](input.value);
    }

    if (error) {
      input.classList.add('error');
      errorSpan.textContent = error;
      return false;
    }
    input.classList.remove('error');
    errorSpan.textContent = '';
    return true;
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
      if (field.type === 'checkbox') {
        field.addEventListener('change', () => validateField(field));
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      let isValid = true;
      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      // Simulación de envío (aquí conectarías con Formspree, Mailchimp, etc.)
      setTimeout(() => {
        try {
          const datos = {
            nombre: form.nombre.value.trim(),
            email: form.email.value.trim(),
            ciudad: form.ciudad ? form.ciudad.value.trim() : '',
            nivel: form.nivel ? form.nivel.value : '',
            mensaje: form.mensaje ? form.mensaje.value.trim() : '',
            fecha: new Date().toISOString()
          };
          const registros = JSON.parse(localStorage.getItem('kan_registros') || '[]');
          registros.push(datos);
          localStorage.setItem('kan_registros', JSON.stringify(registros));
        } catch (err) { /* silencioso */ }

        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.add('show');
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 900);
    });
  }

  /* ---------- 6. Año dinámico en footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 7. Scroll suave para enlaces internos ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- 8. Pausar videos al salir del viewport ---------- */
  const videos = document.querySelectorAll('.video-wrapper video');
  if ('IntersectionObserver' in window && videos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && !entry.target.paused) {
          entry.target.pause();
        }
      });
    }, { threshold: 0.25 });

    videos.forEach(v => videoObserver.observe(v));
  }

})();