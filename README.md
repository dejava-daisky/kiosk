# Student Progress Kiosk

학생별 진행상황을 입력하고 키오스크 화면에서 확인하는 간단한 Node.js + MySQL 프로젝트입니다.

## 실행

```powershell
npm install

$env:PORT="0703"
$env:DB_USER="root"
$env:DB_PASSWORD="your_mysql_password"
$env:DB_NAME="kiosk"

npm start
```

## 화면

```text
http://localhost:703/insert
http://localhost:703/kiosk
```

## DB

```sql
CREATE DATABASE kiosk;

USE kiosk;

CREATE TABLE student (
    id VARCHAR(50) PRIMARY KEY,
    progress VARCHAR(100)
);
```
