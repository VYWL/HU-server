CREATE USER 'hurryupadmin'@'%' IDENTIFIED BY '1234';
CREATE USER 'hurryupadmin'@'localhost' IDENTIFIED BY '1234';

GRANT ALL PRIVILEGES ON hurryupsedr.* to 'hurryupadmin'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON * . * TO 'hurryupadmin'@'%' IDENTIFIED BY '1234' WITH GRANT OPTION;
FLUSH PRIVILEGES;