# Build static site (Markdown → dist/)
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY content/ content/
COPY scripts/ scripts/
COPY templates/ templates/
RUN npm run build

# Serve with nginx
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
