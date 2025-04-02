'use client';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
} 