# 광주 다트립 프론트엔드

Vue 3 + Vite + TypeScript 기반 SPA입니다. 장소 랜덤 선택은 현재 저장소의 제공 JSON으로 동작하며, 게시판·챗봇·AI 리포트는 `VITE_API_BASE_URL`의 FastAPI 서버를 우선 호출합니다. 챗봇과 리포트는 백엔드 연결 전에도 제공 데이터와 사용자 입력만으로 제한된 대체 결과를 제공합니다.

## 실행

```bash
npm install
npm run dev
```

`.env.example`을 복사해 로컬 `.env`를 만들고 백엔드 주소를 설정합니다. `.env`는 버전 관리에서 제외됩니다.

## API 계약 초안

- `GET /api/posts?page=1&size=10&keyword=`
- `GET /api/posts/{id}`
- `POST /api/posts`
- `POST /api/posts/{id}/verify-password`
- `PUT /api/posts/{id}`
- `DELETE /api/posts/{id}` — 본문 `{ "password": "1234" }`
- `POST /api/chat`
- `POST /api/reports/generate`

게시판 목록은 `{ items, total, page, size, total_pages }`를 기준으로 하며 단순 배열 응답도 처리합니다. 백엔드 계약 확정 시 `src/api` 계층만 조정하면 화면 코드는 유지됩니다.

## 배포

Netlify 배포 기준 빌드 명령은 `npm run build`, 게시 디렉터리는 `dist`입니다. SPA 새로고침을 위한 `public/_redirects`가 포함되어 있습니다.
