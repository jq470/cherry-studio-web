# Static web build + CORS proxy in one container.
#
#   docker build -t cherry-studio-web .
#   docker run -p 8080:8080 cherry-studio-web
#
# Provider base URL: http://<your-host>:8080/api.openai.com/v1
FROM node:24-alpine

WORKDIR /app
COPY server/cors-proxy.js ./server/cors-proxy.js
COPY dist-web ./dist-web

ENV PORT=8080
ENV STATIC_DIR=/app/dist-web

EXPOSE 8080
CMD ["node", "server/cors-proxy.js", "--static", "dist-web", "--port", "8080"]
