FROM node:12-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_OPTIONS --max-old-space-size=4096

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
        && npm ci && apk del .gyp

COPY . .

EXPOSE 3040
CMD npm run prod