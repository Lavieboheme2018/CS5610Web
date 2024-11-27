const app = require('./app'); // Import the app
const dotenv = require('dotenv');
const petServiceRoutes = require('./routes/petServiceRoutes'); //Import route 

dotenv.config(); 

// Use the petService routes
app.use('/api', petServiceRoutes);

// Server Port Configuration
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
