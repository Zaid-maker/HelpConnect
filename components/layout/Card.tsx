'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  );
} 