import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [updatedValue, setUpdatedValue] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [petImages, setPetImages] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    breed: "",
    age: ""
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch pet image function
  const fetchPetImage = async (petId, filename) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3001/api/pets/image/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPetImages(prev => ({
          ...prev,
          [petId]: imageUrl
        }));
      }
    } catch (error) {
      console.error(`Error fetching pet image for pet ${petId}:`, error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await response.json();
        setUser(userData);
        
        if (userData.profileImage && userData.profileImage.filename) {
          try {
            const imageResponse = await fetch(
              `http://localhost:3001/api/users/image/${userData.profileImage.filename}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              setProfileImage(URL.createObjectURL(imageBlob));
            }
          } catch (imageError) {
            console.error("Error fetching profile image:", imageError);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchUserPets = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/pets/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }

        const petsData = await response.json();
        setPets(petsData);

        // Fetch images for all pets that have profile images
        for (const pet of petsData) {
          if (pet.profileImage && pet.profileImage.filename) {
            fetchPetImage(pet._id, pet.profileImage.filename);
          }
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchUserProfile();
    fetchUserPets();

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(petImages).forEach(URL.revokeObjectURL);
      if (profileImage) URL.revokeObjectURL(profileImage);
    };
  }, [navigate]);

  const handleUpdateProfile = async (field) => {
    const token = localStorage.getItem("token");
    try {
      const body = { [field]: updatedValue };

      const response = await fetch("http://localhost:3001/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setUser((prevUser) => ({ ...prevUser, [field]: updatedValue }));
      setEditingField(null);
      setUpdatedValue("");
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update ${field}`);
    }
  };

  const handleProfileImageUpload = async (event) => {
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
      const response = await fetch('http://localhost:3001/api/users/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }

      const result = await response.json();
      
      const imageResponse = await fetch(
        `http://localhost:3001/api/users/image/${result.filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        if (profileImage) {
          URL.revokeObjectURL(profileImage);
        }
        setProfileImage(URL.createObjectURL(imageBlob));
        
        setUser(prevUser => ({
          ...prevUser,
          profileImage: {
            filename: result.filename
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewPet = (petId) => {
    navigate(`/details/${petId}`);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch("http://localhost:3001/api/pets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPet),
      });

      if (!response.ok) {
        throw new Error("Failed to add pet");
      }

      const addedPet = await response.json();
      setPets([...pets, addedPet]);
      setNewPet({ name: "", breed: "", age: "" });
      setIsAddPetModalOpen(false);
      alert("Pet added successfully!");
    } catch (error) {
      console.error("Error adding pet:", error);
      alert("Failed to add pet");
    }
  };

  const handlePetInputChange = (e) => {
    const { name, value } = e.target;
    setNewPet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Header />
      {isAddPetModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            setIsAddPetModalOpen(false);
          }
        }}>
          <div className="modal-content">
            <h2>Add New Pet</h2>
            <form onSubmit={handleAddPet} className="add-pet-form">
              <div className="form-group">
                <label htmlFor="name">Pet Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newPet.name}
                  onChange={handlePetInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="breed">Breed:</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={newPet.breed}
                  onChange={handlePetInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age (years):</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={newPet.age}
                  onChange={handlePetInputChange}
                  required
                  min="0"
                  step="1"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Add Pet
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsAddPetModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="profile-content">
        <section className="user-profile">
          <h2>User Profile</h2>
          <div className="user-details">
            <div className="user-avatar">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfileImageUpload}
              />
              {profileImage ? (
                <div 
                  className="avatar-container"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img src={profileImage} alt="Profile" />
                  {!isUploading && (
                    <div className="edit-overlay">
                      <span>Update Photo</span>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="avatar-placeholder" 
                  onClick={() => fileInputRef.current.click()}
                >
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                  <div className="upload-overlay">Click to upload</div>
                </div>
              )}
              {isUploading && <div className="loading-spinner" />}
            </div>

            <div className="user-info">
              <p>
                <strong>Username:</strong> {user.username || "N/A"}
                <button onClick={() => setEditingField("username")}>Edit</button>
              </p>
              {editingField === "username" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile("username");
                  }}
                >
                  <input
                    type="text"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new username"
                    required
                  />
                  <button type="submit">Save</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingField(null);
                      setUpdatedValue("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}

              <p>
                <strong>Email:</strong> {user.email}
                <button onClick={() => setEditingField("email")}>Edit</button>
              </p>
              {editingField === "email" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile("email");
                  }}
                >
                  <input
                    type="email"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new email"
                    required
                  />
                  <button type="submit">Save</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingField(null);
                      setUpdatedValue("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}

              <p>
                <strong>Password:</strong> ********
                <button onClick={() => setEditingField("password")}>Change</button>
              </p>
              {editingField === "password" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile("password");
                  }}
                >
                  <input
                    type="password"
                    value={updatedValue}
                    onChange={(e) => setUpdatedValue(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="submit">Save</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingField(null);
                      setUpdatedValue("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="pets-profile">
          <div className="pets-header">
            <h2>My Pets</h2>
            <button 
              className="add-pet-button"
              onClick={() => setIsAddPetModalOpen(true)}
            >
              Add New Pet
            </button>
          </div>
          <div className="pets-list">
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-avatar">
                  {petImages[pet._id] ? (
                    <img 
                      src={petImages[pet._id]}
                      alt={pet.name}
                    />
                  ) : (
                    <div className="pet-avatar-placeholder">
                      {pet.name ? pet.name[0].toUpperCase() : 'P'}
                    </div>
                  )}
                </div>
                <h3>{pet.name}</h3>
                <p><strong>Breed:</strong> {pet.breed}</p>
                <p><strong>Age:</strong> {pet.age} years</p>
                <button onClick={() => handleViewPet(pet._id)}>View Details</button>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;