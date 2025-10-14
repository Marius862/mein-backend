require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { requireAdmin } = require('../middleware/auth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔍 Alle Nutzer anzeigen (nur Admin)
router.get('/users', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('users').select('id, email, rolle, vorname, nachname, geburtsdatum');
  if (error) return res.status(500).send(error);
  res.send(data);
});

// ✏️ Produkt bearbeiten
router.put('/produkte/:id', requireAdmin, async (req, res) => {
  const produktId = req.params.id;
  const updateFields = req.body;

  const { data, error } = await supabase
    .from('produkte')
    .update(updateFields)
    .eq('id', produktId);

  if (error) return res.status(500).send(error);
  res.send(data);
});

// ❌ Produkt löschen
router.delete('/produkte/:id', requireAdmin, async (req, res) => {
  const produktId = req.params.id;

  const { data, error } = await supabase
    .from('produkte')
    .delete()
    .eq('id', produktId);

  if (error) return res.status(500).send(error);
  res.send(data);
});

module.exports = router;
