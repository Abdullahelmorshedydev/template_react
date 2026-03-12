import { useRef, useEffect } from "react";
import "./index.scss";

export default function HomePage() {
  const pageRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

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
  }, []);

  return (
    <div ref={pageRef} className="home-page">
      <div className="home-hero">
        <div className="hero-media">
          <div className="hero-overlay" />
          <div className="hero-gradient" />
          <div className="cursor-hole" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
