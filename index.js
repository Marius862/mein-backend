require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase verbinden
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Testroute
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});

// Beispielroute: Produkte abrufen
app.get('/produkte', async (req, res) => {
  const { data, error } = await supabase.from('produkte').select('*');
  if (error) return res.status(500).send(error);
  res.send(data);
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
