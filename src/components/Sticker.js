
export default function Sticker({ position, dragging, handleDown, sticker, nav }) {
    return (
        <img
            src={sticker}
            alt="Logo"
            className={`logo ${nav ? "navigation" : (dragging ? "dragging" : "")}`}
            style={{
                left: nav ? 0 : position.x,
                top: nav ? 0 : position.y,
                position: nav ? "absolute" : "fixed",
                cursor: !nav && (dragging ? "grabbing" : "grab"),
            }}
            onClick={nav ? () => { window.location.href = "/" } : () => { }}
            onMouseDown={nav ? () => { } : handleDown}
            onTouchStart={nav ? () => { } : handleDown}
            draggable={false}
        />
    )
} 