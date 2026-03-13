import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import "./index.scss";
import GallerySwiper from "./GallerySwiper";
import { GALLERY_IMAGES } from "./galleryConfig";

export default function HomePage() {
  const pageRef = useRef(null);
  const rafRef = useRef(null);
  const birthdayRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const justReturnedToBirthdayRef = useRef(false);
  const scrollToGalleryCooldownRef = useRef(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [openFrom, setOpenFrom] = useState(null);
  const [showGallerySection, setShowGallerySection] = useState(false);

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

  const runScrollToGallery = useCallback(() => {
    if (hasScrolledRef.current) return;
    if (Date.now() < scrollToGalleryCooldownRef.current) return;
    hasScrolledRef.current = true;
    const birthday = birthdayRef.current;
    if (!birthday) return;

    gsap.to(birthday, {
      opacity: 0,
      y: -80,
      duration: 0.65,
      ease: "power2.in",
      onComplete: () => setShowGallerySection(true),
    });
  }, []);

  const runScrollBackToBirthday = useCallback(() => {
    const gallerySection = gallerySectionRef.current;
    if (!gallerySection) return;

    gsap.to(gallerySection, {
      opacity: 0,
      y: 40,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        hasScrolledRef.current = false;
        justReturnedToBirthdayRef.current = true;
        scrollToGalleryCooldownRef.current = Date.now() + 1500;
        setShowGallerySection(false);
      },
    });
  }, []);

  const touchStartYRef = useRef(null);

  useEffect(() => {
    if (showGallerySection) return;
    const TH = 35;
    const handleWheel = (e) => {
      if (hasScrolledRef.current) return;
      if (Date.now() < scrollToGalleryCooldownRef.current) return;
      if (e.deltaY <= TH) return;
      e.preventDefault();
      runScrollToGallery();
    };
    const onTouchStart = (e) => {
      if (e.touches.length) touchStartYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (hasScrolledRef.current) return;
      if (Date.now() < scrollToGalleryCooldownRef.current) return;
      if (touchStartYRef.current == null || !e.changedTouches.length) return;
      const dy = e.changedTouches[0].clientY - touchStartYRef.current;
      touchStartYRef.current = null;
      if (dy < 80) return;
      runScrollToGallery();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [showGallerySection, runScrollToGallery]);

  const scrollBackCooldownRef = useRef(0);
  useEffect(() => {
    if (!showGallerySection || galleryOpen) return;
    const handleWheelBack = (e) => {
      if (e.deltaY >= -10) return;
      const now = Date.now();
      if (now < scrollBackCooldownRef.current) return;
      scrollBackCooldownRef.current = now + 500;
      e.preventDefault();
      e.stopPropagation();
      runScrollBackToBirthday();
    };
    document.addEventListener("wheel", handleWheelBack, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener("wheel", handleWheelBack, { capture: true });
  }, [showGallerySection, galleryOpen, runScrollBackToBirthday]);

  useEffect(() => {
    if (!showGallerySection || !gallerySectionRef.current) return;
    const el = gallerySectionRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
    );
  }, [showGallerySection]);

  useEffect(() => {
    if (showGallerySection || !justReturnedToBirthdayRef.current) return;
    const birthday = birthdayRef.current;
    if (!birthday) return;
    gsap.fromTo(
      birthday,
      { opacity: 0, y: -80 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    );
    justReturnedToBirthdayRef.current = false;
  }, [showGallerySection]);

  return (
    <div
      ref={pageRef}
      className={`home-page ${galleryOpen ? "gallery-open" : ""}`}
      onClick={
        galleryOpen ? undefined : showGallerySection ? openGallery : undefined
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (
          !galleryOpen &&
          showGallerySection &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          openGallery(e);
        }
      }}
      aria-label={
        showGallerySection ? "Click to open gallery" : "Scroll to continue"
      }
    >
      {/* Section 1: Happy Birthday – scroll to reveal gallery */}
      {!showGallerySection && (
        <section ref={birthdayRef} className="home-birthday-section">
          <h1 className="home-birthday-text">Morshedy Only One</h1>
          <p className="home-birthday-hint">Scroll to continue</p>
        </section>
      )}

      {/* Section 2: Gallery (wall + click to open) – visible after scroll */}
      {showGallerySection && (
        <div ref={gallerySectionRef} className="home-hero">
          <div className="hero-media">
            <div className="hero-overlay" />
            <div className="hero-gradient" />
            {!galleryOpen && <div className="cursor-hole" aria-hidden="true" />}
            <div className="home-hints">
              <p className="home-click-hint">Click to open gallery</p>
              <p className="home-scroll-hint">
                Swipe left or right to show more
              </p>
            </div>
          </div>
        </div>
      )}
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
