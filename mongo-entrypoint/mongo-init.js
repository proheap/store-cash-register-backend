db = new Mongo().getDB('customerDB');
db.createUser({
  user: 'customer',
  pwd: 'secret',
  roles: [{ role: 'readWrite', db: 'customerDB' }],
});
