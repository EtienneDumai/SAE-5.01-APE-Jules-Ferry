FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Le docker-compose mappe 3002:3000
EXPOSE 3000
CMD ["node", "dist/main.js"]
