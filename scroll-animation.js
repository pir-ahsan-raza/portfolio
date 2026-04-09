document.addEventListener("DOMContentLoaded", () => {
    const homeSection = document.getElementById("home");
    const homeStickyWrapper = document.querySelector(".home-sticky-wrapper");
    if (!homeSection || !homeStickyWrapper) return;

    const isMobile = window.innerWidth < 768;

    // Track if glitch sequence has started
    let hasGlitched = false;

    // ─── Glitch on first scroll (works on ALL viewports) ───
    window.addEventListener("scroll", () => {
        if (window.scrollY > 10 && !hasGlitched) {
            hasGlitched = true;

            // Start glitch animation on home content
            homeStickyWrapper.classList.add('glitching');

            // After 800ms (glitch duration)
            setTimeout(() => {
                if (window.innerWidth >= 768) {
                    // Desktop: hide content permanently and show 3D canvas
                    homeStickyWrapper.classList.add('home-hidden-permanently');

                    // Near-instant reveal of the 3D canvas
                    setTimeout(() => {
                        const c = document.getElementById("hero-lightpass");
                        if (c) c.classList.add('visible');
                    }, 50);
                } else {
                    // Mobile: just remove the glitch class so content stays visible
                    homeStickyWrapper.classList.remove('glitching');
                }
            }, 800);
        }

        // Desktop-only: scroll-driven frame animation
        if (hasGlitched && typeof targetFrameIndex !== 'undefined') {
            const maxScrollTop = homeSection.offsetHeight - window.innerHeight;
            if (maxScrollTop <= 0) return;

            const scrollDelayBuffer = 250;
            let activeScrollDistance = window.scrollY - scrollDelayBuffer;
            let scrollFraction = Math.max(0, activeScrollDistance) / (maxScrollTop - scrollDelayBuffer);
            scrollFraction = Math.max(0, Math.min(1, scrollFraction));

            const animationEnd = 0.80;
            const fadeStart = 0.85;
            const maxSafeFrame = 150;
            const canvas = document.getElementById("hero-lightpass");

            if (scrollFraction <= animationEnd) {
                targetFrameIndex = (scrollFraction / animationEnd) * maxSafeFrame;
                if (canvas) canvas.style.opacity = 1;
            } else {
                targetFrameIndex = maxSafeFrame;
                if (scrollFraction > fadeStart) {
                    const fadeOutRange = (scrollFraction - fadeStart) / (1 - fadeStart);
                    if (canvas) canvas.style.opacity = Math.max(0, 1 - fadeOutRange);
                } else {
                    if (canvas) canvas.style.opacity = 1;
                }
            }
        }
    }, { passive: true });

    // ─── Mobile: skip canvas entirely, just hide loader ───
    if (isMobile) {
        const loader = document.getElementById("canvas-loader");
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
        return; // no canvas, no frame downloads
    }

    // ─────────────────────────────────────────────────────
    // Everything below is DESKTOP ONLY (canvas + frames)
    // ─────────────────────────────────────────────────────
    const canvas = document.getElementById("hero-lightpass");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    const loader = document.getElementById("canvas-loader");
    const progressText = document.getElementById("canvas-progress-text");

    const frameCount = 192;
    const images = [];
    let loadedImages = 0;

    const step = 1;
    let expectedImages = Math.ceil(frameCount / step);

    const currentFrame = index => (
        `all-stuff/all-imgs/1 (${index + 1}).jpg`
    );

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i += step) {
            const img = new Image();
            img.src = currentFrame(i);
            images[i] = img;

            img.onload = () => {
                loadedImages++;
                progressText.innerText = `Loading ${Math.round((loadedImages / expectedImages) * 100)}%`;

                if (loadedImages === 1) {
                    setImageSize();
                }

                if (loadedImages === expectedImages) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 300);
                    renderFrame(0);
                }
            };

            img.onerror = () => {
                loadedImages++;
                if (loadedImages === expectedImages) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 300);
                }
            };
        }
    };

    const setImageSize = () => {
        let firstImg = images.find(img => img && img.complete && img.naturalWidth);
        if (firstImg) {
            canvas.width = firstImg.naturalWidth;
            canvas.height = firstImg.naturalHeight;
        } else {
            canvas.width = 1920;
            canvas.height = 1080;
        }
    };

    const renderFrame = (index) => {
        let frameIndex = index;
        if (!images[frameIndex]) {
            frameIndex = frameIndex - (frameIndex % step);
        }

        const img = images[frameIndex];
        if (img && img.complete && img.naturalWidth) {
            if (canvas.width === 300 && canvas.height === 150) {
                setImageSize();
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    };

    // Smooth frame interpolation
    let currentFrameIndex = 0;
    var targetFrameIndex = 0;

    const updateImage = () => {
        if (hasGlitched && homeStickyWrapper.classList.contains('home-hidden-permanently')) {
            const diff = targetFrameIndex - currentFrameIndex;
            currentFrameIndex += diff * 0.1;

            if (Math.abs(diff) < 0.1) {
                currentFrameIndex = targetFrameIndex;
            }

            renderFrame(Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex))));
        }

        requestAnimationFrame(updateImage);
    };

    // Handle resizing window
    window.addEventListener("resize", () => {
        const isMobileNow = window.innerWidth < 768;
        if (!isMobileNow) {
            setImageSize();
            renderFrame(Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex))));
        } else {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);

            homeStickyWrapper.classList.remove('home-hidden-permanently');
            homeStickyWrapper.classList.remove('glitching');
            canvas.classList.remove('visible');
            hasGlitched = false;
        }
    });

    // Desktop: defer frame downloads until boot completes
    if (window.bootReady) {
        window.bootReady.then(() => preloadImages());
    } else {
        preloadImages();
    }
    setImageSize();
    requestAnimationFrame(updateImage);
});
