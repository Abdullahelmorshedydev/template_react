import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";
import "./index.scss";
import GallerySwiper from "./GallerySwiper";
import { GALLERY_IMAGES } from "./galleryConfig";
import { VIDEO_SRC, VIDEO_POSTER } from "./videoConfig";
import { MESSAGE_TITLE, MESSAGE_TEXT } from "./messageConfig";

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
  const [section, setSection] = useState("birthday");
  const [videoOpen, setVideoOpen] = useState(false);
  const [openFromVideo, setOpenFromVideo] = useState(null);
  const videoSectionRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoCursorRafRef = useRef(null);
  const videoModalBackdropRef = useRef(null);
  const videoModalWrapRef = useRef(null);
  const videoModalVideoRef = useRef(null);
  const scrollToVideoCooldownRef = useRef(0);
  const videoClosingRef = useRef(false);
  const messageSectionRef = useRef(null);
  const messageWrapRef = useRef(null);
  const scrollToMessageCooldownRef = useRef(0);

  const showGallerySection = section === "gallery";
  const showVideoSection = section === "video";
  const showMessageSection = section === "message";

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
      onComplete: () => setSection("gallery"),
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
        setSection("birthday");
      },
    });
  }, []);

  const runScrollToVideoSection = useCallback(() => {
    if (Date.now() < scrollToVideoCooldownRef.current) return;
    const gallerySection = gallerySectionRef.current;
    if (!gallerySection) return;

    gsap.to(gallerySection, {
      opacity: 0,
      y: -60,
      duration: 0.55,
      ease: "power2.in",
      onComplete: () => {
        setSection("video");
      },
    });
  }, []);

  const runScrollBackToGallery = useCallback(() => {
    const wrap = videoWrapRef.current;
    if (!wrap) return;

    gsap.to(wrap, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        scrollToVideoCooldownRef.current = Date.now() + 800;
        setSection("gallery");
      },
    });
  }, []);

  const runScrollToMessageSection = useCallback(() => {
    if (Date.now() < scrollToMessageCooldownRef.current) return;
    const wrap = videoWrapRef.current;
    if (!wrap) return;

    scrollToMessageCooldownRef.current = Date.now() + 500;
    gsap.to(wrap, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        setSection("message");
      },
    });
  }, []);

  const runScrollBackToVideo = useCallback(() => {
    const wrap = messageWrapRef.current;
    if (!wrap) return;

    gsap.to(wrap, {
      opacity: 0,
      y: 40,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        scrollToMessageCooldownRef.current = Date.now() + 600;
        setSection("video");
      },
    });
  }, []);

  const openVideoModal = useCallback((e) => {
    setOpenFromVideo(e ? { x: e.clientX, y: e.clientY } : null);
    setVideoOpen(true);
  }, []);

  const closeVideoModal = useCallback(() => {
    if (videoClosingRef.current) return;
    videoClosingRef.current = true;
    const video = videoModalVideoRef.current;
    if (video) video.pause();
    const backdrop = videoModalBackdropRef.current;
    const wrap = videoModalWrapRef.current;
    if (!backdrop || !wrap) {
      setVideoOpen(false);
      videoClosingRef.current = false;
      return;
    }
    gsap.to(wrap, {
      opacity: 0,
      scale: 0.92,
      duration: 0.25,
      ease: "power2.in",
    });
    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        setVideoOpen(false);
        videoClosingRef.current = false;
      },
    });
  }, []);

  const touchStartYRef = useRef(null);

  // Only when on birthday section: scroll down → gallery (don’t run on video/message)
  useEffect(() => {
    if (section !== "birthday") return;
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
  }, [section, runScrollToGallery]);

  const scrollBackCooldownRef = useRef(0);
  useEffect(() => {
    if (!showGallerySection || galleryOpen) return;
    const TH = 25;
    const handleWheel = (e) => {
      const now = Date.now();
      if (e.deltaY < -TH) {
        if (now < scrollBackCooldownRef.current) return;
        scrollBackCooldownRef.current = now + 500;
        e.preventDefault();
        e.stopPropagation();
        runScrollBackToBirthday();
      } else if (e.deltaY > TH) {
        e.preventDefault();
        runScrollToVideoSection();
      }
    };
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener("wheel", handleWheel, { capture: true });
  }, [
    showGallerySection,
    galleryOpen,
    runScrollBackToBirthday,
    runScrollToVideoSection,
  ]);

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

  const videoTouchStartYRef = useRef(null);

  useLayoutEffect(() => {
    if (!showVideoSection || showMessageSection) return;
    const sectionEl = videoSectionRef.current;
    const target = sectionEl || document;

    const TH = 25;
    const handleWheel = (e) => {
      if (e.deltaY < -TH) {
        e.preventDefault();
        e.stopPropagation();
        if (videoOpen) closeVideoModal();
        else runScrollBackToGallery();
      } else if (e.deltaY > TH) {
        if (Date.now() < scrollToMessageCooldownRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        runScrollToMessageSection();
      }
    };
    const onVideoTouchStart = (e) => {
      if (e.touches.length) videoTouchStartYRef.current = e.touches[0].clientY;
    };
    const onVideoTouchEnd = (e) => {
      if (Date.now() < scrollToMessageCooldownRef.current) return;
      if (videoTouchStartYRef.current == null || !e.changedTouches.length)
        return;
      const dy = e.changedTouches[0].clientY - videoTouchStartYRef.current;
      videoTouchStartYRef.current = null;
      if (dy < 70) return;
      runScrollToMessageSection();
    };

    target.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    target.addEventListener("touchstart", onVideoTouchStart, { passive: true });
    target.addEventListener("touchend", onVideoTouchEnd, { passive: true });

    return () => {
      target.removeEventListener("wheel", handleWheel, { capture: true });
      target.removeEventListener("touchstart", onVideoTouchStart);
      target.removeEventListener("touchend", onVideoTouchEnd);
    };
  }, [
    showVideoSection,
    showMessageSection,
    videoOpen,
    runScrollBackToGallery,
    runScrollToMessageSection,
    closeVideoModal,
  ]);

  useEffect(() => {
    if (!showVideoSection || showMessageSection || !videoWrapRef.current)
      return;
    const wrap = videoWrapRef.current;
    gsap.fromTo(
      wrap,
      { opacity: 0, y: 70 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power2.out", delay: 0.1 },
    );
  }, [showVideoSection, showMessageSection]);

  useEffect(() => {
    if (!showMessageSection) return;
    const handleWheelBack = (e) => {
      if (e.deltaY >= -15) return;
      e.preventDefault();
      runScrollBackToVideo();
    };
    document.addEventListener("wheel", handleWheelBack, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener("wheel", handleWheelBack, { capture: true });
  }, [showMessageSection, runScrollBackToVideo]);

  useEffect(() => {
    if (!showMessageSection || !messageWrapRef.current) return;
    const wrap = messageWrapRef.current;
    gsap.fromTo(
      wrap,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", delay: 0.08 },
    );
  }, [showMessageSection]);

  useEffect(() => {
    const section = videoSectionRef.current;
    if (!section || !showVideoSection || videoOpen) return;
    section.style.setProperty("--video-cursor-x", `${window.innerWidth / 2}px`);
    section.style.setProperty(
      "--video-cursor-y",
      `${window.innerHeight / 2}px`,
    );
    const onMove = (e) => {
      if (videoCursorRafRef.current)
        cancelAnimationFrame(videoCursorRafRef.current);
      videoCursorRafRef.current = requestAnimationFrame(() => {
        section.style.setProperty("--video-cursor-x", `${e.clientX}px`);
        section.style.setProperty("--video-cursor-y", `${e.clientY}px`);
        videoCursorRafRef.current = null;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (videoCursorRafRef.current)
        cancelAnimationFrame(videoCursorRafRef.current);
    };
  }, [showVideoSection, videoOpen]);

  useEffect(() => {
    if (
      !videoOpen ||
      !videoModalBackdropRef.current ||
      !videoModalWrapRef.current
    )
      return;
    const backdrop = videoModalBackdropRef.current;
    const wrap = videoModalWrapRef.current;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const startX = openFromVideo?.x != null ? openFromVideo.x - cx : 0;
    const startY = openFromVideo?.y != null ? openFromVideo.y - cy : 40;
    const maxO = Math.min(cx, cy) * 0.8;
    const x = Math.max(-maxO, Math.min(maxO, startX));
    const y = Math.max(-maxO, Math.min(maxO, startY));

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(wrap, { opacity: 0.6, scale: 0.3, x, y });

    const tl = gsap.timeline();
    tl.to(backdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
    tl.to(
      wrap,
      { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.2",
    );
  }, [videoOpen, openFromVideo]);

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeVideoModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoOpen, closeVideoModal]);

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
      {section === "birthday" && (
        <section ref={birthdayRef} className="home-birthday-section">
          <h1 className="home-birthday-text">Happy Birthday Faroha</h1>
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
              <p className="home-scroll-hint">Scroll down to show more</p>
            </div>
          </div>
        </div>
      )}
      {/* Section 3: Video – poster + play button; click opens video modal */}
      {section === "video" && (
        <section
          ref={videoSectionRef}
          className={`home-video-section ${videoOpen ? "video-modal-open" : ""}`}
        >
          <div
            ref={videoWrapRef}
            className="home-video-poster-wrap"
            onClick={openVideoModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openVideoModal(e);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Play video"
          >
            <div
              className="home-video-poster"
              style={{ backgroundImage: `url(${VIDEO_POSTER})` }}
            />
          </div>
          {!videoOpen && (
            <div
              className="home-video-play-cursor"
              aria-hidden="true"
              style={{
                left: "var(--video-cursor-x, 50%)",
                top: "var(--video-cursor-y, 50%)",
              }}
            >
              <span className="home-video-play-icon" />
            </div>
          )}
          <p className="home-video-scroll-hint">
            Scroll down for message · Scroll up to go back
          </p>
        </section>
      )}

      {/* Section 4: Message – quote box with title "Message for you" */}
      {section === "message" && (
        <section ref={messageSectionRef} className="home-message-section">
          <div ref={messageWrapRef} className="home-message-card">
            <div className="home-message-card__head">
              <span className="home-message-card__label">{MESSAGE_TITLE}</span>
            </div>
            <blockquote className="home-message-card__quote">
              <span
                className="home-message-card__quote-mark"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="home-message-card__body">{MESSAGE_TEXT}</p>
              <span
                className="home-message-card__quote-mark-end"
                aria-hidden="true"
              >
                &rdquo;
              </span>
            </blockquote>
          </div>
          <p className="home-message-scroll-hint">Scroll up to go back</p>
        </section>
      )}

      {/* Video modal – like gallery swiper, one video */}
      {videoOpen && (
        <div
          ref={videoModalBackdropRef}
          className="home-video-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeVideoModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Video"
        >
          <div
            ref={videoModalWrapRef}
            className="home-video-modal-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoModalVideoRef}
              className="home-video-modal-video"
              src={VIDEO_SRC}
              controls
              playsInline
              autoPlay
              aria-label="Video"
            />
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
