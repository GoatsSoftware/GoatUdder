FROM node:26-alpine3.26

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY src/ ./src/

EXPOSE 5412

CMD ["node", "src/index.js"]