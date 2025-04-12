"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import RequestCard from "./RequestCard";
import { HelpRequest, RequestStatus } from "@/lib/types/index";
import Select from "@/components/ui/Select";
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type HelpFeedProps = {
  initialRequests: HelpRequest[];
  currentUserId?: string;
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type PostgresPayload = RealtimePostgresChangesPayload<{
  [key: string]: unknown;
}>;

type UnverifiedRequest = Record<string, unknown> & {
  id?: unknown;
  user_id?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  urgency_level?: unknown;
  location?: unknown;
  geo_location?: unknown;
  location_hidden?: unknown;
  status?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
};

/**
 * Validates that a help request object has the expected structure and data types.
 *
 * This function ensures that the object includes all required fields with the correct types:
 * - `id`, `user_id`, `title`, `description`, `category`, `created_at`, and `updated_at` must be strings.
 * - `urgency_level` must be one of "low", "medium", or "high".
 * - `location` and `geo_location` must be either a string or null.
 * - `location_hidden` must be a boolean.
 * - `status` must be one of "open", "in_progress", "completed", or "cancelled".
 *
 * @param obj - The help request object to validate, which may be unverified or already validated.
 * @returns True if the object meets the required structure and type constraints, false otherwise.
 */
function isValidRequestData(obj: UnverifiedRequest | HelpRequest): boolean {
  return !!(
    typeof obj.id === "string" &&
    typeof obj.user_id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof obj.category === "string" &&
    ["low", "medium", "high"].includes(String(obj.urgency_level)) &&
    (obj.location === null || typeof obj.location === "string") &&
    (obj.geo_location === null || typeof obj.geo_location === "string") &&
    typeof obj.location_hidden === "boolean" &&
    ["open", "in_progress", "completed", "cancelled"].includes(
      String(obj.status)
    ) &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string"
  );
}

/**
 * Validates and converts an unverified help request object into a properly typed HelpRequest.
 *
 * The function first checks if the provided object meets the expected structure and type requirements using
 * isValidRequestData. If the input object is valid, it converts its fields to construct a new HelpRequest; otherwise,
 * it returns null.
 *
 * @param obj - The unverified request object to validate and convert.
 * @returns A HelpRequest if the input is valid; otherwise, null.
 */
function validateAndConvertRequest(obj: UnverifiedRequest): HelpRequest | null {
  if (!isValidRequestData(obj)) {
    return null;
  }

  return {
    id: obj.id as string,
    user_id: obj.user_id as string,
    title: obj.title as string,
    description: obj.description as string,
    category: obj.category as string,
    urgency_level: String(obj.urgency_level) as HelpRequest["urgency_level"],
    location: obj.location as string | null,
    geo_location: obj.geo_location as string | null,
    location_hidden: obj.location_hidden as boolean,
    status: String(obj.status) as HelpRequest["status"],
    created_at: obj.created_at as string,
    updated_at: obj.updated_at as string,
  };
}

/**
 * Renders the HelpFeed component to display and manage community help requests with real-time updates.
 *
 * The component initializes its state with an initial list of help requests and subscribes to real-time changes
 * via Supabase. It handles INSERT, UPDATE, and DELETE events by validating incoming data before updating the state.
 * Users can filter requests by status using a dropdown, and any invalid data or actions result in an error message.
 *
 * @param initialRequests - The initial list of help requests to display.
 * @param currentUserId - The ID of the current user; used to tailor interactions within the request cards.
 *
 * @returns A React component that renders a header with a status filter and a dynamic list of help request cards.
 */
export default function HelpFeed({
  initialRequests,
  currentUserId,
}: HelpFeedProps) {
  const [requests, setRequests] = useState<HelpRequest[]>(initialRequests);
  const [selectedStatus, setSelectedStatus] = useState<"all" | RequestStatus>(
    "all"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    const channel = supabase
      .channel("help-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "help_requests",
        },
        (payload: PostgresPayload) => {
          const validatedRequest = validateAndConvertRequest(
            payload.new as UnverifiedRequest
          );
          if (!validatedRequest) {
            console.error("Invalid request data received:", payload.new);
            setError("Received invalid request data");
            return;
          }
          setRequests((prev) => [validatedRequest, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "help_requests",
        },
        (payload: PostgresPayload) => {
          const validatedRequest = validateAndConvertRequest(
            payload.new as UnverifiedRequest
          );
          if (!validatedRequest) {
            console.error("Invalid request update received:", payload.new);
            return;
          }
          setRequests((prev) =>
            prev.map((request) =>
              request.id === validatedRequest.id ? validatedRequest : request
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "help_requests",
        },
        (payload: PostgresPayload) => {
          const deletedRequest = payload.old as UnverifiedRequest;
          if (deletedRequest && typeof deletedRequest.id === "string") {
            setRequests((prev) =>
              prev.filter((request) => request.id !== deletedRequest.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredRequests =
    selectedStatus === "all"
      ? requests
      : requests.filter((request) => request.status === selectedStatus);

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "all" | RequestStatus;
    if (
      newStatus === "all" ||
      ["open", "in_progress", "completed", "cancelled"].includes(newStatus)
    ) {
      setSelectedStatus(newStatus);
    } else {
      toast.error("Invalid status filter");
    }
  };

  const handleRequestUpdate = (updatedRequest: HelpRequest) => {
    if (!isValidRequestData(updatedRequest)) {
      console.error("Invalid request update:", updatedRequest);
      toast.error("Failed to update request", {
        description: "The request data is invalid.",
        duration: 4000,
      });
      return;
    }

    setRequests((prev) =>
      prev.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      )
    );
  };

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 rounded-lg dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Community Help Requests</h2>
        <div className="w-48">
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            options={statusOptions}
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No help requests found.
          </p>
          {selectedStatus !== "all" && (
            <p className="mt-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className="text-blue-600 hover:underline"
              >
                View all requests
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={currentUserId}
              onStatusChange={handleRequestUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
