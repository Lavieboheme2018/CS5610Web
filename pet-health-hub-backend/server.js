const app = require('./app'); // Import the app
const dotenv = require('dotenv');

dotenv.config();

// Server Port Configuration
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
