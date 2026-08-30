import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  config?: { tension: number; friction: number };
  initialOpacity?: number;
  animateOpacity?: number;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 30,
  direction = 'vertical',
  reverse = false,
  config = { tension: 50, friction: 25 },
  initialOpacity = 0,
  animateOpacity = 1,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
  as: Component = 'div',
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const dirModifier = reverse ? -1 : 1;
  const axis = direction === 'vertical' ? 'y' : 'x';

  return (
    <Component ref={ref} className={className}>
      <motion.div
        initial={{ 
          opacity: initialOpacity, 
          [axis]: distance * dirModifier,
          scale
        }}
        animate={inView ? { 
          opacity: animateOpacity, 
          [axis]: 0,
          scale: 1 
        } : {}}
        transition={{
          type: 'spring',
          stiffness: config.tension,
          damping: config.friction,
          delay: delay / 1000
        }}
      >
        {children}
      </motion.div>
    </Component>
  );
};
