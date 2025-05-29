# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything
COPY . .

ENV NODE_ENV=production

# Install dependencies and build
RUN npm install
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app ./
RUN npm install

ENV PORT 3000
ENV HOST 0.0.0.0

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
