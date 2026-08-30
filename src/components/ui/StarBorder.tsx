import React from 'react';
import { cn } from '../../utils/cn';

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'div',
  className = '',
  color = '#8B5CF6',
  speed = '6s',
  children,
  ...props
}) => {
  return (
    <Component className={cn('relative inline-block p-[1px] overflow-hidden rounded-xl', className)} {...props}>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="relative z-10 w-full h-full flex">
        {children}
      </div>
    </Component>
  );
};
