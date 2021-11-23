CREATE USER 'hurryupadmin'@'%' IDENTIFIED WITH mysql_native_password BY '1234';
CREATE USER 'hurryupadmin'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';

GRANT ALL PRIVILEGES ON hurryupsedr.* to 'hurryupadmin'@'localhost';
GRANT ALL PRIVILEGES ON * . * TO 'hurryupadmin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE TABLE device (
  idx BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  deviceName text DEFAULT NULL COMMENT '장비 이름',
  modelName text DEFAULT NULL COMMENT '장비 모델명',
  serial_number varchar(88) DEFAULT NULL COMMENT '서버에서 생성된 시리얼 번호',
  environment_idx int(11) DEFAULT NULL COMMENT '장비 환경 위치',
  device_category_idx int(11) unsigned DEFAULT NULL COMMENT '장비 카테고리 idx',
  network_category_idx int(11) unsigned DEFAULT NULL COMMENT '장비 네트워크 카테고리 idx',
  live bit(1) NOT NULL DEFAULT b'0' COMMENT '장비 생존 여부',
  socket int(11) unsigned DEFAULT 0 COMMENT '장비 통신 소켓 정보',
  update_time timestamp NULL DEFAULT '1970-01-01 00:00:01' COMMENT '장비 정보 업데이트 날짜',
  network_info longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 네트워크 정보 모음' CHECK (json_valid(`network_info`)),
  os_info longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 OS 정보 모음' CHECK (json_valid(`os_info`)),
  service_list longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 서비스 리스트' CHECK (json_valid(`service_list`)),
  connect_method longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 연결 방법' CHECK (json_valid(`connect_method`)),
  UNIQUE KEY `device_unique` (`serial_number`) USING HASH,
  KEY `device_category` (`device_category_idx`),
  KEY `network_category_idx` (`network_category_idx`),
  KEY `environment_idx` (`environment_idx`),
);

