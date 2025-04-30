FROM oven/bun:alpine AS builder

COPY ./frontend /opt/frontend
COPY ./database /opt/database

WORKDIR /opt/frontend/zakaznik
RUN bun install --production
RUN bun run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /opt/frontend/zakaznik/dist ./
COPY --from=builder /opt/frontend/zakaznik/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 