"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { HelpRequest, UrgencyLevel, RequestStatus } from "@/lib/types/index";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { getGeoLocation } from "@/lib/utils/location";

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

type RequestEditFormProps = {
  initialRequest: HelpRequest;
};

/**
 * Renders a form for editing an existing help request.
 *
 * This component displays a pre-populated form that allows users to update the details of a help request, including title, description, category, urgency level, and location. It first verifies that the current user is authorized to edit the request by comparing the user's ID with the help request owner's ID. If the location is updated and visible, it attempts to fetch geolocation data before submitting the updated request to the backend. On a successful update, the user is redirected to the dashboard; otherwise, error messages are displayed.
 *
 * @param initialRequest - The help request data to be edited. Must belong to the current user.
 */
export default function RequestEditForm({
  initialRequest,
}: RequestEditFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Verify user has access to edit this request
  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== initialRequest.user_id) {
        toast.error("Access Denied", {
          description: "You do not have permission to edit this request.",
          duration: 4000,
        });
        router.push("/dashboard");
      }
    };
    checkAccess();
  }, [initialRequest.user_id, router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeoError(null);

    const formData = new FormData(e.currentTarget);
    const location = formData.get("location") as string;
    const locationHidden = formData.get("location_hidden") === "true";

    let geoLocation = null;
    if (location && !locationHidden) {
      if (
        location !== initialRequest.location ||
        !initialRequest.geo_location
      ) {
        geoLocation = await getGeoLocation(location);
        if (!geoLocation && !locationHidden) {
          setGeoError(
            "Could not find coordinates for the provided location. Please check the address."
          );
          setIsSubmitting(false);
          return;
        }
      }
    }

    const urgencyLevel = formData.get("urgency_level") as UrgencyLevel;
    if (!["low", "medium", "high"].includes(urgencyLevel)) {
      toast.error("Invalid urgency level");
      setIsSubmitting(false);
      return;
    }

    const status = initialRequest.status as RequestStatus;
    if (!["open", "in_progress", "completed", "cancelled"].includes(status)) {
      toast.error("Invalid request status");
      setIsSubmitting(false);
      return;
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      urgency_level: urgencyLevel,
      location,
      location_hidden: locationHidden,
      status,
      geo_location: geoLocation
        ? `POINT(${geoLocation.lon} ${geoLocation.lat})`
        : location === initialRequest.location
        ? initialRequest.geo_location
        : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("help_requests")
        .update(data)
        .eq("id", initialRequest.id);

      if (error) throw error;

      toast.success("Help request updated successfully!", {
        description: "Your changes have been saved.",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Error updating request:", err);
      toast.error("Failed to update request", {
        description:
          "There was an error updating your help request. Please try again.",
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
          defaultValue={initialRequest.title}
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
          defaultValue={initialRequest.description}
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
          defaultValue={initialRequest.category}
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
          defaultValue={initialRequest.urgency_level}
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
          defaultValue={initialRequest.location || ""}
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
          defaultChecked={initialRequest.location_hidden}
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
