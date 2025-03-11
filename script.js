document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
  });

  // Back-to-Top Button functionality
  const backToTopButton = document.getElementById('backToTop');

  window.addEventListener('scroll', function() {
    // Show the button if scrolled more than 300px
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });

  backToTopButton.addEventListener("click", function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
