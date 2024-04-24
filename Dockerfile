# FROM ubuntu:18.04

# RUN dpkg --configure -a

# ENV PYTHON_VERSION 3.7.7
# ENV PYTHON_PIP_VERSION 20.1
# ENV DEBIAN_FRONTEND noninteractive

# RUN apt-get update
# RUN apt-get -y install gcc mono-mcs golang-go \
#     default-jre default-jdk nodejs npm \
#     python3-pip python3 curl && \
#     rm -rf /var/lib/apt/lists/*

# ENV NODE_VERSION=18.18.0
# RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
# ENV NVM_DIR=/root/.nvm
# RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
# RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
# RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
# ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# # RUN nvm install 16.13.2

# # Create a non-root user with UID between 10000 and 20000
# USER 15000

# COPY . /app
# WORKDIR /app

# RUN apt-get update && \
#     apt-get install -y npm && \
#     npm cache clean --force && \
#     rm -rf /var/lib/apt/lists/* && \
#     npm install

# EXPOSE 8000
# CMD ["npm", "start"]

FROM ubuntu:22.04

# Configure dpkg
RUN dpkg --configure -a

# Set environment variables for Python
ENV PYTHON_VERSION 3.7.7
ENV PYTHON_PIP_VERSION 20.1
ENV DEBIAN_FRONTEND noninteractive

# Install required dependencies
RUN apt-get update && \
    apt-get -y install gcc mono-mcs golang-go \
    default-jre default-jdk nodejs npm \
    python3-pip python3 curl && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js using nvm
ENV NODE_VERSION 18.18.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
ENV NVM_DIR /root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION} && \
    nvm use v${NODE_VERSION} && \
    nvm alias default v${NODE_VERSION}

# Add Node.js binaries to the PATH
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

# Create a non-root user with UID between 10000 and 20000
# USER 15000

# Copy application files
COPY . /app
WORKDIR /app

RUN sudo npm cache clean --force 

# Install npm dependencies
RUN npm install

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]

