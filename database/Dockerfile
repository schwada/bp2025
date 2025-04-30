FROM postgres:17.4-alpine
RUN apk add --no-cache curl unzip
RUN curl -fsSL https://bun.sh/install | bash

COPY ./database /opt/database

WORKDIR /opt/database
RUN /root/.bun/bin/bun install
RUN /root/.bun/bin/bun drizzle-kit generate:pg
RUN /root/.bun/bin/bun drizzle-kit push:pg

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=bp

EXPOSE 5432 