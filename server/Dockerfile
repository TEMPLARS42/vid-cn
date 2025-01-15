# Use an official Ubuntu base image
FROM ubuntu:20.04

# Set the working directory in the container
WORKDIR /server

# Update and install required packages
RUN apt-get update && \
    apt-get install -y curl xz-utils

# Download Node.js 20 binary
RUN curl -fsSL https://nodejs.org/dist/v20.0.0/node-v20.0.0-linux-x64.tar.xz -o node-v20.0.0-linux-x64.tar.xz

# Extract Node.js 20 binary
RUN tar -xJf node-v20.0.0-linux-x64.tar.xz -C /usr/local --strip-components=1

# Cleanup downloaded tarball
RUN rm node-v20.0.0-linux-x64.tar.xz

# Install other required dependencies
RUN apt-get install -y build-essential

# Install node-gyp globally
RUN npm install -g node-gyp

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port your Node.js application will listen on
EXPOSE 5000

# Define the command to start your Node.js application
CMD [ "npm", "start" ]
