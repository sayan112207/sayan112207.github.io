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
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.navbar') && navMenu && navMenu.classList.contains('show')) {
      const toggler = document.getElementById('navToggle');
      if (toggler && toggler.getAttribute('aria-expanded') === 'true') {
        toggler.click();
      }
    }
  });

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
      
      // Calculate target position using a fixed header offset 
      // instead of dynamic offsetHeight which changes during menu animation.
      const headerOffset = 120;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      
      // Scroll to the element, adding extra breathing room (40px) so headings aren't cut off
      window.scrollTo({ top: elementPosition - headerOffset - 40, behavior: 'smooth' });

      // Close mobile menu if open AFTER scroll has been initiated
      if (navMenu && navMenu.classList.contains('show') && this.closest('.nav-menu')) {
        const toggler = document.getElementById('navToggle');
        if (toggler && toggler.getAttribute('aria-expanded') === 'true') {
          // A tiny timeout prevents the collapse animation from interfering with the scroll start
          setTimeout(() => toggler.click(), 50);
        }
      }

      // Highlight target card if clicked from impact chip
      const isContextJump = this.classList.contains('exp-impact-chip') || this.classList.contains('metric-card');
      
      if (isContextJump && target.classList.contains('case-card')) {
        // Calculate exact absolute position to return to, centered on screen
        const clickedElementTop = this.getBoundingClientRect().top + window.scrollY;
        savedContextY = clickedElementTop - (window.innerHeight / 2) + (this.offsetHeight / 2);
        
        isContextActive = true;
        isJumpingToContext = true;
        hideReturnContext(); // Hide immediately if making a new jump

        target.classList.remove('highlight-target');
        void target.offsetWidth; 
        target.classList.add('highlight-target');
        
        // Fallback in case scroll events don't fire
        clearTimeout(jumpScrollTimeout);
        jumpScrollTimeout = setTimeout(() => {
          if (isJumpingToContext) {
            isJumpingToContext = false;
            lastGlobalScrollY = window.scrollY;
            showReturnContext(false);
          }
        }, 2500);
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
  let jumpScrollTimeout = null;

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
    
    if (isJumpingToContext) {
      clearTimeout(jumpScrollTimeout);
      jumpScrollTimeout = setTimeout(() => {
        isJumpingToContext = false;
        lastGlobalScrollY = window.scrollY;
        showReturnContext(false);
      }, 400); // Increased to 400ms to handle mobile scroll throttling gaps
      return;
    }
    
    if (!isContextActive) {
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

  // Project card toggles — expand in place.
  // The card keeps its grid cell so siblings never move; hiding them and
  // promoting this one to col-12 used to yank the card ~226px up the page.
  document.querySelectorAll('.project-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const body     = document.getElementById(targetId);
      if (!body) return;
      if (body.classList.contains('closing')) return;

      const isOpen = body.style.display === 'block';

      this.classList.toggle('open', !isOpen);
      this.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) { // opening
        body.style.display = 'block';
        this.childNodes[0].textContent = 'Close ';
      } else { // closing
        this.childNodes[0].textContent = 'View Project ';
        body.classList.add('closing');
        setTimeout(() => {
          body.style.display = 'none';
          body.classList.remove('closing');
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
    const prefix   = el.hasAttribute('data-prefix') ? el.getAttribute('data-prefix') : '+';
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
  const themeCheckboxes = document.querySelectorAll('.theme-checkbox');

  // Initialize theme
  function initTheme() {
    const savedTheme = localStorage.getItem('sayan-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeCheckboxes.forEach(cb => cb.checked = true);
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeCheckboxes.forEach(cb => cb.checked = false);
    }
  }
  
  themeCheckboxes.forEach(cb => {
    cb.addEventListener('change', function() {
      const isDark = this.checked;
      
      // Sync all theme checkboxes on the page
      themeCheckboxes.forEach(box => box.checked = isDark);
      
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sayan-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sayan-theme', 'light');
      }
    });
  });
  
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
