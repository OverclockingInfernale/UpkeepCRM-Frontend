FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

ENV PORT 3000
ENV HOST 0.0.0.0

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
