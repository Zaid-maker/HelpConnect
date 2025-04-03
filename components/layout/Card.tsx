'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a styled card container.
 *
 * This component creates a div element with default classes for background color that adapt to light and dark modes, shadow, rounded corners, and padding. The container wraps any child content passed to it, and additional CSS classes can be provided via the optional className prop.
 *
 * @param children The content to display inside the card.
 * @param className Optional CSS classes to customize the card's appearance.
 * @returns A JSX element representing the styled card.
 */
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  );
} 