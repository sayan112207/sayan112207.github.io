/* ═══════════════════════════════════════════════════════
   APM PORTFOLIO — script.js
   Features:
     - Progress bar
     - Back to top
     - Smooth scroll
     - Accordion toggles (case studies, projects, experiments)
     - Animated metric counters (Intersection Observer)
     - Scroll reveal for sections
   ═══════════════════════════════════════════════════════ */

// ── Year ──────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function () {

  // ── Mobile nav toggle ───────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');
    });
  }

  // ── Back-to-Top ─────────────────────────────────────────
  const backToTopButton = document.getElementById('backToTop');

  function onScroll() {
    const scrolled = document.documentElement.scrollTop || document.body.scrollTop;

    // Back-to-top visibility
    if (scrolled > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }

    // Progress bar
    const total  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct    = total > 0 ? (scrolled / total) * 100 : 0;
    document.getElementById('myBar').style.width = pct + '%';
  }

  window.addEventListener('scroll', onScroll);

  if (backToTopButton) {
    backToTopButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Smooth scroll for nav links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerOffset   = document.querySelector('header')?.offsetHeight ?? 80;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerOffset - 12, behavior: 'smooth' });

      // Highlight target card if clicked from impact chip
      const isContextJump = this.classList.contains('exp-impact-chip') || this.classList.contains('metric-card');
      
      if (isContextJump && target.classList.contains('case-card')) {
        savedContextY = window.scrollY;
        isContextActive = true;
        isJumpingToContext = true;
        hideReturnContext(); // Hide immediately if making a new jump

        target.classList.remove('highlight-target');
        void target.offsetWidth; 
        target.classList.add('highlight-target');
        
        // Wait for smooth scroll to finish before showing button
        setTimeout(() => {
          isJumpingToContext = false;
          lastGlobalScrollY = window.scrollY;
          showReturnContext(false); // Enable 5s timeout initially
        }, 850);
      }
    });
  });

  // ── Return Context State Machine ──
  const returnWrapper = document.getElementById('returnContextWrapper');
  const returnMain = document.getElementById('returnBtnMain');
  const returnClose = document.getElementById('returnBtnClose');
  
  let savedContextY = null;
  let returnBtnTimeout = null;
  let lastGlobalScrollY = window.scrollY;
  let isContextActive = false;
  let isJumpingToContext = false;

  function hideReturnContext() {
    if (!returnWrapper) return;
    returnWrapper.classList.remove('show');
    returnWrapper.classList.add('hide-anim');
  }

  function showReturnContext(keepAlive = false) {
    if (!returnWrapper || !isContextActive) return;
    returnWrapper.classList.remove('hide-anim');
    returnWrapper.classList.add('show');
    
    if (returnBtnTimeout) clearTimeout(returnBtnTimeout);
    
    if (!keepAlive) {
      returnBtnTimeout = setTimeout(() => {
        isContextActive = false;
        hideReturnContext();
      }, 5000);
    }
  }

  if (returnMain && returnClose) {
    returnMain.addEventListener('click', () => {
       isContextActive = false;
       hideReturnContext();
       window.scrollTo({ top: savedContextY, behavior: 'smooth' });
    });
    returnClose.addEventListener('click', () => {
       isContextActive = false;
       hideReturnContext();
    });
  }

  // Scroll visibility rules
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (!isContextActive || isJumpingToContext) {
      lastGlobalScrollY = currentScrollY;
      return;
    }
    
    // Auto-hide but keep session active on subtle scroll up? 
    // No, user wants it dead if it fades or moves.
    if (currentScrollY > lastGlobalScrollY + 10) {
      // Significant Scroll Down -> Hide and Kill
      isContextActive = false;
      hideReturnContext();
    }
    lastGlobalScrollY = currentScrollY;
  }, { passive: true });

  // ── Generic toggle factory ───────────────────────────────
  function setupToggle(btnSelector, btnClass, openClass) {
    document.querySelectorAll(btnSelector).forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const body     = document.getElementById(targetId);
        if (!body) return;

        const isOpen = body.style.display === 'block';

        if (isOpen) {
          body.style.display = 'none';
          this.classList.remove(openClass);
          this.setAttribute('aria-expanded', 'false');
          // Update button text
          this.innerHTML = this.innerHTML.replace('Close', openClass === 'open' ? 'Case Study' : 'Case Study');
        } else {
          body.style.display = 'block';
          this.classList.add(openClass);
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Case study toggles
  document.querySelectorAll('.case-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const body     = document.getElementById(targetId);
      if (!body) return;
      // Prevent rapid clicks from messing up animation state
      if (body.classList.contains('closing')) return;

      const isOpen = body.style.display === 'block';
      this.classList.toggle('open', !isOpen);
      this.setAttribute('aria-expanded', String(!isOpen));
      
      const icon = this.querySelector('.fa');
      if (!isOpen) { // opening
        body.style.display = 'block';
        this.childNodes[0].textContent = 'Close ';
      } else { // closing
        this.childNodes[0].textContent = 'Read Case Study ';
        body.classList.add('closing');
        setTimeout(() => {
          body.style.display = 'none';
          body.classList.remove('closing');
        }, 340);
      }
    });
  });

  // Project card toggles (rectangular expansion)
  document.querySelectorAll('.project-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const body     = document.getElementById(targetId);
      if (!body) return;
      if (body.classList.contains('closing')) return;

      const isOpen = body.style.display === 'block';
      const colContainer = this.closest('[class*="col-"]');
      const originalColClass = Array.from(colContainer.classList).find(c => c.startsWith('col-md-')) || 'col-md-6';
      const siblings = Array.from(colContainer.parentElement.children);

      this.classList.toggle('open', !isOpen);
      
      if (!isOpen) { // opening
        body.style.display = 'block';
        this.childNodes[0].textContent = 'Close ';
        // Hide siblings and expand this one
        siblings.forEach(col => {
          if (col !== colContainer) col.style.display = 'none';
        });
        colContainer.setAttribute('data-original-class', originalColClass);
        colContainer.classList.remove(originalColClass);
        colContainer.classList.add('col-12');
      } else { // closing
        this.childNodes[0].textContent = 'View Project ';
        body.classList.add('closing');
        setTimeout(() => {
          body.style.display = 'none';
          body.classList.remove('closing');
          // Show siblings and restore width
          siblings.forEach(col => {
            col.style.display = '';
          });
          colContainer.classList.remove('col-12');
          colContainer.classList.add(colContainer.getAttribute('data-original-class') || originalColClass);
        }, 340);
      }
    });
  });

  // Nested project toggles (no text swap, only icon rotation)
  document.querySelectorAll('.nested-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const body     = document.getElementById(targetId);
      if (!body) return;
      if (body.classList.contains('closing')) return;

      const isOpen = body.style.display === 'block';
      this.classList.toggle('open', !isOpen);
      this.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        body.style.display = 'block';
      } else {
        body.classList.add('closing');
        setTimeout(() => {
          body.style.display = 'none';
          body.classList.remove('closing');
        }, 340);
      }
    });
  });

  // Experimentation toggles
  document.querySelectorAll('.exp-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const body     = document.getElementById(targetId);
      if (!body) return;
      if (body.classList.contains('closing')) return;

      const isOpen = body.style.display === 'block';
      const colContainer = this.closest('.col-md-4') || this.closest('.col-12');
      const siblings = Array.from(colContainer.parentElement.children);

      if (!isOpen) { // opening
        body.style.display = 'block';
        this.childNodes[0].textContent = 'Close ';
        // Hide siblings and expand this one
        siblings.forEach(col => {
          if (col !== colContainer) col.style.display = 'none';
        });
        colContainer.classList.remove('col-md-4');
        colContainer.classList.add('col-12');
      } else { // closing
        this.childNodes[0].textContent = 'View Logic ';
        body.classList.add('closing');
        setTimeout(() => {
          body.style.display = 'none';
          body.classList.remove('closing');
          // Show siblings and restore width
          siblings.forEach(col => {
            col.style.display = '';
          });
          colContainer.classList.remove('col-12');
          colContainer.classList.add('col-md-4');
        }, 340);
      }
    });
  });

  // ── Animated counters ────────────────────────────────────
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const prefix   = el.getAttribute('data-prefix') || '+';
    const duration = 1600; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        metricObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.metric-value[data-target]').forEach(el => {
    metricObserver.observe(el);
  });

  // ── Scroll reveal ────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ── Theme Toggle (Dark Mode) ──
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize theme
  function initTheme() {
    const savedTheme = localStorage.getItem('sayan-theme');
    if (savedTheme === 'dark' || (!document.documentElement.hasAttribute('data-theme') && prefersDark && !savedTheme)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.innerHTML = '<i class="fa fa-sun-o"></i>';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.innerHTML = '<i class="fa fa-moon-o"></i>';
    }
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sayan-theme', 'light');
        themeToggle.innerHTML = '<i class="fa fa-moon-o"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sayan-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa fa-sun-o"></i>';
      }
    });
  }
  
  initTheme(); // Run on load

  // ── Copy to Clipboard Tooltip ──
  document.querySelectorAll('.copy-trigger').forEach(trigger => {
    trigger.addEventListener('click', async function(e) {
      e.preventDefault();
      const textToCopy = this.getAttribute('data-copy');
      if (!textToCopy) return;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        this.classList.add('copied');
        
        setTimeout(() => {
          this.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  });

});
