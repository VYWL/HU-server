#!/bin/bash
sudo docker-compose stop

sudo docker rm $(sudo docker ps -aq)
sudo rm -rf ./db/data

sudo docker-compose up --build -d

sleep 5

sh exec.sh

sudo docker-compose logs -f