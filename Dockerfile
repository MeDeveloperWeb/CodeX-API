FROM ubuntu:22.04

RUN dpkg --configure -a

ENV PYTHON_VERSION 3.7.7
ENV PYTHON_PIP_VERSION 20.1
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update

RUN apt-get -y install gcc mono-mcs golang-go \
    default-jre default-jdk nodejs npm \
    python3-pip python3 curl && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /usr/local/.nvm
WORKDIR /usr/local/.nvm

ENV NVM_DIR=/usr/local/.nvm
ENV NODE_VERSION=18.18.2
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/usr/local/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# RUN nvm install 16.13.2

RUN mkdir /tmp/node

RUN npm config set cache /tmp/node --global

WORKDIR /home

COPY . /app
WORKDIR /app

RUN chown -R 10014:0 "/tmp/node"

RUN chown -R 10014:0 "/app"

RUN npm install

EXPOSE 8000

USER 10014

CMD ["npm", "start"]
