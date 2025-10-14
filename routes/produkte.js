require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Alle Produkte abrufen
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('produkte').select('*');
  if (error) return res.status(500).send(error);
  res.send(data);
});

// Neues Produkt anlegen
router.post('/', async (req, res) => {
  const { name, beschreibung, preis, bild_url, lagerbestand, kunde_id } = req.body;
  const { data, error } = await supabase.from('produkte').insert([
    { name, beschreibung, preis, bild_url, lagerbestand, kunde_id }
  ]);
  if (error) return res.status(500).send(error);
  res.send(data);
});

module.exports = router;