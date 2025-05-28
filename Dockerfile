# Stage 1: Build frontend
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ls -la /app/src
RUN npm run build

# Stage 2: Run app
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.prod ./

RUN npm ci --only=production

EXPOSE 5000
CMD ["npm", "run", "start:prod"]