import { useCallback, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./GallerySwiper.scss";

const OPEN = {
  backdrop: { duration: 0.4, ease: "power2.out", stagger: 0 },
  frame: {
    duration: 0.85,
    ease: "power2.out",
    scaleStart: 0.28,
    yStart: 60,
    opacityStart: 0.6,
    stagger: 0.05,
    overshootScale: 1.02,
    overshootDuration: 0.2,
  },
  firstImageDelay: 0.5,
};
const CLOSE = {
  frame: { duration: 0.28, ease: "power2.in", scaleEnd: 0.94 },
  backdrop: { duration: 0.22 },
  overlap: 0.12,
};

// Image switch inside tabloh: scroll/swipe X closes at ends or switches image (GSAP)
const SWITCH = {
  duration: 0.48,
  easeOut: "power2.in",
  easeIn: "power2.out",
  xOffset: 72,
};
const SWIPE_THRESHOLD = 48;
const WHEEL_COOLDOWN_MS = 420;
const WHEEL_THRESHOLD = 28;

export default function GallerySwiper({ images, onClose, openFrom }) {
  const backdropRef = useRef(null);
  const wrapRef = useRef(null);
  const viewRef = useRef(null);
  const isClosingRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(null);
  const dragRef = useRef({ startX: 0, startY: 0, active: false });
  const justSwipeNavigatedRef = useRef(false);
  const wheelCooldownRef = useRef(0);

  const animateFirstImage = useCallback(() => {
    const view = viewRef.current;
    if (!view || !view.children.length) return;
    const firstSlide = view.children[0];
    const img = firstSlide?.querySelector("img");
    if (!img) return;
    gsap.set(img, { opacity: 0, x: 24 });
    gsap.to(img, {
      opacity: 1,
      x: 0,
      duration: SWITCH.duration,
      ease: SWITCH.easeIn,
    });
  }, []);

  const runOpenAnimation = useCallback(() => {
    const backdrop = backdropRef.current;
    const wrap = wrapRef.current;
    const view = viewRef.current;
    if (!backdrop || !wrap) return;

    const { frame } = OPEN;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const maxOffset = Math.min(centerX, centerY) * 0.85;
    const rawX = openFrom?.x != null ? openFrom.x - centerX : 0;
    const rawY = openFrom?.y != null ? openFrom.y - centerY : frame.yStart;
    const startX = Math.max(-maxOffset, Math.min(maxOffset, rawX));
    const startY = Math.max(-maxOffset, Math.min(maxOffset, rawY));

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(wrap, {
      opacity: 1,
      scale: frame.scaleStart,
      x: startX,
      y: startY,
    });
    const firstImg = view?.children[0]?.querySelector("img");
    if (firstImg) gsap.set(firstImg, { opacity: 0, x: 24 });

    const tl = gsap.timeline({
      overwrite: true,
      onComplete: () => {
        gsap.set(wrap, { opacity: 1, scale: 1, x: 0, y: 0 });
        animateFirstImage();
      },
    });
    tl.to(
      backdrop,
      {
        opacity: 1,
        duration: OPEN.backdrop.duration,
        ease: OPEN.backdrop.ease,
      },
      OPEN.backdrop.stagger,
    );
    tl.to(
      wrap,
      {
        scale: 1,
        x: 0,
        y: 0,
        duration: frame.duration,
        ease: frame.ease,
      },
      OPEN.frame.stagger,
    );
    if (frame.overshootScale > 1) {
      tl.to(wrap, {
        scale: frame.overshootScale,
        duration: frame.overshootDuration * 0.5,
        ease: "power2.inOut",
      });
      tl.to(wrap, {
        scale: 1,
        duration: frame.overshootDuration,
        ease: "power2.out",
      });
    }
    return tl;
  }, [openFrom, animateFirstImage]);

  useEffect(() => {
    const backdrop = backdropRef.current;
    const wrap = wrapRef.current;
    const view = viewRef.current;
    if (!backdrop || !wrap) return;

    const { frame } = OPEN;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const maxOffset = Math.min(centerX, centerY) * 0.85;
    const rawX = openFrom?.x != null ? openFrom.x - centerX : 0;
    const rawY = openFrom?.y != null ? openFrom.y - centerY : frame.yStart;
    const startX = Math.max(-maxOffset, Math.min(maxOffset, rawX));
    const startY = Math.max(-maxOffset, Math.min(maxOffset, rawY));

    const setInitialState = () => {
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(wrap, {
        opacity: 1,
        scale: frame.scaleStart,
        x: startX,
        y: startY,
      });
      const firstImg = view?.children[0]?.querySelector("img");
      if (firstImg) gsap.set(firstImg, { opacity: 0, x: 24 });
    };

    let timeoutId = null;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setInitialState();
        timeoutId = setTimeout(runOpenAnimation, 60);
      });
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [runOpenAnimation, openFrom]);

  const goTo = useCallback(
    (direction) => {
      if (isTransitioningRef.current || !viewRef.current) return;
      const len = images.length;
      const next = currentIndex + direction;
      if (next < 0 || next >= len) return;

      isTransitioningRef.current = true;
      setTransitioning({ from: currentIndex, to: next });

      const slides = viewRef.current.children;
      const fromSlide = slides[currentIndex];
      const toSlide = slides[next];
      const fromImg = fromSlide?.querySelector("img");
      const toImg = toSlide?.querySelector("img");
      if (!fromImg || !toImg) {
        setCurrentIndex(next);
        setTransitioning(null);
        isTransitioningRef.current = false;
        return;
      }

      const xOut = direction > 0 ? -SWITCH.xOffset : SWITCH.xOffset;
      const xInStart = direction > 0 ? SWITCH.xOffset : -SWITCH.xOffset;

      gsap.set(toImg, { x: xInStart, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(next);
          setTransitioning(null);
          isTransitioningRef.current = false;
          gsap.set(fromImg, { x: 0, opacity: 1 });
          gsap.set(toImg, { x: 0, opacity: 1 });
        },
      });
      tl.to(
        fromImg,
        {
          x: xOut,
          opacity: 0,
          duration: SWITCH.duration,
          ease: SWITCH.easeOut,
        },
        0,
      );
      tl.to(
        toImg,
        {
          x: 0,
          opacity: 1,
          duration: SWITCH.duration,
          ease: SWITCH.easeIn,
        },
        0,
      );
    },
    [currentIndex, images.length],
  );

  const closeAnimation = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const backdrop = backdropRef.current;
    const wrap = wrapRef.current;
    if (!backdrop || !wrap) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => onClose(),
    });
    tl.to(
      wrap,
      {
        opacity: 0,
        scale: CLOSE.frame.scaleEnd,
        duration: CLOSE.frame.duration,
        ease: CLOSE.frame.ease,
      },
      0,
    );
    tl.to(
      backdrop,
      { opacity: 0, duration: CLOSE.backdrop.duration },
      `-=${CLOSE.overlap}`,
    );
  }, [onClose]);

  // At first image and go prev, or at last image and go next → close gallery
  const tryNavigate = useCallback(
    (direction) => {
      if (isClosingRef.current) return;
      const len = images.length;
      if (direction === -1 && currentIndex <= 0) {
        closeAnimation();
        return;
      }
      if (direction === 1 && currentIndex >= len - 1) {
        closeAnimation();
        return;
      }
      goTo(direction);
    },
    [currentIndex, images.length, goTo, closeAnimation],
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now < wheelCooldownRef.current) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      let dir = 0;
      if (absX >= absY && absX >= WHEEL_THRESHOLD) {
        dir = e.deltaX > 0 ? -1 : 1;
      } else if (absY > absX && absY >= WHEEL_THRESHOLD) {
        dir = e.deltaY > 0 ? 1 : -1;
      }
      if (dir === 0) return;
      wheelCooldownRef.current = now + WHEEL_COOLDOWN_MS;
      tryNavigate(dir);
    },
    [tryNavigate],
  );

  const handlePointerDown = useCallback((e) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      active: true,
    };
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      if (!dragRef.current.active) return;
      const { startX, startY } = dragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      dragRef.current.active = false;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX < SWIPE_THRESHOLD || absX <= absY) return;
      const dir = deltaX > 0 ? -1 : 1;
      justSwipeNavigatedRef.current = true;
      tryNavigate(dir);
    },
    [tryNavigate],
  );

  const handlePointerCancel = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    backdrop.addEventListener("wheel", handleWheel, { passive: false });
    return () => backdrop.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        tryNavigate(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        tryNavigate(1);
      } else if (e.key === "Escape") {
        closeAnimation();
      }
    },
    [tryNavigate, closeAnimation],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target !== e.currentTarget || isClosingRef.current) return;
      if (justSwipeNavigatedRef.current) {
        justSwipeNavigatedRef.current = false;
        return;
      }
      closeAnimation();
    },
    [closeAnimation],
  );

  const handleWrapClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (isClosingRef.current) return;
      if (!e.target.closest("img")) closeAnimation();
    },
    [closeAnimation],
  );

  if (!images?.length) return null;

  const sizerIndex = transitioning ? transitioning.to : currentIndex;
  const isVisible = (i) =>
    i === currentIndex ||
    (transitioning && (i === transitioning.from || i === transitioning.to));
  const getZIndex = (i) => {
    if (!transitioning) return i === currentIndex ? 10 : 0;
    if (i === transitioning.to) return 10;
    if (i === transitioning.from) return 5;
    return 0;
  };

  return (
    <div
      ref={backdropRef}
      className="gallery-swiper-backdrop"
      onClick={handleBackdropClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <div
        ref={wrapRef}
        className="gallery-swiper-wrap"
        onClick={handleWrapClick}
      >
        <div className="gallery-swiper-tabloh">
          <div className="tabloh">
            <div className="tabloh__mat">
              <div ref={viewRef} className="tabloh__view">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`tabloh__slide ${i === sizerIndex ? "tabloh__slide--sizer" : ""}`}
                    data-index={i}
                    style={{
                      visibility: isVisible(i) ? "visible" : "hidden",
                      zIndex: getZIndex(i),
                    }}
                  >
                    <img
                      src={encodeURI(src)}
                      alt={`Gallery ${i + 1}`}
                      draggable={false}
                      className="tabloh__img gallery-swiper-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
