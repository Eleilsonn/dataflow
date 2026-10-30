FROM node:26-slim

ENV TZ=America/Sao_Paulo

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json tsconfig*.json ./

RUN npm install

EXPOSE 5000

CMD [ "npm", "run", "start:dev" ]
