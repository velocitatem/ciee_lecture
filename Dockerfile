# Build Beamer PDF, then serve with nginx (for Dokploy / ciee2026.alves.world)
FROM debian:bookworm-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    make \
    lmodern \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY presentation.tex Makefile ./
RUN make

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY web/index.html /usr/share/nginx/html/index.html
COPY --from=builder /src/presentation.pdf /usr/share/nginx/html/presentation.pdf
