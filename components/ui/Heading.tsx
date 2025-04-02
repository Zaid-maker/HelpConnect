'use client';

import { ElementType } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export default function Heading({ level = 1, children, className = '' }: HeadingProps) {
  const baseStyles = 'font-bold text-gray-900 dark:text-white';
  
  const sizes = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  };

  const classes = `${baseStyles} ${sizes[level]} ${className}`;

  const Component: ElementType = `h${level}`;

  return <Component className={classes}>{children}</Component>;
} 