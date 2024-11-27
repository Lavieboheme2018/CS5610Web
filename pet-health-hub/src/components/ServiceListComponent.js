import React, { useState, useEffect } from 'react';

const ServiceListComponent = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="service-list">
      <h3>Nearby Services</h3>
      {services.length > 0 ? (
        services.map((service, index) => (
          <div key={index} className="service-item">
            <h4>{service.name}</h4>
            <p>{service.address}</p>
            <p>Rating: {service.rating}</p>
          </div>
        ))
      ) : (
        <p>No services found.</p>
      )}
    </div>
  );
};

export default ServiceListComponent;
