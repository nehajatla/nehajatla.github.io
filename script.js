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

    // --- Lateral Freeform Canvas Drag Dynamics ---
    const viewport = document.getElementById('museumViewport');
    const canvas = document.getElementById('museumCanvas');

    if (viewport && canvas) {
        let isDragging = false, startX, currentTranslate = 0, prevTranslate = 0;

        viewport.addEventListener('mousedown', (e) => {
            isDragging = true;
            viewport.style.cursor = 'grabbing';
            startX = e.pageX - viewport.offsetLeft;
            prevTranslate = currentTranslate;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            viewport.style.cursor = 'grab';
        });

        viewport.addEventListener('mouseleave', () => {
            isDragging = false;
            viewport.style.cursor = 'grab';
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - viewport.offsetLeft;
            const walk = (x - startX) * 1.5; 
            currentTranslate = prevTranslate + walk;
            
            const minTranslate = -(canvas.scrollWidth - viewport.clientWidth);
            if (currentTranslate > 0) currentTranslate = 0;
            if (currentTranslate < minTranslate) currentTranslate = minTranslate;

            canvas.style.transform = `translateX(${currentTranslate}px)`;
        });
    }
});