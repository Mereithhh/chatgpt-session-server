FROM mcr.microsoft.com/playwright:v1.28.0-focal

WORKDIR /app

COPY ./src/ ./

RUN npm install

EXPOSE 3000

CMD ["node","server.js"]