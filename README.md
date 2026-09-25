# StockOpname Rita — Frontend

SPA stock opname Rita Pasaraya. React 19 + TypeScript + Vite + TailwindCSS. Backend terpisah (lihat `VITE_API_URL`).

## Dev

```bash
npm install
cp .env.example .env   # lalu isi VITE_API_URL
npm run dev
```

## Build prod (di server)

`.env` tidak ada di git. Alurnya: `pull` → buat `.env` manual → build image (Vite membakar `VITE_API_URL` saat build):

```bash
nano .env   # isi VITE_API_URL=https://api.produksi...
docker build -f Containerfile -t stockopname-rita-web .
docker run -p 80:80 stockopname-rita-web
```

## Skrip

- `npm run dev` — dev server
- `npm run build` — typecheck + build `dist/`
- `npm run lint` — eslint
- `npm run preview` — pratinjau hasil build
