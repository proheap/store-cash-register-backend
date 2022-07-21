#!/bin/bash

set -e
echo "STARTING MONGODB IN BACKGROUND"
/usr/bin/mongod --bind_ip_all --fork --logpath /var/log/mongod.log
sleep 1
echo "INITIALIZATION MONGO DB"
mongosh <<EOF
use $DB_NAME
db.createUser({
  user: '$DB_USER',
  pwd: '$DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$DB_NAME'
  }]
})
db.createCollection('log');
EOF
echo "RESTARTING MONGODB"
ps axf | grep /usr/bin/mongod | grep -v grep | awk '{print "kill -9 " $1}' | sh
/usr/bin/mongod --bind_ip_all
