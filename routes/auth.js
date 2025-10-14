require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Registrierung
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).send(error);
  res.send(data);
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).send(error);
  res.send(data);
});

// Profil abrufen
router.get('/profil', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).send(error);
  res.send(data);
});

module.exports = router;
