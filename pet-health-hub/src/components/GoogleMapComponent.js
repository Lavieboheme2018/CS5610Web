// import React, { useEffect, useRef } from 'react'; 
// import ServiceListComponent from './ServiceListComponent';

// const GoogleMapComponent = () => {
//   const mapRef = useRef(null);  // Reference to the DOM element where map is rendered
//   const map = useRef(null);      // Holds the map instance
//   const service = useRef(null);  // Holds the Places Service instance

//   useEffect(() => {
//     if (window.google) {
//       // Initialize the map
//       map.current = new window.google.maps.Map(mapRef.current, {
//         center: { lat: 40.7128, lng: -74.0060 },  // Default center (New York)
//         zoom: 13
//       });
  
//       // Create the places service
//       service.current = new window.google.maps.places.PlacesService(map.current);
  
//       // Get the user's location
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const userLocation = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//             map.current.setCenter(userLocation);
  
//             // Now search for nearby pet hospitals or services
//             searchNearbyServices(userLocation);
//           },
//           () => alert("Geolocation failed!")
//         );
//       }
//     }
//   }, []);

//   // Function to search for nearby services (like pet hospitals)
//   const searchNearbyServices = (location) => {
//     const request = {
//       location,
//       radius: 5000,  // 5 km radius
//       keyword: 'dogs, cats, pet care, dog grooming, cat grooming, veterinary, puppy care, pet clinic, pet shop, pet boarding',
//     };

//     service.current.nearbySearch(request, (results, status) => {
//       if (status === window.google.maps.places.PlacesServiceStatus.OK) {
//         // Do something with the results
//         console.log(results);  // You can display these results in your UI
//       }
//     });
//   };

//   return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
// };

// export default GoogleMapComponent;

import React, { useEffect, useRef, useState } from 'react'; 
import ServiceListComponent from './ServiceListComponent';

const GoogleMapComponent = () => {
  const mapRef = useRef(null);  // Reference to the DOM element where map is rendered
  const map = useRef(null);      // Holds the map instance
  const service = useRef(null);  // Holds the Places Service instance
  const [services, setServices] = useState([]); // State to hold fetched services

  useEffect(() => {
    if (window.google) {
      // Initialize the map
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },  // Default center (New York)
        zoom: 13
      });
  
      // Create the places service
      service.current = new window.google.maps.places.PlacesService(map.current);
  
      // Get the user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.current.setCenter(userLocation);
  
            // Now search for nearby pet hospitals or services
            searchNearbyServices(userLocation);
          },
          () => alert("Geolocation failed!")
        );
      }
    }
  }, []);

  // Function to search for nearby services (like pet hospitals)
  const searchNearbyServices = (location) => {
    const request = {
      location,
      radius: 5000,  // 5 km radius
      keyword: 'dogs, cats, pet care, dog grooming, cat grooming, veterinary, puppy care, pet clinic, pet shop, pet boarding',
    };

    service.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Save results to state
        setServices(results);  // This will trigger a re-render and update ServiceListComponent
      }
    });
  };

  return (
    <div>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
      {/* Pass the services to ServiceListComponent to display */}
      <ServiceListComponent services={services} />
    </div>
  );
};

export default GoogleMapComponent;
