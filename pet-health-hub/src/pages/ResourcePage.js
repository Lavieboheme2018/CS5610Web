import React, { useState, useEffect, useRef } from 'react';
import GoogleMapComponent from '../components/GoogleMapComponent'; 
import '../styles/ResourcePage.css';

const ResourcesPage = () => {
  const [services, setServices] = useState([]);
  const mapRef = useRef(null);
  const service = useRef(null);

  // Function to fetch services using Places API
  const fetchNearbyServices = (location) => {
    const request = {
      location,
      radius: 5000,  // 5 km radius
      type: ['hospital'],  // Search for hospitals (can modify for other types of services)
    };

    service.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setServices(results);  // Store results in state
      } else {
        console.error("Error fetching services", status);
      }
    });
  };

  // Initialize map and get user location
  useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },  // Default location (New York)
        zoom: 13,
      });

      service.current = new window.google.maps.places.PlacesService(map);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userLocation);
            fetchNearbyServices(userLocation);
          },
          () => alert("Geolocation failed!")
        );
      }
    }
  }, []);

  return (
    <div className="resources-page">
      <h1>Nearby Pet Services</h1>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>

      <div className="service-list">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div key={index} className="service-item">
              <h3>{service.name}</h3>
              <p>{service.vicinity}</p>
            </div>
          ))
        ) : (
          <p>Loading nearby services...</p>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
