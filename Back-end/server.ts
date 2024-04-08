import express from 'express';
import path from 'path';

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../Front-end/dist')));

// Catchall handler to serve index.html for any unknown requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front-end/dist/index.html'));
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

