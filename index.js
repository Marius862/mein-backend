require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routen einbinden
const produkteRouter = require('./routes/produkte');
app.use('/produkte', produkteRouter);

// Testroute
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
