'use client';

import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Renders a styled clickable element that functions as either a button or a link.
 *
 * When the `href` prop is provided, the component renders as a Next.js `<Link>` component, enabling navigation.
 * Otherwise, it renders as a standard HTML `<button>` element. Styling is dynamically determined by the `variant`
 * and `size` props—with defaults of "primary" and "md" respectively—and can be further customized via the `className`
 * prop. Any additional props are passed to the `<button>` element when rendered.
 *
 * @param variant - Determines the visual style; allowed values are "primary", "secondary", or "outline". Defaults to "primary".
 * @param size - Specifies the size of the button; allowed values are "sm", "md", or "lg". Defaults to "md".
 * @param href - Optional URL. If provided, renders the component as a link.
 * @param children - The content displayed inside the button.
 * @param className - Additional CSS classes for custom styling.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 shadow-sm';
  
  const variants = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-offset-gray-800',
    secondary: 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500 dark:focus:ring-offset-gray-800',
    outline: 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500 dark:focus:ring-offset-gray-800'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
} 