# Student Progress Kiosk

학생별 진행상황을 입력하고 키오스크 화면에서 확인하는 Node.js + MySQL 프로젝트입니다.

## 화면

```text
http://localhost:703/insert
http://localhost:703/kiosk
```

## Docker Compose 실행

키오스크 PC에 Git과 Docker Desktop을 설치한 뒤 실행합니다.

```powershell
git clone https://github.com/dejava-daisky/kiosk.git
cd kiosk
docker compose up -d
```

실행 확인:

```powershell
docker compose ps
```

종료:

```powershell
docker compose down
```

DB 데이터까지 삭제:

```powershell
docker compose down -v
```

## 로컬 Node 실행

이미 로컬 MySQL이 있는 경우:

```powershell
npm install

$env:PORT="0703"
$env:DB_USER="root"
$env:DB_PASSWORD="your_mysql_password"
$env:DB_NAME="kiosk"

npm start
```

## DB 스키마

```sql
CREATE TABLE IF NOT EXISTS student (
    id VARCHAR(50) PRIMARY KEY,
    progress VARCHAR(100)
);
```

## 진행상황 값

```text
기획
프로토타입
실제 제작 시작
최종 테스트
완료
```
