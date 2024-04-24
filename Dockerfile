FROM ubuntu:18.04

# Create a non-root user with UID between 10000 and 20000
USER 15000

RUN dpkg --configure -a

ENV PYTHON_VERSION 3.7.7
ENV PYTHON_PIP_VERSION 20.1
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get -y install gcc mono-mcs golang-go \
    default-jre default-jdk nodejs npm \
    python3-pip python3 curl && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_VERSION=16.13.2
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# RUN nvm install 16.13.2

COPY . /app
WORKDIR /app
RUN ls
RUN npm install

EXPOSE 8000
CMD ["npm", "start"]
