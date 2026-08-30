import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReveal = () => {
  const location = useLocation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use a smaller threshold and positive rootMargin so elements at the top
    // immediately trigger as intersecting without needing to scroll.
    const observerOptions = {
      root: null,
      rootMargin: '100px 0px 100px 0px',
      threshold: 0.05
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Optional: Stop observing once revealed to improve performance
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!observerRef.current) return;

    const observeElements = () => {
      // Avoid selecting elements that are already handled by Framer Motion (like Card)
      // or that shouldn't be hidden by default.
      const elements = document.querySelectorAll(
        'section, article, .reveal-target'
      );
      
      elements.forEach((el) => {
        if (!el.classList.contains('is-observed')) {
          el.classList.add('scroll-reveal-element', 'is-observed');
          observerRef.current?.observe(el);
        }
      });
    };

    // Wait for the new route's DOM and Framer Motion transitions to mount
    const timer = setTimeout(observeElements, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};
