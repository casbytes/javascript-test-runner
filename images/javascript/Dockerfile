FROM node:20-bookworm-slim

WORKDIR /usr/js

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN chmod +x script.sh
ENTRYPOINT ["bash", "./script.sh"]
