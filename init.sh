#!/bin/bash
sudo docker-compose stop

clear

sudo docker rm $(sudo docker ps -aq)
sudo rm -rf ./db/data

sudo docker-compose up --build -d

clear

sleep 5

sudo docker exec $(sudo docker ps -f "name=hu-server_db_1" -q) sh init.sh

sudo docker-compose logs -f