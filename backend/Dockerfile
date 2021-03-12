FROM node:lts

WORKDIR /usr/src/app/backend
COPY ./package.json ./

RUN yarn install

CMD [ "yarn", "start" ]
