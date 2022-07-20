#!/bin/bash

DB_HOST=$1
DB_PORT=$2
DB_NAME=$3
DB_USER=$4
DB_PASWORD=$5

echo "Starting replica set initialize"
until mongo --host $DB_HOST --port $DB_PORT --eval "print(\"Waited for connection\")"
do
    sleep 2
done
echo "Connection finished"
echo "Creating replica set"
mongosh --host $DB_HOST --port $DB_PORT <<EOF
rs.initiate(
  {
    _id : 'rs0',
    members: [
      { _id : 0, host : "$DB_HOST:$DB_PORT" }
    ]
  }
)
EOF
echo "Creating replica finished"