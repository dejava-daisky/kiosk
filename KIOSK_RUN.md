# Kiosk 실행 방법

## 1. DB 접속 확인

PowerShell에서 MySQL 계정 정보를 넣고 확인합니다.

```powershell
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="비밀번호"
$env:DB_NAME="kiosk"
npm run check:db
```

## 2. 서버 실행

```powershell
npm start
```

브라우저에서 엽니다.

```text
http://localhost:3000/kiosk
```

외부 키오스크에서는 같은 네트워크 기준으로 아래처럼 접속합니다.

```text
http://로컬PC_IP:3000/kiosk
```

## 3. API

```text
GET /api/students
```

이 API는 `kiosk` 데이터베이스의 `student` 테이블을 조회해서 화면에 출력할 데이터만 반환합니다.
