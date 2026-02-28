FROM --platform=$BUILDPLATFORM node:24-alpine AS xx-node


FROM xx-node AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_FRONT_END_HOST
ARG VITE_PROTOCOL
ARG VITE_BE_URL
RUN  npm run build


FROM caddy:alpine

COPY Caddyfile /etc/caddy/Caddyfile

COPY --from=builder /app/build /usr/share/caddy

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
