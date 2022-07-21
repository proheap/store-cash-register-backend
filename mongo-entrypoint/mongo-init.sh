#!/bin/bash

set -e

echo 'STARTING MONGODB IN BACKGROUND'
/usr/bin/mongod --bind_ip_all --replSet repset --fork --logpath /var/log/mongod.log
sleep 1
echo 'STARTING REPLICA SET INITIALIZE'
mongosh <<EOF
rs.initiate(
  {
    _id : 'repset',
    members: [
      { _id : 0, host : '$DB_HOST:$DB_PORT' }
    ]
  }
)
use $DB_NAME
db.createCollection('log')
db.createUser({
  user: '$DB_USER',
  pwd: '$DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$DB_NAME'
  }]
})
EOF
echo 'CREATING NEW DATABASE WITH USER'
mongosh <<EOF
use $DB_NAME
db.createCollection('log')
db.createUser({
  user: '$DB_USER',
  pwd: '$DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$DB_NAME'
  }]
})
EOF
echo 'RESTARTING MONGODB'
ps axf | grep /usr/bin/mongod | grep -v grep | awk '{print "kill -9 " $1}' | sh
/usr/bin/mongod --bind_ip_all --replSet repset