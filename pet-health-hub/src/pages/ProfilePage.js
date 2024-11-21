import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [editingField, setEditingField] = useState(null); // 'email', 'password', or 'username'
  const [updatedValue, setUpdatedValue] = useState("");
  const navigate = useNavigate();

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
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };

    fetchUserProfile();
    fetchUserPets();
  }, [navigate]);

  const handleUpdateProfile = async (field) => {
    const token = localStorage.getItem("token");
    try {
      const body = { [field]: updatedValue }; // Dynamically set the field being updated

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
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content">
        {/* User Profile Section */}
        <section className="user-profile">
          <h2>User Profile</h2>
          <div className="user-details">
            <div className="user-avatar">
              <div className="avatar-placeholder"></div>
            </div>
            <div className="user-info">
              {/* Username */}
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
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}

              {/* Email */}
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
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}

              {/* Password */}
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
                  <button type="button" onClick={() => setEditingField(null)}>
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Pets Profile Section */}
        <section className="pets-profile">
          <h2>Pets Profile</h2>
          <div className="pets-list">
            {pets.map((pet) => (
              <div key={pet._id} className="pet-card">
                <div className="pet-avatar">
                  <div className="avatar-placeholder"></div>
                </div>
                <h3>{pet.name}</h3>
                <p>
                  <strong>Breed:</strong> {pet.breed}
                </p>
                <p>
                  <strong>Age:</strong> {pet.age} years
                </p>
                <button>View</button>
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