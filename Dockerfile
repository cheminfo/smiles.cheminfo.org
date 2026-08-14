# ── Stage 1: build the frontend ──────────────────────────────────────────────
FROM node:24-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --workspace=frontend --ignore-scripts

COPY chemistry ./chemistry
COPY frontend ./frontend
RUN npm run build --workspace=frontend

# ── Stage 2: production image ────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --workspace=backend --omit=dev --ignore-scripts

# The chemistry is one module, imported by the API and by the page alike.
COPY chemistry ./chemistry
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=10814
EXPOSE 10814

USER node
WORKDIR /app/backend
CMD ["node", "--experimental-strip-types", "src/server.ts"]
