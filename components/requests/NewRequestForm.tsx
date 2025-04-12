"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UrgencyLevel } from "@/lib/types";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { getGeoLocation } from "@/lib/utils/location";
import MapAttribution from "@/components/common/MapAttribution";

const CATEGORIES = [
  "General Help",
  "Transportation",
  "Shopping",
  "Household",
  "Childcare",
  "Pet Care",
  "Medical",
  "Other",
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low - Can wait a few days" },
  { value: "medium", label: "Medium - Within 24 hours" },
  { value: "high", label: "High - Immediate assistance needed" },
];

/**
 * Renders a form for creating a new help request.
 *
 * This component gathers details such as title, description, category, urgency level, and location. If a location is provided and not hidden, it attempts to retrieve the corresponding geographic coordinates from an external API. The form validates inputs and submits the request to a Supabase database, displaying appropriate success or error notifications.
 *
 * @param userId - The identifier for the user submitting the help request.
 */
export default function NewRequestForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeoError(null);

    const formData = new FormData(e.currentTarget);
    const location = formData.get("location") as string;
    const locationHidden = formData.get("location_hidden") === "true";

    let geoLocation = null;
    if (location && !locationHidden) {
      geoLocation = await getGeoLocation(location);
      if (!geoLocation && !locationHidden) {
        setGeoError(
          "Could not find coordinates for the provided location. Please check the address."
        );
        setIsSubmitting(false);
        return;
      }
    }

    const urgencyLevel = formData.get("urgency_level") as UrgencyLevel;
    if (!["low", "medium", "high"].includes(urgencyLevel)) {
      toast.error("Invalid urgency level");
      setIsSubmitting(false);
      return;
    }

    const data = {
      user_id: userId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      urgency_level: urgencyLevel,
      location,
      location_hidden: locationHidden,
      status: "open" as const,
      geo_location: geoLocation
        ? `POINT(${geoLocation.lon} ${geoLocation.lat})`
        : null,
    };

    try {
      const { error } = await supabase.from("help_requests").insert([data]);

      if (error) throw error;

      // Show success toast
      toast.success("Help request created successfully!", {
        description:
          "Your request has been posted and is now visible to the community.",
        duration: 3000,
      });

      // Wait for the toast to be visible before redirecting
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Error creating request:", err);
      toast.error("Failed to create request", {
        description:
          "There was an error creating your help request. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
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
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
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
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Category
        </label>
        <select
          name="category"
          id="category"
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
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
        <label
          htmlFor="urgency_level"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Urgency Level
        </label>
        <select
          name="urgency_level"
          id="urgency_level"
          required
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
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
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Location
        </label>
        <input
          type="text"
          name="location"
          id="location"
          className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Enter a specific address or area"
        />
        {geoError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {geoError}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name="location_hidden"
          id="location_hidden"
          value="true"
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label
          htmlFor="location_hidden"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Hide my location from other users
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
          size="lg"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Creating..." : "Create Request"}
        </Button>
      </div>
    </form>
  );
}
