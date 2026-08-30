import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = React.useState(0);
    const divRef = React.useRef<HTMLDivElement>(null);

    // Merge refs
    const setRefs = React.useCallback(
      (node: HTMLDivElement) => {
        divRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const div = divRef.current;
      const rect = div.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
      <motion.div
        ref={setRefs}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => hoverable && setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        whileHover={hoverable ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : undefined}
        className={cn(
          'relative bg-obsidian/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300',
          hoverable ? 'hover:border-primary/50 cursor-pointer' : '',
          className
        )}
        {...props}
      >
        {hoverable && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
            style={{
              opacity,
              background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
            }}
          />
        )}
        <div className="relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-5 border-b border-white/[0.06]', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-bold leading-none tracking-tight text-content', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
