import { useEffect, useRef } from 'react';
import { gsap } from '../../shared/lib/gsap';

export default function HomePage() {
  const rootRef = useRef(null);

  useEffect(() => {
    // Use gsap.context for automatic cleanup and best performance in React
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '#Homepage',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="Homepage" ref={rootRef}>
      Home Page
    </div>
  );
}

