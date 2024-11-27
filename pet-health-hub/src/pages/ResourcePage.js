
import React, { useState, useEffect, useRef } from 'react';
import '../styles/ResourcePage.css';

const ResourcesPage = () => {
  const [services, setServices] = useState([]);
  const mapRef = useRef(null);
  const map = useRef(null);
  const service = useRef(null);

  // Function to fetch services using Places API
  const fetchNearbyServices = (location) => {
    const request = {
      location,
      radius: 5000,  // 5 km radius
      keyword: 'dogs, cats, pet care, dog grooming, cat grooming, veterinary, puppy care, pet clinic, pet shop, pet boarding',
    };

    service.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setServices(results);  // Store results in state
        // Add markers to the map
        results.forEach((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,  // Ensure this is a valid LatLng object
            map: map.current,
            title: place.name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',  // Red icon
            },
          });
        });
      } else {
        console.error("Error fetching services", status);
      }
    });
  };

  // Initialize map and get user location
  useEffect(() => {
    if (window.google) {
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },  // Default location (New York)
        zoom: 13,
      });

      service.current = new window.google.maps.places.PlacesService(map.current);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.current.setCenter(userLocation);
            fetchNearbyServices(userLocation);
          },
          () => alert("Geolocation failed!")
        );
      }
    } else {
      console.error("Google Maps API is not loaded.");
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
