import { useRef, useEffect, useState, useCallback } from "react";
import "./index.scss";
import GallerySwiper from "./GallerySwiper";
import { GALLERY_IMAGES } from "./galleryConfig";

export default function HomePage() {
  const pageRef = useRef(null);
  const rafRef = useRef(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [openFrom, setOpenFrom] = useState(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el || galleryOpen) return;

    const onMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        el.style.setProperty("--mouse-x", x);
        el.style.setProperty("--mouse-y", y);
        rafRef.current = null;
      });
    };

    el.style.setProperty("--mouse-x", 0.5);
    el.style.setProperty("--mouse-y", 0.5);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [galleryOpen]);

  const openGallery = useCallback((e) => {
    setOpenFrom(e ? { x: e.clientX, y: e.clientY } : null);
    setGalleryOpen(true);
  }, []);
  const closeGallery = useCallback(() => setGalleryOpen(false), []);

  return (
    <div
      ref={pageRef}
      className={`home-page ${galleryOpen ? "gallery-open" : ""}`}
      onClick={galleryOpen ? undefined : openGallery}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!galleryOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openGallery(e);
        }
      }}
      aria-label="Click to open gallery"
    >
      <div className="home-hero">
        <div className="hero-media">
          <div className="hero-overlay" />
          <div className="hero-gradient" />
          {!galleryOpen && <div className="cursor-hole" aria-hidden="true" />}
          {!galleryOpen && (
            <div className="home-hints">
              <p className="home-click-hint">Click to open gallery</p>
              <p className="home-scroll-hint">Scroll down to show more</p>
            </div>
          )}
        </div>
      </div>
      {galleryOpen && (
        <GallerySwiper
          images={GALLERY_IMAGES}
          onClose={closeGallery}
          openFrom={openFrom}
        />
      )}
    </div>
  );
}
