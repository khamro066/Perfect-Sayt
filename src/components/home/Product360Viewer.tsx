"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RotateCw } from "lucide-react";
import clsx from "clsx";

const AUTO_ROTATE_MS = 1800;
const RESUME_DELAY_MS = 2500;
const DRAG_STEP_PX = 50;
const HINT_VISIBLE_MS = 3500;

interface Product360ViewerProps {
  images: [string, string, string, string];
  alt: string;
  hintLabel: string;
}

// Real frame-swap 360° viewer, not a CSS illusion: 4 angle photos are all
// mounted at once (stacked, opacity-crossfaded) so they're preloaded and
// swapping never shows a loading flicker. Auto-rotates on a timer, pauses
// on drag, and resumes a couple seconds after the user lets go.
export function Product360Viewer({ images, alt, hintLabel }: Product360ViewerProps) {
  const [frame, setFrame] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const dragOriginXRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the media query after mount (matches this project's existing
  // pattern for client-only browser APIs) and keep it live if the user
  // flips the OS setting mid-session.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    function onChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInteracting || reducedMotion) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [isInteracting, reducedMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  function startInteracting() {
    setHintVisible(false);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setIsInteracting(true);
  }

  function stopInteracting() {
    resumeTimeoutRef.current = setTimeout(() => setIsInteracting(false), RESUME_DELAY_MS);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOriginXRef.current = e.clientX;
    startInteracting();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const deltaX = e.clientX - dragOriginXRef.current;
    const steps = Math.trunc(deltaX / DRAG_STEP_PX);
    if (steps === 0) return;
    // Dragging left advances to the next angle, dragging right goes back --
    // flip the sign here if it feels backwards for the real photos.
    setFrame((f) => ((f - steps) % 4 + 4) % 4);
    dragOriginXRef.current += steps * DRAG_STEP_PX;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    stopInteracting();
  }

  return (
    <div
      className="group relative aspect-square w-full touch-none select-none bg-surface-2"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) handlePointerUp(e);
      }}
      role="img"
      aria-label={alt}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={clsx(
            "pointer-events-none object-cover transition-opacity ease-linear",
            reducedMotion ? "duration-0" : "duration-500",
            i === frame ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 transition-opacity duration-500",
          hintVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <span className="flex items-center gap-1.5 rounded-pill border border-line bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.14)] backdrop-blur-sm">
          <RotateCw size={13} />
          {hintLabel}
        </span>
      </div>
    </div>
  );
}
