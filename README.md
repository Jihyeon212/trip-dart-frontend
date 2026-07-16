# 광주 다트립 프론트엔드

Vue 3 + Vite + TypeScript 기반 SPA입니다. 장소·게시판·챗봇·AI 리포트는 `VITE_API_BASE_URL`의 FastAPI 서버를 호출합니다. 제공 원본 JSON은 프론트엔드 저장소에 커밋하지 않으며 백엔드에서 관리합니다.

로컬 개발 중 `src/assets/data`에 제공 JSON이 존재하면, 백엔드 미연결 시에만 장소·챗봇의 선택적 fallback으로 사용합니다. 해당 JSON은 `.gitignore`로 제외되며 파일이 없어도 프론트엔드 빌드는 성공합니다.

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
- `GET /api/locations`
- `POST /api/trips/random-location`

게시판 목록은 `{ items, total, page, size, total_pages }`를 기준으로 하며 단순 배열 응답도 처리합니다. 백엔드 계약 확정 시 `src/api` 계층만 조정하면 화면 코드는 유지됩니다.

## 배포

Netlify 배포 기준 빌드 명령은 `npm run build`, 게시 디렉터리는 `dist`입니다. SPA 새로고침을 위한 `public/_redirects`가 포함되어 있습니다.
