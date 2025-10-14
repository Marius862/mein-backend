require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Kein Token übergeben' });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).send({ error: 'Nicht eingeloggt' });

  req.user = authData.user;
  next();
}

async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Kein Token übergeben' });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).send({ error: 'Nicht eingeloggt' });

  const userId = authData.user.id;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('rolle')
    .eq('id', userId)
    .single();

  if (userError || userData?.rolle !== 'admin') {
    return res.status(403).send({ error: 'Nur Admins erlaubt' });
  }

  req.user = authData.user;
  next();
}

module.exports = { requireAuth, requireAdmin };
