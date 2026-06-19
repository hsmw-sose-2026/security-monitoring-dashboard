FROM oven/bun:alpine AS deps

WORKDIR /fe

COPY Frontend/package.json Frontend/bun.lock ./

RUN bun install --frozen-lockfile --linker=isolated


FROM oven/bun:alpine AS builder

WORKDIR /fe

COPY --from=deps /fe/node_modules ./node_modules
COPY Frontend/. .

RUN bun run build

RUN find .next/standalone/node_modules -type d \( -name "*-linux-x64@*" -o -name "typescript@*" \) -prune -exec rm -rf '{}' +


FROM oven/bun:alpine AS compressor

RUN apk add upx

WORKDIR /usr/local/bin/

RUN upx --best --lzma bun


FROM python:3.14-alpine

ENV TZ="Europe/Berlin"

WORKDIR /be

COPY Backend/requirements.txt .

RUN apk add --no-cache \
    gcc \
    g++ \
    musl-dev \
    libffi-dev \
    openssl-dev \
    && pip install --no-cache-dir --upgrade -r requirements.txt \
    && apk del gcc musl-dev libffi-dev openssl-dev

COPY Backend/. .


RUN apk add --no-cache libstdc++ libgcc

COPY --from=compressor /usr/local/bin/bun /usr/local/bin/

WORKDIR /fe

COPY --from=builder /fe/public ./public
COPY --from=builder /fe/.next/standalone ./
COPY --from=builder /fe/.next/static ./.next/static

EXPOSE 3000
EXPOSE 8000

WORKDIR /

COPY start.sh .
RUN chmod +x /start.sh

CMD ["./start.sh"]
