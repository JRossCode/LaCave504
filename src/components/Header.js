import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Sticker from "./Sticker.js";
function Header({ sticker, instagram, envelope, location, openEnvelope, emailAssociation }) {
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
                <Sticker position={position} dragging={dragging} handleDown={handleDown} sticker={sticker} nav={window.innerWidth < 1280} />
                <nav className="navigation">
                    <div className="nav-item instagram">
                        <img src={instagram} alt="Instagram" className="nav-icon" onClick={() => window.open("https://www.instagram.com/lacave504/", "_blank")} />
                    </div>

                    <a className="nav-item" href={`mailto:${emailAssociation}`}>
                        <img src={envelope} alt="Email" className="nav-icon default" />
                        <img src={openEnvelope} alt="Open Email" className="nav-icon open" />
                    </a>

                    <Link to="/location" className="nav-item location">
                        <img src={location} alt="Location" className="nav-icon" />
                    </Link>
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
