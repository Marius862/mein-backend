require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Registrierung – mit Zusatzdaten
router.post('/signup', async (req, res) => {
  const { email, password, vorname, nachname, geburtsdatum } = req.body;

  // 1. Supabase Auth: Nutzer registrieren
  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) return res.status(400).send(signupError);

  const userId = signupData.user?.id;
  if (!userId) return res.status(500).send({ error: 'Kein User-ID erhalten' });

  // 2. Eigene users-Tabelle: Eintrag mit Zusatzdaten
  const { error: insertError } = await supabase.from('users').insert([
    {
      id: userId,
      rolle: 'kunde',
      kunde_id: null,
      vorname,
      nachname,
      geburtsdatum
    }
  ]);

  if (insertError) {
    console.error('Fehler beim Einfügen in users-Tabelle:', insertError);
    return res.status(500).send(insertError);
  }

  res.send(signupData);
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
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).send(authError);

  const userId = authData.user.id;

  // Zusatzdaten aus eigener Tabelle holen
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('vorname, nachname, geburtsdatum, rolle')
    .eq('id', userId)
    .single();

  if (userError) return res.status(500).send(userError);

  res.send({
    email: authData.user.email,
    ...userData
  });
});

module.exports = router;
