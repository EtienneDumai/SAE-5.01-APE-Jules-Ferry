FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Angular sert par défaut sur 4200
EXPOSE 4200

# "npm start" lance normalement "ng serve"
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
