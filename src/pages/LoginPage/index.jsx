import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./index.scss";

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/", { replace: true });
      return;
    }
    // Start with intro visible; form and welcome text hidden
    gsap.set(".login-form", { opacity: 0, y: 24, visibility: "hidden" });
    gsap.set(".login-text-phase", { opacity: 0, visibility: "hidden" });
    gsap.set(".login-brand-fill", {
      clipPath: "inset(0 100% 0 0)",
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(".login-intro-phase", { display: "none" });
      },
    });

    // Container in
    tl.fromTo(
      ".login-container",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    )
      // Phase 1: "Secret Gallery" (loader is on the text via CSS)
      .fromTo(
        ".login-brand",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        "-=0.4",
      )
      // Orange fill animation on text before opening form
      // 1) Sweep from first to last letter and back (1st cycle)
      .fromTo(
        ".login-brand-fill",
        { clipPath: "inset(0% 90% 0% 0%)" }, // thin band starting at the left
        {
          clipPath: "inset(0% 0% 0% 90%)", // same band at the right
          duration: 1.1,
          ease: "none",
          yoyo: true,
          repeat: 1, // go then return = 1 full cycle
        },
      )
      // 2) Sweep again (2nd cycle)
      .fromTo(
        ".login-brand-fill",
        { clipPath: "inset(0% 90% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 90%)",
          duration: 1.1,
          ease: "none",
          yoyo: true,
          repeat: 1,
        },
      )
      // 3) When it has just returned to the first letters on the second cycle,
      // expand to cover the whole word
      .to(".login-brand-fill", {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.8,
        ease: "power2.out",
      })
      // Then transition to the form
      .to(".login-intro-phase", {
        opacity: 0,
        y: -16,
        duration: 0.4,
        ease: "power2.in",
      })
      .set(".login-intro-phase", { visibility: "hidden" })
      .set(".login-text-phase", { visibility: "visible" })
      // Phase 2: Welcome Back + subtitle
      .fromTo(
        ".login-title",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        "-=0.2",
      )
      .fromTo(
        ".login-subtitle",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3",
      )
      .set(".login-form", { visibility: "visible" })
      .fromTo(
        ".login-form",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        "-=0.2",
      )
      .fromTo(
        ".input-wrapper",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
        "-=0.35",
      )
      .fromTo(
        ".login-button",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
        "-=0.2",
      );

    // Floating particles
    gsap.to(".particle", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      opacity: "random(0.3, 0.8)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: { each: 0.5, from: "random" },
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Fake auth: correct password is 123456789
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password === "123456789") {
      // Store token so api.js and protected routes recognize the user
      localStorage.setItem("authToken", "logged-in");
      // Success animation
      gsap.to(".login-form", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(".login-button", {
        scale: 1.2,
        duration: 0.2,
        onComplete: () => {
          navigate("/");
        },
      });
    } else {
      setError("Hint: numbers from 1 - 9");
      setIsLoading(false);
      // Error shake animation
      gsap.to(".input-wrapper", {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  };

  return (
    <div className="login-page">
      {/* Background Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: "#F57F00",
              borderRadius: "50%",
            }}
          />
        ))}
      </div>

      <div className="login-container">
        <div className="login-content">
          {/* Phase 1: Loader – large word only, no button */}
          <div className="login-intro-phase">
            <h1 className="login-brand">
              <span className="login-brand-text">Secret Gallery</span>
              <span className="login-brand-fill" aria-hidden="true">
                Secret Gallery
              </span>
            </h1>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="input-line"></div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              type="submit"
              className={`login-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? <span className="button-loader"></span> : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
