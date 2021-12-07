FROM node:14.16.1

ENV DOCKERIZE_VERSION v0.6.1


RUN npm install -g nodemon
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

ADD .env ./.env
COPY . .


EXPOSE 8080 2031

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

    
RUN chmod +x docker-entrypoint.sh  
ENTRYPOINT ./docker-entrypoint.sh