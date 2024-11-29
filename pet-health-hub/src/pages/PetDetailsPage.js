import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/PetDetailsPage.css";
import BreedSelector from '../components/BreedSelector';

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
  const [editingWeightId, setEditingWeightId] = useState(null);
  const [editingVaccId, setEditingVaccId] = useState(null);
  const [editingWeight, setEditingWeight] = useState({ weight: "", date: "" });
  const [editingVacc, setEditingVacc] = useState({ vaccine: "", date: "" });
  const fileInputRef = useRef(null);
  const [selectedBreed, setSelectedBreed] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const handleBreedSelection = (breed) => {
      setSelectedBreed(breed);
    };

    const fetchPetDetails = async () => {
      try {
        const response = await fetch(`https://pet-health-hub-backend.onrender.com/api/pets/${petId}`, {
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
              `https://pet-health-hub-backend.onrender.com/api/pets/image/${petData.profileImage.filename}`,
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
      const response = await fetch(`https://pet-health-hub-backend.onrender.com/api/pets/${petId}/profile-image`, {
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
        `https://pet-health-hub-backend.onrender.com/api/pets/image/${result.filename}`,
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
      const response = await fetch(`https://pet-health-hub-backend.onrender.com/api/pets/${petId}`, {
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
      const response = await fetch(`https://pet-health-hub-backend.onrender.com/api/pets/${petId}/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ weight: parseFloat(newWeight), date: new Date().toISOString() })
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
      const response = await fetch(`https://pet-health-hub-backend.onrender.com/api/pets/${petId}/vaccination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vaccine: newVaccine.vaccine, date: new Date(newVaccine.date).toISOString() })
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

  const formatWeightData = (weightTrend) => {
    return [...weightTrend]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(record => ({
        date: new Date(record.date).toISOString().slice(0, 10),
        weight: record.weight
      }));
  };

  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://pet-health-hub-backend.onrender.com/api/pets/${petId}/weight/${editingWeightId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            weight: editingWeight.weight,
            date: new Date(editingWeight.date).toISOString()
          })
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update weight record');
      }
  
      const updatedPet = await response.json();
      setPet(updatedPet);
      setEditingWeightId(null);
      setEditingWeight({ weight: "", date: "" });
    } catch (error) {
      console.error('Error updating weight record:', error);
      alert('Failed to update weight record');
    }
  };
  
  const handleUpdateVaccination = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://pet-health-hub-backend.onrender.com/api/pets/${petId}/vaccination/${editingVaccId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            vaccine: editingVacc.vaccine,
            date: new Date(editingVacc.date).toISOString()
          })
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update vaccination record');
      }
  
      const updatedPet = await response.json();
      setPet(updatedPet);
      setEditingVaccId(null);
      setEditingVacc({ vaccine: "", date: "" });
    } catch (error) {
      console.error('Error updating vaccination record:', error);
      alert('Failed to update vaccination record');
    }
  };

  const handleDeleteWeight = async (weightId) => {
    if (!window.confirm('Are you sure you want to delete this weight record?')) {
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://pet-health-hub-backend.onrender.com/api/pets/${petId}/weight/${weightId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to delete weight record');
      }
  
      const updatedPet = await response.json();
      setPet(updatedPet);
      setEditingWeightId(null);
      setEditingWeight({ weight: "", date: "" });
    } catch (error) {
      console.error('Error deleting weight record:', error);
      alert('Failed to delete weight record');
    }
  };
  
  const handleDeleteVaccination = async (vaccId) => {
    if (!window.confirm('Are you sure you want to delete this vaccination record?')) {
      return;
    }
  
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://pet-health-hub-backend.onrender.com/api/pets/${petId}/vaccination/${vaccId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to delete vaccination record');
      }
  
      const updatedPet = await response.json();
      setPet(updatedPet);
      setEditingVaccId(null);
      setEditingVacc({ vaccine: "", date: "" });
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      alert('Failed to delete vaccination record');
    }
  };

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pet-details-page">
      <Header />
      <div className="pet-details-content">
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
                <BreedSelector
                  onSelectBreed={(selectedBreed) =>
                    setEditedPet({ ...editedPet, breed: selectedBreed })
                  }
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
              <label htmlFor="weight-input">Weight (kg)</label>
              <input
                type="number"
                id="weight-input"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight (kg)"
                required
              />
              <button type="submit">Add Weight</button>
            </form>
            {pet.weightTrend && pet.weightTrend.length > 0 ? (
              <>
                <div className="weight-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatWeightData(pet.weightTrend)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#007bff" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="records-list">
                  {pet.weightTrend.sort((a, b) => new Date(a.date) - new Date(b.date)).map((weight) => (
                    <div key={weight._id} className="record-item">
                      {editingWeightId === weight._id ? (
                        <form onSubmit={handleUpdateWeight} className="edit-record-form">
                          <input
                            type="number"
                            step="0.1"
                            value={editingWeight.weight}
                            onChange={(e) => setEditingWeight({
                              ...editingWeight,
                              weight: e.target.value
                            })}
                            required
                          />
                          <input
                            type="date"
                            value={editingWeight.date}
                            onChange={(e) => setEditingWeight({
                              ...editingWeight,
                              date: e.target.value
                            })}
                            required
                          />
                          <div className="edit-actions">
                            <button type="submit">Save</button>
                            <button 
                              type="button" 
                              className="delete-button"
                              onClick={() => handleDeleteWeight(weight._id)}
                            >
                              Delete
                            </button>
                            <button type="button" onClick={() => {
                              setEditingWeightId(null);
                              setEditingWeight({ weight: "", date: "" });
                            }}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <span className="record-date">
                            {new Date(weight.date).toISOString().slice(0, 10)}
                          </span>
                          <span className="record-value">{weight.weight} kg</span>
                          <button
                            className="edit-button"
                            onClick={() => {
                              setEditingWeightId(weight._id);
                              setEditingWeight({
                                weight: weight.weight,
                                date: new Date(weight.date).toISOString().split('T')[0]
                              });
                            }}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-records">No weight records available</p>
            )}
          </section>
  
          {/* Vaccination History Section */}
          <section className="vaccination-section">
            <h2>Vaccination Records</h2>
            <form onSubmit={handleAddVaccination} className="add-record-form">
              {/* Vaccine Name Row */}
              <div className="form-row">
                <label htmlFor="new-vaccine-name">Vaccine Name</label>
                <input
                  type="text"
                  id="new-vaccine-name"
                  value={newVaccine.vaccine}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, vaccine: e.target.value })
                  }
                  placeholder="Vaccine name"
                  required
                />
              </div>

              {/* Vaccination Date Row */}
              <div className="form-row">
                <label htmlFor="new-vaccine-date">Vaccination Date</label>
                <input
                  type="date"
                  id="new-vaccine-date"
                  value={newVaccine.date}
                  onChange={(e) =>
                    setNewVaccine({ ...newVaccine, date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Add Vaccination Button Row */}
              <div className="form-button-row">
                <button type="submit">Add Vaccination</button>
              </div>
            </form>

            {/* Vaccination Records */}
            <div className="records-list">
              {pet.vaccinationHistory && pet.vaccinationHistory.length > 0 ? (
                pet.vaccinationHistory
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((vacc) => (
                    <div key={vacc._id} className="record-item">
                      {editingVaccId === vacc._id ? (
                        <form onSubmit={handleUpdateVaccination} className="edit-record-form">
                          <input
                            type="text"
                            value={editingVacc.vaccine}
                            onChange={(e) =>
                              setEditingVacc({
                                ...editingVacc,
                                vaccine: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            type="date"
                            value={editingVacc.date}
                            onChange={(e) =>
                              setEditingVacc({
                                ...editingVacc,
                                date: e.target.value,
                              })
                            }
                            required
                          />
                          <div className="edit-actions">
                            <button type="submit">Save</button>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDeleteVaccination(vacc._id)}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVaccId(null);
                                setEditingVacc({ vaccine: "", date: "" });
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="vaccination-record">
                          <span className="record-date">
                            {new Date(vacc.date).toISOString().slice(0, 10)}
                          </span>
                          <span className="record-name">{vacc.vaccine}</span>
                          <button
                            className="edit-button"
                            onClick={() => {
                              setEditingVaccId(vacc._id);
                              setEditingVacc({
                                vaccine: vacc.vaccine,
                                date: new Date(vacc.date).toISOString().split("T")[0],
                              });
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
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
}

export default PetDetailsPage;