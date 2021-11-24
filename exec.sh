sudo docker exec $(sudo docker ps -f "name=hu-server_db_1" -q) mysql -u root -p1234 hurryupsedr < ./db/init/init_2_Table.sql
sudo docker exec $(sudo docker ps -f "name=hu-server_db_1" -q) mysql -u root -p1234 hurryupsedr < ./db/init/init_3_Data.sql
#mysql -u root -p1234 hurryupsedr < /docker-entrypoint-initdb.d/init_2_Table.sql
#mysql -u root -p1234 hurryupsedr < /docker-entrypoint-initdb.d/init_3_Data.sql