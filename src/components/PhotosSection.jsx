import { useRef, useEffect } from "react";
import '../App.css';

function PhotosSection({ photos, speed = 1 }) {
    const ref = useRef(null);
    const isInteracting = useRef(false);

    useEffect(() => {

        const el = ref.current;
        if (!el) return;

        // The photos are rendered twice (see render). One "set" is half the
        // total scrollable width — wrapping scrollLeft around it makes the loop
        // seamless because the duplicated content is pixel-identical.
        const wrap = () => {
            const half = el.scrollWidth / 2;
            if (half <= 0) return;
            // normalise scrollLeft into [0, half) — works in both directions
            el.scrollLeft = ((el.scrollLeft % half) + half) % half;
        };

        // --- Auto-scroll logic ---
        let rafId;
        const autoScroll = () => {
            if (!isInteracting.current) {
                el.scrollLeft += speed;
                wrap();
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
            wrap();
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
            {/* rendered twice for a seamless infinite loop */}
            {[...photos, ...photos].map((src, i) => (
                <img
                    key={i}
                    src={src}
                    alt="Vélos et pièces réemployés à l'atelier La Cave 504"
                    width={430}
                    height={465}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                />
            ))}
        </div>
    );
}

export default PhotosSection;