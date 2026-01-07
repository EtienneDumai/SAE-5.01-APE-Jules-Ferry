FROM node:20-alpine

WORKDIR /app

# deps d'abord (cache)
COPY package*.json ./
RUN npm ci

# puis le code
COPY . .

EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--hmr"]
