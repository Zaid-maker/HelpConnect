import React from "react";

import Link from "next/link";

/**
 * Attribution component for OpenStreetMap data.
 * To be included wherever map or location data from OpenStreetMap is displayed.
 */
export default function MapAttribution() {
  return (

<div className="text-xs text-gray-600 mt-1">
      ©{" "}
      <a 
        href="https://www.openstreetmap.org/copyright" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:text-gray-800"
      >
        OpenStreetMap contributors
      </a>
    </div>

);
}