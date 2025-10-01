document.addEventListener('DOMContentLoaded', () => {
    // Vanta.js background animation
    if (document.querySelector('#vanta-bg')) {
        VANTA.FOG({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0xffeb3b,
            midtoneColor: 0xffc107,
            lowlightColor: 0xf4a261,
            baseColor: 0x222222,
            blurFactor: 0.6,
            speed: 1.2,
            zoom: 0.4
        });
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('nav ul');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});