interface TextareaProps {
  label: string;
  error?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function Textarea({ 
  label, 
  error, 
  className = '', 
  value = '', 
  ...props 
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-blue-500 sm:text-sm
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
          dark:focus:border-blue-400 dark:focus:ring-blue-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        value={value}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
} 