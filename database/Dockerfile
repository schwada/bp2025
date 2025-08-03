FROM postgres:17.4-alpine
RUN apk add --no-cache curl unzip
RUN curl -fsSL https://bun.sh/install | bash

COPY ./database/init-db.sh /docker-entrypoint-initdb.d/init-db.sh
COPY ./database /opt/database

RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=bp

EXPOSE 5432 