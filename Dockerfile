# Use a recent Ubuntu LTS base image
FROM ubuntu:20.04

# Create a non-root user with UID between 10000 and 20000
USER 15000

# Update package lists
RUN apt-get update

# Install build tools for C, C++, Java, and Golang
RUN apt-get install -y \
  build-essential \
  openjdk-11-jdk \
  golang-go \
  curl \
  libssl-dev

# Install Python 3.7.7 and its dependencies
RUN apt-get install -y software-properties-common python3.7 python3.7-dev

# Ensure Python 3.7.7 is the default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.7 1

# Install pip version 20.1 (might not be available through apt)
RUN curl https://bootstrap.pypa.io/get-pip.py | python3.7 && \
  python3.7 -m pip install --upgrade pip==20.1

# Install Node.js
RUN apt-get install -y nodejs npm

# Set environment variables (optional, remove if not needed)
ENV PYTHON_VERSION 3.7.7
ENV PYTHON_PIP_VERSION 20.1
ENV DEBIAN_FRONTEND noninteractive

COPY . /app
# Working directory for your project
WORKDIR /app

# Copy your project files
COPY /

# Install dependencies based on your project needs
npm install  
# Installs dependencies from package.json

# Expose port (adjust if needed)
EXPOSE 8000

# Command to run your application (replace with your actual command)
CMD [ "npm", "start" ]
