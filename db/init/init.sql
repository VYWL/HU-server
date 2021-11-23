CREATE DATABASE hurryupsedr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hurryupsedr;

CREATE TABLE Device (
  idx int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '장비 idx',
  name text DEFAULT NULL COMMENT '장비 이름',
  model_name text DEFAULT NULL COMMENT '장비 모델명',
  serial_number text DEFAULT NULL COMMENT '서버에서 생성된 시리얼 번호',
  environment_idx int(11) DEFAULT NULL COMMENT '장비 환경 위치',
  device_category_idx int(11) unsigned DEFAULT NULL COMMENT '장비 카테고리 idx',
  network_category_idx int(11) unsigned DEFAULT NULL COMMENT '장비 네트워크 카테고리 idx',
  live bit(1) NOT NULL DEFAULT b'0' COMMENT '장비 생존 여부',
  socket int(11) unsigned DEFAULT 0 COMMENT '장비 통신 소켓 정보',
  update_time timestamp NULL DEFAULT '0000-00-00 00:00:00' COMMENT '장비 정보 업데이트 날짜',
  network_info longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 네트워크 정보 모음' CHECK (json_valid(`network_info`)),
  os_info longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 OS 정보 모음' CHECK (json_valid(`os_info`)),
  service_list longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 서비스 리스트' CHECK (json_valid(`service_list`)),
  connect_method longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 연결 방법' CHECK (json_valid(`connect_method`)),
  PRIMARY KEY (`idx`),
  UNIQUE KEY `device_unique` (`serial_number`) USING HASH,
  KEY `device_category` (`device_category_idx`),
  KEY `network_category_idx` (`network_category_idx`),
  KEY `environment_idx` (`environment_idx`),
  CONSTRAINT `device_category` FOREIGN KEY (`device_category_idx`) REFERENCES `device_category` (`idx`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `device_environment` FOREIGN KEY (`environment_idx`) REFERENCES `environment` (`idx`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `device_network_category` FOREIGN KEY (`network_category_idx`) REFERENCES `network_category` (`idx`) ON DELETE NO ACTION ON UPDATE NO ACTION
);