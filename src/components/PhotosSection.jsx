import { useRef, useEffect } from "react";
import '../App.css';

function PhotosSection({ photos, speed = 1 }) {
    const ref = useRef(null);
    const isInteracting = useRef(false);

    useEffect(() => {

        const el = ref.current;
        if (!el) return;

        // --- Auto-scroll logic ---
        let rafId;
        const autoScroll = () => {
            if (!isInteracting.current) {
                el.scrollLeft += speed;
                // loop back to start
                if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
                    el.scrollLeft = 0;
                }
            }
            rafId = requestAnimationFrame(autoScroll);
        };
        autoScroll();
        // --- Drag / swipe logic ---
        let isDown = false;
        let startX = 0;
        let scrollStart = 0;

        const onDown = (e) => {
            isDown = true;
            isInteracting.current = true;
            startX = e.pageX || e.touches[0].pageX;
            scrollStart = el.scrollLeft;
        };

        const onMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX || e.touches[0].pageX;
            el.scrollLeft = scrollStart - (x - startX);
        };

        const onUp = () => {
            isDown = false;
            isInteracting.current = false;
        };

        // Mouse events
        el.addEventListener("mousedown", onDown);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onUp);
        el.addEventListener("mouseup", onUp);

        // Touch events
        el.addEventListener("touchstart", (e) => onDown(e), { passive: false });
        el.addEventListener("touchmove", (e) => onMove(e), { passive: false });
        el.addEventListener("touchend", onUp);

        return () => {
            cancelAnimationFrame(rafId);

            el.removeEventListener("mousedown", onDown);
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onUp);
            el.removeEventListener("mouseup", onUp);
            el.removeEventListener("touchstart", (e) => onDown(e));
            el.removeEventListener("touchmove", (e) => onMove(e));
            el.removeEventListener("touchend", onUp);
        };
    }, [speed]);

    return (
        <div className="photos-section" ref={ref}>
            {photos.map((src, i) => (
                <img key={i} src={src} alt="" draggable={false} />
            ))}
        </div>
    );
}

export default PhotosSection;