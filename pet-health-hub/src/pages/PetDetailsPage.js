import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/PetDetailsPage.css";

const PetDetailsPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [petImage, setPetImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPet, setEditedPet] = useState(null);
  const [newWeight, setNewWeight] = useState("");
  const [newVaccine, setNewVaccine] = useState({ vaccine: "", date: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPetDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/pets/${petId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pet details");
        }

        const petData = await response.json();
        console.log("Fetched pet data:", petData);
        setPet(petData);
        setEditedPet(petData);

        if (petData.profileImage && petData.profileImage.filename) {
          try {
            const imageResponse = await fetch(
              `http://localhost:3001/api/pets/image/${petData.profileImage.filename}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              setPetImage(URL.createObjectURL(imageBlob));
            }
          } catch (imageError) {
            console.error("Error fetching pet image:", imageError);
          }
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    fetchPetDetails();
  }, [petId, navigate]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (jpeg, png, gif, webp)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(`http://localhost:3001/api/pets/${petId}/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload pet image');
      }

      const result = await response.json();
      
      const imageResponse = await fetch(
        `http://localhost:3001/api/pets/image/${result.filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        setPetImage(URL.createObjectURL(imageBlob));
        
        setPet(prevPet => ({
          ...prevPet,
          profileImage: {
            filename: result.filename
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading pet image:', error);
      alert('Failed to upload pet image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePet = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedPet)
      });

      if (!response.ok) {
        throw new Error('Failed to update pet details');
      }

      const updatedPet = await response.json();
      setPet(updatedPet);
      setIsEditing(false);
      alert('Pet details updated successfully!');
    } catch (error) {
      console.error('Error updating pet details:', error);
      alert('Failed to update pet details');
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${petId}/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: parseFloat(newWeight) })
      });

      if (!response.ok) {
        throw new Error('Failed to add weight record');
      }

      const updatedPet = await response.json();
      setPet(updatedPet);
      setNewWeight("");
      alert('Weight record added successfully!');
    } catch (error) {
      console.error('Error adding weight record:', error);
      alert('Failed to add weight record');
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    if (!newVaccine.vaccine || !newVaccine.date) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/pets/${petId}/vaccination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newVaccine)
      });

      if (!response.ok) {
        throw new Error('Failed to add vaccination record');
      }

      const updatedPet = await response.json();
      setPet(updatedPet);
      setNewVaccine({ vaccine: "", date: "" });
      alert('Vaccination record added successfully!');
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      alert('Failed to add vaccination record');
    }
  };

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pet-details-page">
      <Header />
      <div className="pet-details-content">
        {/* Pet Profile Section */}
        <section className="pet-header">
          <div className="pet-image-container">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
            />
            {petImage ? (
              <div 
                className="pet-image"
                onClick={() => fileInputRef.current.click()}
              >
                <img src={petImage} alt={pet.name} />
                <div className="edit-overlay">Update Photo</div>
              </div>
            ) : (
              <div 
                className="pet-avatar-placeholder"
                onClick={() => fileInputRef.current.click()}
              >
                {pet.name[0].toUpperCase()}
                <div className="upload-overlay">Click to upload</div>
              </div>
            )}
            {isUploading && <div className="loading-spinner" />}
          </div>

          <div className="pet-info">
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editedPet.name}
                  onChange={(e) => setEditedPet({...editedPet, name: e.target.value})}
                  placeholder="Pet Name"
                />
                <input
                  type="number"
                  value={editedPet.age}
                  onChange={(e) => setEditedPet({...editedPet, age: e.target.value})}
                  placeholder="Age"
                />
                <input
                  type="text"
                  value={editedPet.breed}
                  onChange={(e) => setEditedPet({...editedPet, breed: e.target.value})}
                  placeholder="Breed"
                />
                <div className="edit-actions">
                  <button onClick={handleUpdatePet}>Save Changes</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1>{pet.name}</h1>
                <p><strong>Age:</strong> {pet.age} years</p>
                <p><strong>Breed:</strong> {pet.breed}</p>
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Pet Details
                </button>
              </>
            )}
          </div>
        </section>

        <div className="pet-records">
          {/* Weight History Section */}
          <section className="weight-section">
            <h2>Weight History</h2>
            <form onSubmit={handleAddWeight} className="add-record-form">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight (kg)"
                required
              />
              <button type="submit">Add Weight Record</button>
            </form>
            <div className="records-list">
              {pet.weightTrend && pet.weightTrend.length > 0 ? (
                pet.weightTrend.map((weight, index) => (
                  <div key={index} className="record-item">
                    <span className="record-date">
                      {new Date(weight.date).toLocaleDateString()}
                    </span>
                    <span className="record-value">{weight.weight} kg</span>
                  </div>
                ))
              ) : (
                <p className="no-records">No weight records available</p>
              )}
            </div>
          </section>

          {/* Vaccination History Section */}
          <section className="vaccination-section">
            <h2>Vaccination Records</h2>
            <form onSubmit={handleAddVaccination} className="add-record-form">
              <input
                type="text"
                value={newVaccine.vaccine}
                onChange={(e) => setNewVaccine({...newVaccine, vaccine: e.target.value})}
                placeholder="Vaccine name"
                required
              />
              <input
                type="date"
                value={newVaccine.date}
                onChange={(e) => setNewVaccine({...newVaccine, date: e.target.value})}
                required
              />
              <button type="submit">Add Vaccination Record</button>
            </form>
            <div className="records-list">
              {pet.vaccinationHistory && pet.vaccinationHistory.length > 0 ? (
                pet.vaccinationHistory.map((vacc, index) => (
                  <div key={index} className="record-item">
                    <span className="record-name">{vacc.vaccine}</span>
                    <span className="record-date">
                      {new Date(vacc.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-records">No vaccination records available</p>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PetDetailsPage;