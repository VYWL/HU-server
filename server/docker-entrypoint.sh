echo "wait db server"
dockerize -wait tcp://db:3306 -timeout 10s

echo "start node server"
nodemon ./src/app.js