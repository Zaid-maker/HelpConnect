'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const CATEGORIES = [
  'General Help',
  'Transportation',
  'Shopping',
  'Household',
  'Childcare',
  'Pet Care',
  'Medical',
  'Other'
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Can wait a few days' },
  { value: 'medium', label: 'Medium - Within 24 hours' },
  { value: 'high', label: 'High - Immediate assistance needed' }
];

export default function NewRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      user_id: userId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      urgency_level: formData.get('urgency_level') as string,
      location: formData.get('location') as string,
      location_hidden: formData.get('location_hidden') === 'true'
    };

    try {
      const { error } = await supabase
        .from('help_requests')
        .insert([data]);

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Brief description of what you need help with"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          placeholder="Provide more details about your request..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Category
        </label>
        <select
          name="category"
          id="category"
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%0110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%0110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="urgency_level" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Urgency Level
        </label>
        <select
          name="urgency_level"
          id="urgency_level"
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%0110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%0110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
        >
          <option value="">Select urgency level</option>
          {URGENCY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Location
        </label>
        <input
          type="text"
          name="location"
          id="location"
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="City, State, or specific area"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name="location_hidden"
          id="location_hidden"
          value="true"
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="location_hidden" className="text-sm text-gray-700 dark:text-gray-300">
          Hide my location from other users
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Request'}
        </button>
      </div>
    </form>
  );
} 