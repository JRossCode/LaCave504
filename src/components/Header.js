import { useEffect, useState, useRef } from "react";

function Header({ sticker, instagram, envelope, menu, openEnvelope }) {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [position, setPosition] = useState({ x: 90, y: 350 });
    const [dragging, setDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            if (!hasScrolled && window.scrollY > 0) {
                setHasScrolled(true);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasScrolled]);

    const handleDown = (e) => {
        setDragging(true);

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        offset.current = {
            x: clientX - position.x,
            y: clientY - position.y,
        };
    };

    const handleMove = (e) => {
        if (!dragging) return;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        setPosition({
            x: clientX - offset.current.x,
            y: clientY - offset.current.y,
        });
    };

    const handleUp = () => {
        setDragging(false);
    };

    return (
        <div
            className="header-section"
            onMouseMove={handleMove}
            onMouseUp={handleUp}
            onMouseLeave={handleUp}
            onTouchMove={handleMove}
            onTouchEnd={handleUp}
        >
            <div className={`header-background ${hasScrolled ? "solid" : ""}`}>
                {[...Array(41)].map((_, i) => (
                    <div
                        key={i}
                        className={i % 2 === 0 ? "stripe-purple" : "stripe-light"}
                    />
                ))}
            </div>

            <div className="header-content">
                <img
                    src={sticker}
                    alt="Logo"
                    className={`logo ${dragging ? "dragging" : ""}`}
                    style={{
                        left: position.x,
                        top: position.y,
                        position: "fixed",
                        cursor: dragging ? "grabbing" : "grab",
                    }}
                    onMouseDown={handleDown}
                    onTouchStart={handleDown}
                    draggable={false}
                />

                <nav className="navigation">
                    <div className="nav-item instagram">
                        <img src={instagram} alt="Instagram" className="nav-icon" />
                    </div>

                    <div className="nav-item">
                        <img src={envelope} alt="Email" className="nav-icon default" />
                        <img src={openEnvelope} alt="Open Email" className="nav-icon open" />
                    </div>

                    <div className="nav-item">
                        <img src={menu} alt="Menu" className="nav-icon" />
                    </div>
                </nav>

                <div className="hero-title-wrapper">
                    <h1 className="hero-title">La cave 504</h1>
                    <p className="hero-subtitle">
                        Atelier cycles engagé et inclusif
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Header;
