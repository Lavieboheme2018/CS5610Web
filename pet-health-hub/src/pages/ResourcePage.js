
import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ResourcePage.css';

const ResourcesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const mapRef = useRef(null);
  const map = useRef(null);
  const service = useRef(null);
  const infoWindow = useRef(null);
  const markers = useRef([]);
  const geocoder = useRef(null);

  const getDirectionsUrl = (destLat, destLng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
  };

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
  };

  const fetchNearbyServices = (location) => {
    setIsLoading(true);
    const request = {
      location,
      radius: 5000,
      keyword: 'dogs, cats, pet care, dog grooming, cat grooming, veterinary, puppy care, pet clinic, pet shop, pet boarding',
    };

    service.current.nearbySearch(request, (results, status) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        if (!infoWindow.current) {
          infoWindow.current = new window.google.maps.InfoWindow({
            disableAutoPan: true
          });
        }

        results.forEach((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: map.current,
            title: place.name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
          });

          markers.current.push(marker);

          marker.addListener('click', () => {
            if (infoWindow.current) {
              infoWindow.current.close();
            }

            service.current.getDetails(
              {
                placeId: place.place_id,
                fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours']
              },
              (placeDetails, detailStatus) => {
                if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();
                  const directionsUrl = getDirectionsUrl(lat, lng);

                  const content = `
                    <div class="info-window">
                      <h3>${placeDetails.name}</h3>
                      ${placeDetails.rating ? `<p>Rating: ${placeDetails.rating} ⭐</p>` : ''}
                      ${placeDetails.formatted_address ? `<p>Address: ${placeDetails.formatted_address}</p>` : ''}
                      ${placeDetails.formatted_phone_number ? `<p>Phone: ${placeDetails.formatted_phone_number}</p>` : ''}
                      ${placeDetails.website ? `<p><a href="${placeDetails.website}" target="_blank">Visit Website</a></p>` : ''}
                      <p><a href="${directionsUrl}" target="_blank" class="directions-link">Get Directions 🚗</a></p>
                      ${placeDetails.opening_hours ? `
                        <p>Hours:</p>
                        <ul>
                          ${placeDetails.opening_hours.weekday_text.map(day => `<li>${day}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>
                  `;

                  infoWindow.current.setContent(content);
                  infoWindow.current.open({
                    map: map.current,
                    anchor: marker,
                    shouldFocus: false
                  });
                }
              }
            );
          });
        });
      } else {
        console.error("Error fetching services", status);
      }
    });
  };

  const handleSearch = () => {
    if (geocoder.current && locationInput.trim() !== '') {
      geocoder.current.geocode({ address: locationInput.trim() }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;
          map.current.setCenter(location);
          fetchNearbyServices(location);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    }
  };

  useEffect(() => {
    if (window.google) {
      map.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 49.2827, lng: -123.1207 },
        zoom: 13,
      });

      service.current = new window.google.maps.places.PlacesService(map.current);
      geocoder.current = new window.google.maps.Geocoder();

      map.current.addListener('idle', () => {
        const center = map.current.getCenter();
        clearMarkers();
        fetchNearbyServices(center);
      });
    } else {
      console.error("Google Maps API is not loaded.");
    }

    return () => {
      if (infoWindow.current) {
        infoWindow.current.close();
      }
      clearMarkers();
      if (map.current && window.google) {
        window.google.maps.event.clearListeners(map.current, 'idle');
      }
    };
  }, []);

  return (
    <div className="resources-page">
      <Header />
      <div className="content-wrapper">
        <h1>Nearby Pet Services</h1>

        {/* Location Input with Magnifying Glass Icon */}
        <div className="location-search">
          <input
            type="text"
            placeholder="Search by location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="location-input"
          />
          <span 
            className="search-icon" 
            onClick={handleSearch}
          >
            🔍
          </span>
        </div>

        {/* Map container */}
        <div className="map-container">
          <div ref={mapRef} style={{ height: '500px', width: '100%', marginBottom: '20px' }}></div>
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="spinner"></div>
                <p>Searching for pet services in this area...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResourcesPage;
