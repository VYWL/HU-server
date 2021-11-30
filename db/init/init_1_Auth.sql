CREATE USER 'hurryupadmin'@'%' IDENTIFIED BY '1234';
CREATE USER 'hurryupadmin'@'localhost' IDENTIFIED BY '1234';

GRANT ALL PRIVILEGES ON hurryupsedr.* to 'hurryupadmin'@'localhost';
GRANT ALL PRIVILEGES ON * . * TO 'hurryupadmin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;