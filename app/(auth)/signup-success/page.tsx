import Link from 'next/link';

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">Check your email</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We've sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
          </p>
        </div>
        
        <div className="mt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Didn't receive an email?{' '}
            <button className="text-blue-600 hover:underline dark:text-blue-400">
              Resend confirmation
            </button>
          </p>
        </div>
        
        <div className="mt-6">
          <Link 
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
} 