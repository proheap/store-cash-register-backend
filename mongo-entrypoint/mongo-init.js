db.createUser({
  user: 'customer',
  pwd: 'secret',
  roles: [{ role: 'readWrite', db: 'admin' }],
});
