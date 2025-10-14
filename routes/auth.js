require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Registrierung mit Username
router.post('/signup', async (req, res) => {
  const { email, password, username, vorname, nachname, geburtsdatum } = req.body;

  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) return res.status(400).send(signupError);

  const userId = signupData.user?.id;
  if (!userId) return res.status(500).send({ error: 'Kein User-ID erhalten' });

  const { error: insertError } = await supabase.from('users').insert([
    {
      id: userId,
      username,
      vorname,
      nachname,
      geburtsdatum
      // rolle wird manuell gesetzt
    }
  ]);

  if (insertError) return res.status(500).send(insertError);

  res.send(signupData);
});

// Login mit E-Mail oder Username
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  let email = identifier;

  // Wenn kein @ enthalten ist → vermutlich Username
  if (!identifier.includes('@')) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', identifier)
      .single();

    if (userError || !userData?.email) {
      return res.status(400).send({ error: 'Username nicht gefunden' });
    }

    email = userData.email;
  }

  // ✅ WICHTIG: Validierung hinzufügen
  if (!email || !password) {
    return res.status(400).send({ error: 'Email und Passwort erforderlich' });
  }

  // ✅ Supabase erwartet email + password
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login-Fehler:', error);
    return res.status(401).send(error);
  }

  res.send(data);
});


// Profil abrufen
router.get('/profil', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).send(authError);

  const userId = authData.user.id;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username, vorname, nachname, geburtsdatum, rolle')
    .eq('id', userId)
    .single();

  if (userError) return res.status(500).send(userError);

  res.send({
    email: authData.user.email,
    ...userData
  });
});

module.exports = router;
