import React from 'react';
import MapAttribution from "../common/MapAttribution";

interface RequestLocationDisplayProps {
  location: string;
}

const RequestLocationDisplay: React.FC

<RequestLocationDisplayProps> = ({ location }) => {
  return (
    <div className="location-display">
      <p>{location}</p>
      <MapAttribution />
    </div>
  );
};

export default RequestLocationDisplay;
