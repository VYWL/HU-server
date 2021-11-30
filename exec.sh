sudo docker exec $(sudo docker ps -f "name=hu-server_db_1" -q) sh init.sh
