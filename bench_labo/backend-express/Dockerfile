FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Le docker-compose mappe 3001:3000
EXPOSE 3000
CMD ["node", "index.js"]
