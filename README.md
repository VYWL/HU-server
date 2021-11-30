# 스마트 환경에서의 이상행위와 사이버 공격에 대한 모니터링 및 대응 솔루션 제작 (Server)

스마트 환경 탐지 / 조치 및 모니터링 솔루션을 위한 백엔드 서버 👁

## 구성 언어 및 라이브러리와 런타임

-   Javascript
-   Express
-   Node.js

## 주의 사항
-   서버에서 DB를 처음 생성할때, CREATE TABLE 및 Dummy Data 삽입은 수동으로 해야함.

```sh
# sh init.sh 으로 컨테이너를 생성한 상황이라면
$ sh exec.sh
# 위 명령어만 실행하면 된다.
```

## 설치 방법

### 우선 git Clone

```sh
$ git clone https://github.com/VYWL/HU-server.git
$ cd HU-server
```

## 진행 사항

-   [x] 개발 디렉토리 및 Git Repo 커밋.
-   [x] express를 활용하여 API 통신 테스트
-   [x] NodeJS 내장 라이브러리인 net을 활용하여 에이전트(클라이언트)와 통신 테스트
-   [x] DB 활성화 (설치 및 연동 + migration)
-   [x] DB Connect
-   [x] API 등록 및 유닛 테스트
-   [x] API 연동 테스트
-   [ ] 기타 등등

## 기타 사항

-   서버 담당 : 표지원에게 연락 (010-2221-7086)
