# Multi-stage Dockerfile for Graph Algorithms Library
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY examples/ ./examples/
COPY public/ ./public/

# Development stage
FROM base AS development
RUN npm install
COPY test/ ./test/
ENV NODE_ENV=development

# Production stage
FROM base AS production
ENV NODE_ENV=production
USER node

# Demo runner stage
FROM production AS demo
CMD ["node", "examples/complete-algorithms-demo.js"]

# Test runner stage
FROM development AS test
CMD ["sh", "-c", "node test/test.js && node test/algorithms-test.js && node test/advanced-algorithms-test.js"]

# API server stage (lightweight HTTP API for algorithm execution)
FROM production AS api
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
