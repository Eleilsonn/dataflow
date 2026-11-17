FROM node:26-slim

ENV TZ=America/Sao_Paulo

RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json tsconfig*.json ./

RUN npm install

EXPOSE 5000

CMD ["npx", "nest", "start", "--watch"]
