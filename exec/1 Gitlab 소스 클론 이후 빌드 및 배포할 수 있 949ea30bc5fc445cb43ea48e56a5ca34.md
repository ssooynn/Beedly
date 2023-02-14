# 1. Gitlab 소스 클론 이후 빌드 및 배포할 수 있도록 정리한 문서

# 배포 환경 설정

---

## 서버

- AWS EC2(ubuntu 20.04 LTS)

## Docker 설치

- Docker version 20.10.17

### 1. 오래된 버전 삭제

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

### 2. apt update 및 repository 설정

```bash
sudo apt-get update

sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 3. Docker의 Official GPG Key 등록

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 4. stable repository  등록

```bash
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5. Docker Engine 설치

```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### 6. 설치 후 버전 확인

```bash
docker --version
```

## MySQL 설치 과정

### 1. MySQL APT Repository 추가 및 패키지 다운로드

```bash
sudo wget https://dev.mysql.com/get/mysql-apt-config_0.8.13-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.13-1_all.deb
```

### 2. MySQL-Server 설치

```bash
sudo apt-get update
sudo apt-get install mysql-server
```

### 3. Mysql 외부 원격 접속 설정

- /etc/mysql/mysql.conf.d/mysqld.cnf 파일 수정
- bind-address 127.0.0.1을 0.0.0.0으로 수정

### 4. MySQL 접속 계정

```
user: ssafy
password: yfass1234
```

## Redis 설치 과정

도커를 이용하여 Redis 이미지를 받아와 컨테이너 실행

```bash
docker pull redis
docker run -d -p 6379:6379 --name myredis redis
```

## Nginx & SSL 적용

### 1. Nginx 설치

```bash
sudo apt-get update
sudo apt install nginx
```

### 2. Certbot

- letsencrypt의 형태로 SSL/TLS 인증서를 무료로 제공하는 라이브러리

Certbot 설치 후 인증서 발급

```bash
sudo add-apt-repository ppa:certbot/certbot 

sudo apt-get update # 해당 저장소에 담긴 패키지 정보를 확인할 수 있도록 업데이트

sudo apt-get install python3-certbot-nginx # certbot 설치

# 설치된 certvot을 이용하여 도메인(example.com)에 대한 SSL 인증서 발급 
sudo certbot certonly --nginx -d i7a601.p.ssafy.io 

# 다음 경로에 5개의 파일(4개의 .pem, 1개의 readme) 생성 확인 
sudo ls -al /etc/letsencrypt/live/i7a601.p.ssafy.io

# 90일마다 만료되는 인증서 자동 갱신 
sudo certbot renew --dry-run
```

### 3. Nginx 설정 파일 수정

- /etc/nginx/sites-available 밑에 test.conf 설정파일 만들기
    
    ```bash
    server {
      listen 80; #80포트로 받을 때
      server_name i7a601.p.ssafy.io www.i7a601.p.ssafy.io; #도메인주소, 없을경우 localhost
      return 301 https://i7a601.p.ssafy.io$request_uri;
    
    }
    server {
      listen 443 ssl;
      server_name i7a601.p.ssafy.io www.i7a601.p.ssafy.io;
    
      # ssl 인증서 적용하기
      ssl_certificate /etc/letsencrypt/live/i7a601.p.ssafy.io/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/i7a601.p.ssafy.io/privkey.pem;
      
    	location / { # 프론트엔드
    		proxy_pass http://localhost:3000;
    	}
    
      location /api { # 백엔드
        proxy_pass http://localhost:8080;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr; 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto $scheme; # https 필요
    
        # 웹 소켓 설정
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
      }
    }
    ```
    
- sites-enabled에 심볼릭 링크 설정 및 재시작
    
    ```bash
    sudo ln -s /etc/nginx/sites-available/test.conf /etc/nginx/sites-enabled
    sudo service nginx restart # nginx 재시작
    ```
    

# 백엔드 배포 과정

---

## 1. 개발 환경

### IDE

- InteliJ 2022.1.3

### JVM, JDK 버전

- openjdk version 1.8.0_192
    
    OpenJDK Runtime Environment (Zulu 8.33.0.1-win64) (build 1.8.0_192-b01)
    OpenJDK 64-Bit Server VM (Zulu 8.33.0.1-win64) (build 25.192-b01, mixed mode)
    

### 배포 라이브러리 버전

- Gradle 7.4.1

## 2. 배포

### build.gradle

```
plugins {
    id 'org.springframework.boot' version '2.7.1'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
}

ext {
    set('snippetsDir', file("build/generated-snippets"))
    queryDslVersion = "5.0.0"
}

group = 'com.ssafy.beedly'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '1.8'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-websocket'

    implementation group: 'io.jsonwebtoken', name: 'jjwt', version: '0.9.1'
    implementation group: 'javax.xml.bind', name: 'jaxb-api', version: '2.3.1'

    implementation "com.querydsl:querydsl-jpa:${queryDslVersion}"
    implementation "com.querydsl:querydsl-apt:${queryDslVersion}"

    // aws s3
    implementation group: 'org.springframework.cloud', name: 'spring-cloud-starter-aws', version: '2.2.1.RELEASE'

    compileOnly 'org.projectlombok:lombok'
    testCompileOnly 'org.projectlombok:lombok'

    testRuntimeOnly 'com.h2database:h2'
    runtimeOnly 'mysql:mysql-connector-java'

    annotationProcessor 'org.projectlombok:lombok'
    testAnnotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'

    // swagger
    implementation 'io.springfox:springfox-boot-starter:3.0.0'
    implementation 'io.springfox:springfox-swagger-ui:3.0.0'

    // gson
    implementation 'com.google.code.gson:gson:2.8.7'

    // redis
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    // https://mvnrepository.com/artifact/org.assertj/assertj-core
    testImplementation group: 'org.assertj', name: 'assertj-core', version: '3.22.0'
}

tasks.named('test') {
    useJUnitPlatform()
}

def querydslDir = "$buildDir/generated/querydsl"

querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}

sourceSets {
    main.java.srcDir querydslDir
}

configurations {
    querydsl.extendsFrom compileClasspath
}

compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
```

### application.yml 파일

```yaml
server:
  servlet:
    context-path: /api

spring:
  cache:
    type: redis
  redis:
    # 로컬 환경
#    host: localhost
    # 도커 환경
    host: 172.17.0.3 # redis가 실행되고 있는 컨테이너의 ip 주소

    port: 6379
  
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 100MB
  # swagger 설정
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher

  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    # 로컬 환경
#    url: jdbc:mysql://localhost:3306/<DB이름>?useSSL=false&useUnicode=true&autoReconnect=true&characterEncoding=utf8&allowMultiQueries=true&serverTimezone=UTC
#    username: <mysql 사용자이름>
#    password: <mysql 비밀번호>

    # 로컬에서 ec2 DB로 연결
    url: jdbc:mysql://<ec2 URL주소>:3306/<DB이름>?useSSL=false&useUnicode=true&autoReconnect=true&characterEncoding=utf8&allowMultiQueries=true&serverTimezone=UTC
    username: <mysql 사용자이름>
    password: <mysql 비밀번호>

  jpa:
    database-platform: org.hibernate.dialect.MySQL5InnoDBDialect
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        default_batch_fetch_size: 500
        #        show_sql: false
        format_sql: true
        show_sql: true

    open-in-view: false

  data:
    web:
      pageable:
        default-per-size: 20
        max-page-size: 2000 

token:
  # 일단 하루
  expiration_time: 86400000
  secret: secretcode

cloud:
  aws:
    credentials:
      accessKey: <AWS IAM AccessKey>
      secretKey: <AWS IAM SecretKey>
    s3:
      bucket: <AWS S3 Bucket img>
    region:
      static: ap-northeast-2
    stack:
      auto: false

logging:
  level:
    org.hibernate.SQL: debug

kakao:
  restapikey: <카카오 애플리케이션 REST API 키>
```

### Dockerfile 작성

프로젝트 루트 디렉토리에서 Dockerfile 생성

```docker
# Dockerfile

# JDK8버전 이미지 기반
FROM openjdk:8

# 8080포트 사용
EXPOSE 8080
# build 파일 추가
ADD ./build/libs/beedly-0.0.1-SNAPSHOT.jar beedly.jar

# jar 파일 실행
CMD ["java","-jar","beedly.jar"]
```

### 프로젝트 빌드 및 이미지 생성

```bash
gradle clean build
docker build -t <도커 허브 리포지토리 이름>/<이미지 이름> .
```

### 도커 허브 repository에 push 및 pull(생략 가능)

```bash
docker push <도커 허브 리포지토리 이름>/<이미지 이름>
docker pull <도커 허브 리포지토리 이름>/<이미지 이름>
```

### 도커 이미지 실행

```bash
docker run -d -p 8080:8080 --name <원하는 컨테이너 이름> <도커 허브 리포지토리 이름>/<이미지 이름>
```

# 프론트엔드 배포 과정

---

## 1. 개발 환경

### IDE

- VisualStudioCode

### React.js, Library 버전

- React.js 17.0.1
- Redux 4.2.0
- react-redux 8.0.2
- Stomp.js 2.3.3
- styled-component 5.3.5
- grommet 2.25.0
- Openvidu-browser 2.22.0
- Material-UI 11.10.0

## 2. 배포 관련 파일

### Dockerfile

```docker
# Dockerfile

# nginx 이미지를 사용합니다. 뒤에 tag가 없으면 latest 를 사용합니다.
FROM nginx

# root 에 app 폴더를 생성
RUN mkdir /app

# work dir 고정
WORKDIR /app

# work dir 에 build 폴더 생성 /app/build
RUN mkdir ./build

# host pc의 현재경로의 build 폴더를 workdir 의 build 폴더로 복사
ADD ./build ./build

# nginx 의 default.conf 를 삭제
RUN rm /etc/nginx/conf.d/default.conf

# host pc 의 nginx.conf 를 아래 경로에 복사
COPY ./nginx.conf /etc/nginx/conf.d

# 80 포트 오픈
EXPOSE 80

# container 실행 시 자동으로 실행할 command. nginx 시작함
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```
server {
    listen 80;
    location / {
        root    /app/build;
        index   index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### .env

```
REACT_APP_KAKAO_API_KEY=[KAKAO_REST_API_KEY]
```

## 실행 및 배포

### 프로젝트 클론

```bash
# git clone
git clone https://lab.ssafy.com/s07-webmobile1-sub2/S07P12A601.git
# frontend 이동
cd frontend
# npm 설치
npm install
# 개발모드로 실행
npm run start
```

### 프로젝트 빌드 및 배포

```bash
# frontend로 이동
cd frontend
# 빌드 실행
CI=false npm run build
# docker 이미지 빌드
docker build -t nginx-react:0.1 .
# docker로 이미지 실행
docker run --name nginx_react -d -p 3000:80 nginx-react:0.1
```

## OpenVidu 배포

- 오픈비두를 배포하기 root 권한을 얻어야 함

`sudo su`

- 오픈비두를 설치하기 위해 권장되는 경로인 `/opt`로 이동

`cd /opt`

- 오픈비두 설치(최신버전 권장)

`curl <https://s3-eu-west-1.amazonaws.com/aws.openvidu.io/install_openvidu_latest.sh> | bash`

- 설치 후 오픈비두가 설치된 경로로 이동

`$ cd openvidu`

- 도메인 또는 퍼블릭IP와 오픈비두와 통신을 위한 환경설정

```bash
$ nano .env

# OpenVidu configuration
# ----------------------
# 도메인 또는 퍼블릭IP 주소
DOMAIN_OR_PUBLIC_IP=i5a608.p.ssafy.io

# 오픈비두 서버와 통신을 위한 시크릿
OPENVIDU_SECRET=HOMEDONG

# Certificate type
CERTIFICATE_TYPE=letsencrypt

# 인증서 타입이 letsencrypt일 경우 이메일 설정
LETSENCRYPT_EMAIL=user@example.com

# HTTP port
HTTP_PORT=8442

# HTTPS port(해당 포트를 통해 오픈비두 서버와 연결)
HTTPS_PORT=8443
```

- 설정 후 오픈비두 서버 실행(`ctrl + c`를 누르면 백그라운드로 실행됨)

```bash
$ ./openvidu start

Creating openvidu-docker-compose_coturn_1          ... done
Creating openvidu-docker-compose_app_1             ... done
Creating openvidu-docker-compose_kms_1             ... done
Creating openvidu-docker-compose_nginx_1           ... done
Creating openvidu-docker-compose_redis_1           ... done
Creating openvidu-docker-compose_openvidu-server_1 ... done

----------------------------------------------------

   OpenVidu Platform is ready!
   ---------------------------

   * OpenVidu Server: https://DOMAIN_OR_PUBLIC_IP/

   * OpenVidu Dashboard: https://DOMAIN_OR_PUBLIC_IP/dashboard/

----------------------------------------------------
```
