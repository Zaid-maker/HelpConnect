'use client';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a responsive page container with adaptive theming.
 *
 * This component wraps its children in an outer container that spans the full viewport height and applies a background
 * color suitable for both light and dark themes. It then centers an inner container that limits the content width,
 * applies responsive horizontal padding and vertical spacing, and accepts additional CSS classes via the className prop.
 *
 * @param children - The content to be displayed within the container.
 * @param className - Optional additional CSS classes for the inner container.
 */
export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
} 