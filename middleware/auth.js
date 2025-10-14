require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase verbinden
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware-Funktion
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: 'Kein Token übergeben' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).send({ error: 'Nicht eingeloggt oder Token ungültig' });
  }

  // Optional: User-Objekt an die Anfrage hängen
  req.user = data.user;
  next();
}

module.exports = requireAuth;
