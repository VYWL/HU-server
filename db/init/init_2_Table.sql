CREATE TABLE IF NOT EXISTS `device_category` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '장비 카테고리 idx',
  `name` varchar(20) NOT NULL COMMENT '장비 카테고리 이름',
  `agent` BOOLEAN DEFAULT NULL COMMENT '에이전트 설치 여부',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `device_category_unique` (`name`,`agent`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COMMENT='장비 카테고리 테이블 (기본 데이터를 제공해주고, 새로운 카테고리에 대해서는 관리자가 추가할 수 있도록 함)';

CREATE TABLE IF NOT EXISTS `environment` (
  `idx` int(11) NOT NULL AUTO_INCREMENT COMMENT '장비 위치 idx',
  `name` varchar(20) DEFAULT NULL COMMENT '장비 위치 이름',
  UNIQUE KEY `environment_unique` (`name`) USING HASH,
  KEY `idx` (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COMMENT='장비 위치 테이블';

CREATE TABLE IF NOT EXISTS `network_category` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '네트워크 카테고리 idx',
  `name` varchar(20) DEFAULT NULL COMMENT '네트워크 카테고리 이름',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `network_category_unique` (`name`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COMMENT='네트워크 카테고리 테이블 (기본 데이터를 제공해주고, 새로운 카테고리에 대해서는 관리자가 추가할 수 있도록 함)';

CREATE TABLE IF NOT EXISTS `device` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text DEFAULT NULL COMMENT '장비 이름',
  `model_name` text DEFAULT NULL COMMENT '장비 모델명',
  `serial_number` varchar(88) DEFAULT NULL COMMENT '서버에서 생성된 시리얼 번호',
  `environment_idx` int(11) DEFAULT NULL COMMENT '장비 환경 위치',
  `device_category_idx` int(11) unsigned DEFAULT NULL COMMENT '장비 카테고리 idx',
  `network_category_idx` int(11) unsigned DEFAULT NULL COMMENT '장비 네트워크 카테고리 idx',
  `live` BOOLEAN NOT NULL DEFAULT b'0' COMMENT '장비 생존 여부',
  `socket` text DEFAULT NULL COMMENT '장비 통신 소켓 정보',
  `update_time` timestamp NULL DEFAULT '1970-01-01 00:00:01' COMMENT '장비 정보 업데이트 날짜',
  `network_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 네트워크 정보 모음' CHECK (json_valid(`network_info`)),
  `os_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 OS 정보 모음' CHECK (json_valid(`os_info`)),
  `service_list` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 서비스 리스트' CHECK (json_valid(`service_list`)),
  `connect_method` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '장비 연결 방법' CHECK (json_valid(`connect_method`)),
  PRIMARY KEY (`idx`),
  UNIQUE KEY `device_unique` (`serial_number`) USING HASH,
  KEY `device_category` (`device_category_idx`),
  KEY `network_category_idx` (`network_category_idx`),
  KEY `environment_idx` (`environment_idx`),
  CONSTRAINT `device_category` FOREIGN KEY (`device_category_idx`) REFERENCES `device_category` (`idx`)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `environment_idx` FOREIGN KEY (`environment_idx`) REFERENCES `environment` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `network_category_idx` FOREIGN KEY (`network_category_idx`) REFERENCES `network_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `security_category` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'security category idx',
  `main` text NOT NULL COMMENT '대분류',
  `sub` text NOT NULL COMMENT '중분류',
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COMMENT='보안카테고리 테이블';

CREATE TABLE IF NOT EXISTS `policy` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'policy idx',
  `classify` text DEFAULT NULL COMMENT '대응 정책 소분류',
  `name` text DEFAULT NULL COMMENT '대응 정책 이름',
  `description` text DEFAULT NULL COMMENT '대응 정책 설명',
  `isfile` BOOLEAN DEFAULT NULL COMMENT '대응 정책 파일 인지 판단하는 컬럼',
  `apply_content` text DEFAULT NULL COMMENT '대응 정책을 적용시킨 파일이나 스크립트 등',
  `release_content` text DEFAULT NULL COMMENT '대응 정책을 적용시킨 파일이나 스크립트 등',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT 'security_category_idx',
  `argument` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '대응 정책을 실행하는데 필요한 인자값 (사용자 정의 반영)' CHECK (json_valid(`argument`)),
  `command` text DEFAULT NULL COMMENT '대응 정책을 실행시키는 명령어',
  PRIMARY KEY (`idx`),
  KEY `policy_category` (`security_category_idx`),
  CONSTRAINT `policy_category` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=239 DEFAULT CHARSET=utf8mb4 COMMENT='정책 정보를 관리하는 테이블';

CREATE TABLE IF NOT EXISTS `module_category` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '모듈 카테고리 idx',
  `name` text NOT NULL COMMENT '모듈 카테고리 이름',
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COMMENT='모듈 카테고리 테이블 (기본 데이터를 제공해주고, 새로운 카테고리에 대해서는 관리자가 추가할 수 있도록 함)';

CREATE TABLE IF NOT EXISTS `device_policy` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'device policy idx',
  `policy_idx` int(11) unsigned DEFAULT NULL COMMENT '장비에 적용된 정책 idx',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '정책이 적용된 장비 idx',
  `activate` BOOLEAN DEFAULT b'0' COMMENT '정책 활성화 여부',
  `update_date` timestamp NULL DEFAULT '1970-01-01 00:00:01' COMMENT '적용 결과 갱신 시간',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `device_policy_unique` (`device_idx`,`policy_idx`),
  KEY `policy_idx` (`policy_idx`),
  KEY `device_idx` (`device_idx`),
  CONSTRAINT `policy_idx` FOREIGN KEY (`policy_idx`) REFERENCES `policy` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `device_idx` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COMMENT='장비에 적용된 정책을 보여주는 테이블';

CREATE TABLE IF NOT EXISTS `device_recommand` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'device recommand idx',
  `device_category_idx` int(11) unsigned DEFAULT NULL COMMENT '추천할 장비 카테고리 idx',
  `module_category_idx` int(11) unsigned DEFAULT NULL COMMENT '추천할 모듈 카테고리 idx',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT '추천할 보안 카테고리 idx',
  PRIMARY KEY (`idx`),
  KEY `device_category_idx` (`device_category_idx`),
  KEY `module_category_idx` (`module_category_idx`),
  KEY `security_category_idx` (`security_category_idx`),
  CONSTRAINT `device_category_idx` FOREIGN KEY (`device_category_idx`) REFERENCES `device_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `module_category_idx` FOREIGN KEY (`module_category_idx`) REFERENCES `module_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `security_category_idx` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COMMENT='장비에 추천하는 대응 정책 및 점검 항목 모읍집을 연결시켜주는 테이블';

CREATE TABLE IF NOT EXISTS `file_descriptor` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'file_descriptor idx',
  `pid` int(11) unsigned DEFAULT NULL COMMENT '프로세스의 pid',
  `name` text DEFAULT NULL COMMENT '파일 디스크립터 이름',
  `path` text DEFAULT NULL COMMENT '파일 디스크립터 가리키는 실제 파일 경로',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '파일 디스크립터가 존재하는 장비 idx',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '파일 디스크립터 정보 업데이트 시간',
  PRIMARY KEY (`idx`),
  KEY `fd_device` (`device_idx`),
  CONSTRAINT `fd_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12752 DEFAULT CHARSET=utf8mb4 COMMENT='프로세스가 사용하는 파일 디스크립터 목록을 보여주는 테이블';

CREATE TABLE IF NOT EXISTS `inspection` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'inspection idx',
  `name` text DEFAULT NULL COMMENT '점검 항목 모음집 이름',
  `description` text DEFAULT NULL COMMENT '점검 항목 모음집 설명',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '점검 항목 세부 단계' CHECK (json_valid(`content`)),
  `update_time` timestamp NULL DEFAULT NULL COMMENT '점검 항목 모음집 정보 갱신 시간',
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COMMENT='점검세부 단계 항목 묶음 테이블';

CREATE TABLE IF NOT EXISTS `inspection_log` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'inspection log idx',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '점검을 수행한 장비 idx',
  `inspection_idx` int(11) unsigned DEFAULT NULL COMMENT '점검모음집 idx',
  `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '단계별 점검 결과 (idx, time, success)' CHECK (json_valid(`result`)),
  `success` BOOLEAN DEFAULT NULL COMMENT '전체적인 성공 여부',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '수행 시간',
  PRIMARY KEY (`idx`),
  KEY `inspection_device` (`device_idx`),
  KEY `inspection_idx` (`inspection_idx`),
  CONSTRAINT `inspection_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_idx` FOREIGN KEY (`inspection_idx`) REFERENCES `inspection` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COMMENT='점검모음집 수행 로그';

CREATE TABLE IF NOT EXISTS `inspection_step` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'inspection step idx',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT 'security category idx',
  `name` text DEFAULT NULL COMMENT '점검항목 세부 단계 이름',
  `description` text DEFAULT NULL COMMENT '점검항목 세부 단계 설명',
  `isfile` BOOLEAN DEFAULT NULL COMMENT '파일 인지 아닌지 ',
  `content` text DEFAULT NULL COMMENT '점검항목을 수행하는데 필요한 데이터',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '점검항목 세부 단계 갱신 시간',
  `classify` text DEFAULT NULL COMMENT '점검항목 소분류',
  PRIMARY KEY (`idx`),
  KEY `inspection_security_category` (`security_category_idx`),
  CONSTRAINT `inspection_security_category` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=utf8mb4 COMMENT='점검 항목 단계 정보를 관리하는 테이블';

CREATE TABLE IF NOT EXISTS `module` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '모듈 idx',
  `device_idx` int(11) unsigned NOT NULL COMMENT '모듈이 속한 장비 idx',
  `module_category_idx` int(11) unsigned DEFAULT NULL COMMENT '모듈 카테고리 idx',
  `model_number` varchar(88) NOT NULL COMMENT '모듈 모델 번호',
  `serial_number` varchar(88) NOT NULL COMMENT '모듈 시리얼 번호',
  `network_category_idx` int(11) unsigned DEFAULT NULL COMMENT '모듈이 사용하는 네트워크 카테고리 idx',
  `mac` varchar(88) DEFAULT NULL COMMENT '모듈의 mac',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '모듈 업데이트 시간',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `moduel_unique` (`model_number`,`serial_number`,`mac`) USING HASH,
  KEY `device_module` (`device_idx`),
  KEY `module_category` (`module_category_idx`),
  KEY `network_category` (`network_category_idx`),
  CONSTRAINT `device_module` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `module_category` FOREIGN KEY (`module_category_idx`) REFERENCES `module_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `network_category` FOREIGN KEY (`network_category_idx`) REFERENCES `network_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=401 DEFAULT CHARSET=utf8mb4 COMMENT='모듈을 정보를 담고 있는 테이블';

CREATE TABLE IF NOT EXISTS `log` (
  `idx` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '로그 테이블 idx',
  `event_code` text DEFAULT NULL COMMENT '로그 이벤트 코드',
  `description` text DEFAULT NULL COMMENT '로그 설명',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '로그 발생한 장비 idx',
  `module_idx` int(11) unsigned DEFAULT NULL COMMENT '로그 발생한 모듈 idx',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '로그 발생 시간',
  `environment` text DEFAULT NULL COMMENT '로그가 발생한 환경 ',
  `status` text DEFAULT NULL COMMENT '로그 정보',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT '보안 카테고리 idx',
  `layer` text DEFAULT NULL COMMENT '발생한 계층 (네트워크 단인지, 장비 단인지)',
  `original_log` longtext DEFAULT NULL COMMENT '원본 로그',
  `log_path` varchar(88) DEFAULT NULL COMMENT '로그 정보 출처',
  PRIMARY KEY (`idx`),
  KEY `log_device` (`device_idx`),
  KEY `log_module` (`module_idx`),
  KEY `log_security_category` (`security_category_idx`),
  CONSTRAINT `log_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `log_module` FOREIGN KEY (`module_idx`) REFERENCES `module` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `log_security_category` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5611 DEFAULT CHARSET=utf8mb4 COMMENT='로그테이블';

CREATE TABLE IF NOT EXISTS `module_model_category` (
  `module_category_idx` int(11) unsigned NOT NULL COMMENT '모듈 카테고리 idx',
  `model_number` text NOT NULL COMMENT '모듈 카테고리에 속하는 모델 번호',
  KEY `module_category_model` (`module_category_idx`),
  CONSTRAINT `module_category_model` FOREIGN KEY (`module_category_idx`) REFERENCES `module_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='모듈 모델이 속하는 카테고리를 알려주는 테이블\r\n(GY-906) => 온도 센서';

CREATE TABLE IF NOT EXISTS `monitoring` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Monitoring Tabel Idx',
  `process_name` varchar(88) DEFAULT NULL COMMENT '프로세스 이름',
  `log_path` varchar(88) DEFAULT NULL COMMENT '프로세스에서 감시할 로그 파일',
  `activate` BOOLEAN DEFAULT NULL COMMENT '모니터링 활성화 여부',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '모니터링 하는 장비 idx',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '모니터링 정보 업데이트 시간',
  `log_regex` text NULL DEFAULT NULL COMMENT '모니터링 로그 정규식',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `monitoring_unique` (`process_name`,`log_path`,`device_idx`) USING HASH,
  KEY `monitoring_device` (`device_idx`),
  CONSTRAINT `monitoring_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COMMENT='모니터링 대상을 관리하는 테이블';

CREATE TABLE IF NOT EXISTS `process` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Process Tabel idx',
  `pid` int(11) unsigned DEFAULT NULL COMMENT '프로세스 PID',
  `ppid` int(11) unsigned DEFAULT NULL COMMENT '부모 프로세스 PID',
  `name` text DEFAULT NULL COMMENT '프로세스 명',
  `state` text DEFAULT NULL COMMENT '프로세스 상태',
  `command` text DEFAULT NULL COMMENT '프로세스 실행 명령어',
  `start_time` text DEFAULT NULL COMMENT '프로세스 시작 시간',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '프로세스 정보 업데이트 시간',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '프로세스를 실행한 장비 idx',
  PRIMARY KEY (`idx`),
  KEY `process_device` (`device_idx`),
  CONSTRAINT `process_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4447 DEFAULT CHARSET=utf8mb4 COMMENT='장비가 실행하고 있는 프로세스 목록을 알려주는 테이블';

CREATE TABLE IF NOT EXISTS `policy_custom` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '사용자 정의 정책 테이블 INDEX',
  `policy_idx` int(11) unsigned DEFAULT NULL COMMENT '적용한 정책 idx',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT '보안 카테고리 idx',
  `device_idx` int(11) unsigned DEFAULT NULL COMMENT '정책이 적용된 장치의 idx',
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '적용한 정책에 대한 argument',
  `activate` BOOLEAN DEFAULT NULL COMMENT '정책 활성화 여부',
  PRIMARY KEY (`idx`),
  KEY `custom_device` (`device_idx`),
  KEY `custom_policy` (`policy_idx`),
  CONSTRAINT `custom_policy` FOREIGN KEY (`policy_idx`) REFERENCES `policy` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `custom_device` FOREIGN KEY (`device_idx`) REFERENCES `device` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COMMENT='현재 적용된 정책을 저장하는 테이블';

CREATE TABLE IF NOT EXISTS `inspection` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Inspection 고유 id',
  `policy_idx` int(11) unsigned DEFAULT NULL COMMENT '관련 정책 idx',
  `security_category_idx` int(11) unsigned DEFAULT NULL COMMENT '관련 보안 카테고리 idx',
  `name` text DEFAULT NULL COMMENT 'task 이름',
  `target` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '적용 기기 목록',
  `inspection_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '인자값 목록',
  `related_file` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '관련 점검 파일',
  PRIMARY KEY (`idx`),
  KEY `inspection_policy` (`policy_idx`),
  KEY `inspection_security_category` (`security_category_idx`),
  CONSTRAINT `inspection_policy` FOREIGN KEY (`policy_idx`) REFERENCES `policy` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_security_category` FOREIGN KEY (`security_category_idx`) REFERENCES `security_category` (`idx`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COMMENT='점검 정보를 담는 테이블';

CREATE TABLE IF NOT EXISTS `inspection_log` (
  `idx` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ticket 고유 id',
  `name` text DEFAULT NULL COMMENT 'task 이름',
  `timestamp` timestamp NULL DEFAULT NULL COMMENT 'task 정보 업데이트 시간',
  `status` text DEFAULT NULL COMMENT `task 상태`,
  `total_level` int(11) unsigned DEFAULT NULL COMMENT '전체 level 개수',
  `now_level` int(11) unsigned DEFAULT NULL COMMENT '현재 level',
  `process_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'task 단계별 상황',
  PRIMARY KEY (`idx`)  
) ENGINE=InnoDB CHARSET=utf8mb4 COMMENT='점검 로그를 담는 테이블';