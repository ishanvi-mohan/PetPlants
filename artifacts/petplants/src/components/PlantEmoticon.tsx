import React from "react";
import type { EmoticonStyle, PlantState } from "@workspace/api-client-react/src/generated/api.schemas";

interface PlantEmoticonProps {
  style: EmoticonStyle;
  state: PlantState;
  size?: number;
}

export default function PlantEmoticon({ style, state, size = 64 }: PlantEmoticonProps) {
  // SVG paths for pixel art plants
  const renderPlant = () => {
    switch (style) {
      case "leafy":
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }} className={`plant-${state}`}>
            {/* Pot */}
            <path d="M10,22 h12 v2 h-2 v2 h-8 v-2 h-2 z" fill="#8c5a3c" />
            <path d="M9,20 h14 v2 h-14 z" fill="#a06a4b" />
            {/* Stem */}
            <path d="M15,16 h2 v4 h-2 z" fill="#4d994d" />
            {/* Leaves */}
            <path d="M13,10 h6 v6 h-6 z" fill="#5ebd5e" />
            <path d="M10,12 h3 v3 h-3 z" fill="#5ebd5e" />
            <path d="M19,11 h3 v3 h-3 z" fill="#5ebd5e" />
            {renderFace(state)}
          </svg>
        );
      case "succulent":
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }} className={`plant-${state}`}>
            {/* Pot */}
            <path d="M11,22 h10 v3 h-10 z" fill="#999" />
            <path d="M10,20 h12 v2 h-12 z" fill="#ccc" />
            {/* Body */}
            <path d="M11,12 h10 v8 h-10 z" fill="#4c8a6f" />
            <path d="M12,10 h8 v2 h-8 z" fill="#4c8a6f" />
            {/* Spikes */}
            <rect x="10" y="14" width="1" height="1" fill="#88c2a5" />
            <rect x="21" y="16" width="1" height="1" fill="#88c2a5" />
            <rect x="15" y="9" width="1" height="1" fill="#88c2a5" />
            {renderFace(state)}
          </svg>
        );
      case "flower":
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }} className={`plant-${state}`}>
            {/* Pot */}
            <path d="M12,24 h8 v2 h-8 z" fill="#b08050" />
            <path d="M11,22 h10 v2 h-10 z" fill="#c49a6c" />
            {/* Stem */}
            <path d="M15,16 h2 v6 h-2 z" fill="#4d994d" />
            {/* Leaves */}
            <path d="M13,18 h2 v1 h-2 z" fill="#4d994d" />
            <path d="M17,17 h2 v1 h-2 z" fill="#4d994d" />
            {/* Petals */}
            <path d="M14,10 h4 v4 h-4 z" fill="#ffeb3b" />
            <path d="M15,8 h2 v2 h-2 z M12,11 h2 v2 h-2 z M18,11 h2 v2 h-2 z M15,14 h2 v2 h-2 z" fill="#ff6b9d" />
            {renderFace(state)}
          </svg>
        );
      case "herb":
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }} className={`plant-${state}`}>
            {/* Pot */}
            <path d="M10,22 h12 v4 h-12 z" fill="#6d5440" />
            <path d="M9,20 h14 v2 h-14 z" fill="#836752" />
            {/* Stems */}
            <path d="M13,12 h2 v8 h-2 z" fill="#71b563" />
            <path d="M17,10 h2 v10 h-2 z" fill="#71b563" />
            <path d="M11,14 h2 v1 h-2 z M15,15 h2 v1 h-2 z M19,13 h2 v1 h-2 z" fill="#71b563" />
            {renderFace(state)}
          </svg>
        );
      default:
        return null;
    }
  };

  const renderFace = (state: PlantState) => {
    switch (state) {
      case "happy":
        return (
          <g>
            <rect x="13" y="14" width="2" height="2" fill="#000" />
            <rect x="17" y="14" width="2" height="2" fill="#000" />
            <rect x="15" y="17" width="2" height="1" fill="#000" />
          </g>
        );
      case "thirsty":
        return (
          <g>
            <rect x="13" y="15" width="2" height="1" fill="#000" />
            <rect x="17" y="15" width="2" height="1" fill="#000" />
            <rect x="15" y="17" width="2" height="2" fill="#000" />
          </g>
        );
      case "resting":
        return (
          <g>
            <rect x="13" y="15" width="2" height="1" fill="#000" />
            <rect x="17" y="15" width="2" height="1" fill="#000" />
          </g>
        );
      case "postponed":
        return (
          <g>
            <rect x="13" y="14" width="2" height="1" fill="#000" />
            <rect x="14" y="15" width="1" height="1" fill="#000" />
            <rect x="17" y="14" width="2" height="1" fill="#000" />
            <rect x="18" y="15" width="1" height="1" fill="#000" />
            <rect x="15" y="17" width="2" height="1" fill="#000" />
          </g>
        );
    }
  };

  const wrapperClass = () => {
    switch (state) {
      case "happy": return "animate-sway";
      case "thirsty": return "animate-droop";
      default: return "";
    }
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div className={wrapperClass()}>
        {renderPlant()}
      </div>
      
      {/* State effects */}
      {state === "thirsty" && (
        <div className="absolute top-0 right-0 animate-tear text-[#6bcbff]">
          <svg viewBox="0 0 10 10" width="16" height="16" style={{ imageRendering: "pixelated" }}>
            <path d="M4 2 h2 v2 h2 v4 h-1 v1 h-4 v-1 h-1 v-4 h2 z" fill="#6bcbff" />
          </svg>
        </div>
      )}
      
      {state === "resting" && (
        <div className="absolute bottom-6 right-0 font-sans font-bold text-white text-xs z-10">
          <div className="animate-zzz-1 absolute bottom-0 right-0">z</div>
          <div className="animate-zzz-2 absolute -bottom-1 right-3 text-sm">Z</div>
        </div>
      )}
      
      {state === "postponed" && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 flex flex-col items-center">
          <div className="w-6 h-4 bg-gray-600 rounded-full blur-[1px]"></div>
          <div className="flex gap-1 mt-1">
            <div className="w-[2px] h-2 bg-blue-400 animate-rain"></div>
            <div className="w-[2px] h-2 bg-blue-400 animate-rain" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-[2px] h-2 bg-blue-400 animate-rain" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}