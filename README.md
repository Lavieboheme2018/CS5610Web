# Digital Pet Health Record Platform

## Group3
- **Team Members:** Wanyi Jiang, Sara Bavan, Kehan Yan
https://docs.google.com/document/d/1V2sQEH0qCQt1l59_vDzWt1inwqAcjk4ZrZDPBVrHl4U/edit?tab=t.0

DEMO 01
https://youtu.be/EEiAfHAMnSM 
---

## **1. Instructions to Set Up and Run the Project Locally**

### **Backend**
1. Clone the repository:
   ```bash
   git clone https://github.com/Lavieboheme2018/CS5610Web.git
   cd pet-health-hub-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables by creating a .env file in the backend directory with the following contents:
   ```bash
   MONGO_URI=mongodb+srv://cs5610final:cs5610final@cluster0.ojfdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_secret_key
   PORT=3001
   ```
   This .env file is already included in the repository.
   
4. Start the server:
   ```bash
   node server.js
   ```
   The backend will run at **`http://localhost:3001`** by default.

---

### **Frontend**
1. Navigate to the frontend directory:
   ```bash
   cd pet-health-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React application:
   ```bash
   npm start
   ```
   The frontend will run at **`http://localhost:3000`** by default.

---

## **2. Required Dependencies and Installation Commands**

### **Backend Dependencies**
- **Express.js** for server-side routing:
  ```bash
  npm install express
  ```
- **Mongoose** for database management:
  ```bash
  npm install mongoose
  ```
- **JWT** for authentication:
  ```bash
  npm install jsonwebtoken
  ```
- **Bcrypt** for password hashing:
  ```bash
  npm install bcrypt
  ```
- **Dotenv** for environment variable management:
  ```bash
  npm install dotenv
  ```
- **CORS** for cross-origin requests:
  ```bash
  npm install cors
  ```

### **Frontend Dependencies**
- **React Router DOM** for routing:
  ```bash
  npm install react-router-dom
  ```

---

## **3. Database Setup Instructions**

### **MongoDB Schema**
The application uses MongoDB to store user and pet data. Below are the schemas used:

#### **User Schema**
```json
{
  "email": "string (unique, required)",
  "password": "string (hashed, required)",
  "username": "String (optinal)",
  "createdAt": "Date (default: Date.now)"
}
```

#### **Pet Schema**
```json
{
  "name": "string (required)",
  "breed": "string (required)",
  "age": "number (required)",
  "weight": "number (required)",
  "owner": "ObjectId (referencing User, required)",
  "createdAt": "Date (default: Date.now)"
}
```

### **Sample Data**
You can use the following sample data for initial testing:

#### **User**
```json
{
  "email": "testuser1@example.com",
  "password": "password111"
}

{
  "email": "testuser2@example.com",
  "password": "password222"
}

```

#### **Pet**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 10,
  "owner": "ObjectId (corresponding to user)"
}
```

---

## Project Description

### Overview
The **Digital Pet Health Record Platform** is designed to help pet owners manage and track their pets’ health records in a centralized and accessible manner. This platform addresses the common challenges faced by pet owners in managing scattered health information across various sources, especially for those with multiple pets or dealing with multiple veterinarians.

### Problem Statement
Pet owners often face difficulties in tracking essential health information, such as:
- Vaccination schedules
- Vet visits
- Medication timelines

Disorganized records can lead to missed appointments, inconsistent care, and issues in accessing vital medical history when needed. Our platform provides a streamlined solution to simplify pet health management.

### Solution
This platform offers:
- Centralized storage for pet health data
- Individual pet profiles with detailed health records
- Timely reminders for appointments and medication
- Data visualization for easy health trend monitoring

---

## Key Features

- **Pet Profile Creation:** Create individual profiles for each pet with essential details like breed, age, weight, and health conditions.
- **Health Record Management:** Store and manage health data such as vaccinations, medications, and vet visits in a user-friendly timeline.
- **Appointment and Medication Reminders:** Set reminders to ensure timely care for each pet.
- **Data Visualization:** Visualize health trends (e.g., weight changes) through charts for better monitoring.
- **Multi-Pet Management:** Manage multiple pets within a single account.
- **Vet Information Integration:** Store and manage veterinarian details, including contact information and visit history.
- **Sharing Feature:** Securely share pet health data with caretakers and veterinarians.

---

## Key Wireframes

### Design Chart
[Lucid Design Chart](https://lucid.app/lucidspark/53f1fdd4-1a1c-495b-98d2-1200fe28e6ef/edit?viewport_loc=-1243%2C-1218%2C4813%2C2753%2C0_0&invitationId=inv_821dec6e-5c4e-4ce2-a01c-664d82fc1d51)

---

## Page Descriptions

### Home Page
**Purpose:** Introduces the platform’s purpose and highlights features to encourage users to start managing pet health records.

**Components:**
- **Welcome Section:** Banner with tagline ("All Your Pet's Health Record, In One Place") and Get Started button.
- **Feature Preview:** Screenshot placeholders for a visual introduction.
- **Example Section:** Sample pet profiles with health conditions, medications, and reminders.
- **Footer:** Navigation links and social media icons.

**Wireframe Description:** The page features a central banner with a CTA button, a quick overview of functionalities, and pet profile examples in a grid layout. The footer includes links and icons for user engagement.
<img width="892" alt="image" src="https://github.com/user-attachments/assets/4a869052-c852-4918-896a-7144fb57e875">

---

### Log In/Register Page
**Purpose:** Welcomes users to log in or register for easy access to pet health records.

**Components:**
- **Welcome Message:** "Welcome! Let’s get started."
- **Login/Sign Up Tabs:** Toggle between login and registration forms.
- **Input Fields:** Email and password fields for user authentication.
- **Log In Button:** CTA button to log in.
- **Pet Image Placeholder:** Visual placeholder for a pet image.

**Wireframe Description:** The layout includes the login form on the right and an image placeholder on the left, creating a balanced and welcoming entry point.
<img width="625" alt="image" src="https://github.com/user-attachments/assets/e8de47ad-e159-45f4-ba3a-53ced1f7342c">

---

### Profile Page
**Purpose:** Allows users to manage personal information and pet profiles, including health details and reminders.

**Components:**
- **User Profile Section:** Displays profile image, name, email, and password with update options.
- **Pet Profile Section:** Profile cards for each pet with their photo, health information, and recent updates.
- **Update and Add Reminder Buttons:** Enable updates and setting health reminders for each pet.

**Wireframe Description:** The page displays user profile at the top, followed by pet profiles in a grid. Each pet’s health details are shown with options to update or add reminders.

---

### Search/Search Result Page
**Purpose:** Enables users to view detailed health information for a selected pet.

**Components:**
- **Search Bar:** Dropdown to select a pet for detailed health view.
- **Pet Profile:** Basic information of the selected pet.
- **Health Conditions:** Current health conditions listed.
- **Medications:** Summary of medications and dosages.
- **Upcoming Reminders:** Reminders for vet visits, vaccinations, or medications.
- **Recent Vet Visits:** List of latest vet visits.

**Wireframe Description:** Organized sections provide quick access to all health information for the selected pet, prioritizing ease of navigation.

---

### Details Page
**Purpose:** Displays in-depth view of a pet’s health, including weight trends and vaccination history.

**Components:**
- **Pet Profile Image:** Profile image of the pet.
- **Health Conditions:** Section heading for health data.
- **Weight Trend:** Chart of weight changes over time.
- **Vaccination History:** Table of vaccinations, doses, and notes.

**Wireframe Description:** Structured layout with a clear presentation of health metrics, including charts and tables for easy interpretation of health progress and records.

---
