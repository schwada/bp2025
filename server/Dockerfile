FROM oven/bun:alpine
COPY ./database /opt/database
COPY ./server /opt/server
WORKDIR /opt/server
RUN bun install

EXPOSE 3000
CMD ["bun", "run", "test.ts"] 