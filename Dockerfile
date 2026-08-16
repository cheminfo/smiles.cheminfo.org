# syntax=docker/dockerfile:1
# The site is static: every conversion, every search and every marked answer is
# computed in the visitor's browser by openchemlib, so the image only has to
# hand out the built pages. There is no service behind it.

# ── Stage 1: build the site ──────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: production image ────────────────────────────────────────────────
FROM joseluisq/static-web-server:2-alpine

# The build stays here, read-only. The entrypoint copies it to SERVER_ROOT,
# which is a tmpfs, so the analytics snippet can be put in the pages at startup
# without the image filesystem ever being writable.
COPY --from=builder /app/dist /app/dist
COPY --chmod=0755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENV SERVER_ROOT=/public
ENV SERVER_FALLBACK_PAGE=/public/index.html
# The build writes one file per address, so `/tutorial` is a directory here.
# Without this, static-web-server 308s it to `/tutorial/` — an address the
# sitemap, the internal links and the page's own canonical never use.
ENV SERVER_REDIRECT_TRAILING_SLASH=false
ENV SERVER_PORT=10814
EXPOSE 10814

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/local/bin/static-web-server"]
