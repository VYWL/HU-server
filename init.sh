#!/bin/bash
sudo docker rm $(sudo docker ps -aq)
sudo rm -rf ./db/data

sudo docker-compose up --build