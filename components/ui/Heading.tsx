'use client';

import { ElementType } from 'react';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a semantic heading element with dynamic sizing and custom styles.
 *
 * The component selects an HTML heading (h1–h6) based on the provided `level` prop, applies
 * base typography styles along with a size-specific class, and merges any additional classes
 * from the `className` prop.
 *
 * @param level - Optional heading level (1 to 6) that determines both the element type and text size. Defaults to 1.
 * @param children - The content to be rendered within the heading.
 * @param className - Optional additional CSS classes for custom styling.
 *
 * @returns A React element representing the styled heading.
 */
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