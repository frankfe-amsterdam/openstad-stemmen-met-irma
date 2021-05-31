FROM node:15.11.0-alpine3.10
LABEL maintainer="f.filius@amsterdam.nl"

USER root

RUN apk add --no-cache python3 py3-pip alpine-sdk

WORKDIR /app/frontend
COPY ./frontend/webpack.config.js ./
COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./
COPY ./frontend/src ./src

WORKDIR /app/backend
COPY ./backend/package.json ./
COPY ./backend/package-lock.json ./
COPY ./backend/src ./src

## Build the frontend (output will be in backend/public)
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app/backend
RUN npm install --production

## Remove frontend
WORKDIR /app/
RUN rm -rf frontend

## Install pm2-runtime
RUN npm install pm2 -g
WORKDIR /app/backend
CMD ["pm2-runtime","./src/server.js"]

EXPOSE 4444
