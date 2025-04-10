"use client";

import { HelpRequest } from "@/lib/types/index";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RequestStatus from "./RequestStatus";
import UrgencyLevel from "./UrgencyLevel";

type RequestCardProps = {
  request: HelpRequest;
  currentUserId?: string;
  onStatusChange?: (updatedRequest: HelpRequest) => void;
};

function formatLocation(request: HelpRequest): string | null {
  if (!request.location || request.location_hidden) {
    return null;
  }

  // If we have geo_location, we can potentially add distance calculation here
  // For now, just return the location string
  return request.location;
}

export default function RequestCard({
  request: initialRequest,
  currentUserId,
  onStatusChange,
}: RequestCardProps) {
  const [request, setRequest] = useState(initialRequest);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isOwner = currentUserId === request.user_id;
  const location = formatLocation(request);

  const handleOfferHelp = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      router.push(`/requests/${request.id}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (updatedRequest: HelpRequest) => {
    setRequest(updatedRequest);
    onStatusChange?.(updatedRequest);
  };

  const handleUrgencyChange = (updatedRequest: HelpRequest) => {
    setRequest(updatedRequest);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{request.title}</h3>
          <div className="flex items-center space-x-2">
            {currentUserId && (
              <>
                <UrgencyLevel
                  request={request}
                  currentUserId={currentUserId}
                  onUrgencyChange={handleUrgencyChange}
                />
                <RequestStatus
                  request={request}
                  currentUserId={currentUserId}
                  onStatusChange={handleStatusChange}
                />
              </>
            )}
            {!currentUserId && (
              <UrgencyLevel
                request={request}
                currentUserId=""
                onUrgencyChange={handleUrgencyChange}
              />
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {request.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
            {request.category}
          </span>
          {location && (
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {location}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Posted by {request.user?.full_name || "Anonymous"}
          </span>

          {!isOwner && request.status === "open" && (
            <button
              onClick={handleOfferHelp}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? "Loading..." : "I Can Help"}
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => router.push(`/requests/edit/${request.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
