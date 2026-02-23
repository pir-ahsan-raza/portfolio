document.addEventListener("DOMContentLoaded", () => {
    // Check if mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        return; // Don't run animation or preload images on mobile
    }

    const canvas = document.getElementById("hero-lightpass");
    if (!canvas) return; // safeguard

    const context = canvas.getContext("2d");
    const loader = document.getElementById("canvas-loader");
    const progressText = document.getElementById("canvas-progress-text");
    const homeSection = document.getElementById("home");

    const frameCount = 240;
    const images = [];
    let loadedImages = 0;

    // On desktop, step of 1.
    const step = 1;
    let expectedImages = Math.ceil(frameCount / step);

    // Provide correct string padding: ezgif-frame-001.jpg
    const currentFrame = index => (
        `all-imgs/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i += step) {
            const img = new Image();
            img.src = currentFrame(i);

            // Store the image at the logical index to keep mapping simple
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
                    // Draw first frame
                    renderFrame(0);
                }
            };

            // error fallback
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
        // Find first loaded image to get dimensions
        let firstImg = images.find(img => img && img.complete && img.naturalWidth);
        if (firstImg) {
            canvas.width = firstImg.naturalWidth;
            canvas.height = firstImg.naturalHeight;
        } else {
            // fallback
            canvas.width = 1920;
            canvas.height = 1080;
        }
    };

    const renderFrame = (index) => {
        // Find nearest loaded frame index if this exact one was skipped (mainly mobile)
        let frameIndex = index;
        if (!images[frameIndex]) {
            frameIndex = frameIndex - (frameIndex % step);
        }

        const img = images[frameIndex];
        if (img && img.complete && img.naturalWidth) {
            if (canvas.width === 300 && canvas.height === 150) { // default HTML canvas size
                setImageSize();
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
    };

    // Use ease-out-cubic for smooth frame updates
    let currentFrameIndex = 0;
    let targetFrameIndex = 0;

    // Animation loop
    const updateImage = () => {
        // targetFrameIndex is calculated from scroll
        const diff = targetFrameIndex - currentFrameIndex;

        // Let's use simple linear interpolation for buttery smoothness
        currentFrameIndex += diff * 0.1;

        // if difference is very small, snap to target
        if (Math.abs(diff) < 0.1) {
            currentFrameIndex = targetFrameIndex;
        }

        renderFrame(Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex))));

        // Add fade out logic when scrolling past home section
        const homeHeight = homeSection.offsetHeight;
        const scrollY = window.scrollY;

        // Fade out during the last window height of the section
        const fadeStart = homeHeight - window.innerHeight;
        if (scrollY > fadeStart && fadeStart > 0) {
            let opacity = 1 - ((scrollY - fadeStart) / window.innerHeight);
            canvas.style.opacity = Math.max(0, opacity).toFixed(2);
        } else {
            canvas.style.opacity = '1';
        }

        requestAnimationFrame(updateImage);
    };

    // Listen to scroll to update target frame
    window.addEventListener("scroll", () => {
        // Calculate scroll progress within the home section
        const maxScrollTop = homeSection.offsetHeight - window.innerHeight;

        if (maxScrollTop <= 0) return;

        let scrollFraction = window.scrollY / maxScrollTop;

        // Clamp between 0 and 1
        scrollFraction = Math.max(0, Math.min(1, scrollFraction));

        // calculate target frame
        targetFrameIndex = scrollFraction * (frameCount - 1);
    }, { passive: true });

    // Handle resizing window
    window.addEventListener("resize", () => {
        setImageSize();
        // Trigger a re-render
        renderFrame(Math.min(frameCount - 1, Math.max(0, Math.floor(currentFrameIndex))));
    });

    preloadImages();
    setImageSize();
    requestAnimationFrame(updateImage);
});
