FROM node:lts-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app/frontend

COPY ./package.json ./

RUN yarn install

CMD [ "yarn", "build" ]