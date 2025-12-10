FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

# Le docker-compose mappe 4000:4173 pour React
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
