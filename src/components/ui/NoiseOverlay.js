import React from "react";

/**
 * NoiseOverlay — Film grain / noise texture overlay.
 * Uses an inline SVG filter for a subtle analog grain effect.
 * Rendered as a fixed full-screen layer with pointer-events: none.
 */
const NoiseOverlay = ({ opacity = 0.045 }) => {
  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none select-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* SVG noise filter definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Full-screen noise layer */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          filter: "url(#noise-filter)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
};

export default NoiseOverlay;
