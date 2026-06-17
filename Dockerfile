# tabia is a static site — serve it with a tiny nginx image.
#   docker build -t tabia .
#   docker run -p 8080:80 tabia   →  http://localhost:8080
FROM nginx:1.27-alpine

# drop the default config and serve the repo as-is
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/.dockerignore 2>/dev/null || true

# SPA-friendly: unknown paths fall back to index.html (mirrors the GitHub Pages 404 bounce)
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
