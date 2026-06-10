FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8001

ENV NODE_ENV=production

CMD ["node", "src/index.js"]