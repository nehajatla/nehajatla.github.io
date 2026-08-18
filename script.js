document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Intersection Reveal Engine ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -60px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
});