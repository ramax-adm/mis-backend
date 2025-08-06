# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas arquivos necessários para instalar dependências e buildar
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: runtime
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos necessários para rodar a aplicação
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3131

CMD ["node", "dist/src/main.js"]
