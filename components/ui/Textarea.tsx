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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <textarea
        className={`
          block w-full px-4 py-3 rounded-lg border border-gray-300 
          shadow-sm bg-white dark:bg-gray-700 
          text-gray-900 dark:text-white 
          dark:border-gray-600
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          dark:focus:border-blue-400 dark:focus:ring-blue-400
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          placeholder-gray-400 dark:placeholder-gray-500
          resize-none
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