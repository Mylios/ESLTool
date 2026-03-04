#!/bin/sh

# Start Spring Boot in background
java -jar target/*.jar &

# Start Node server (must use process.env.PORT)
cd site
npm start