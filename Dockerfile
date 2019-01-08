FROM node:lts-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build-client

EXPOSE 8080
CMD ["npm", "run", "server"]
