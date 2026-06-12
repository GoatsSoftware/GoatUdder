FROM node:26-alpine3.24

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

EXPOSE 5413

CMD ["node", "src/index.js"]