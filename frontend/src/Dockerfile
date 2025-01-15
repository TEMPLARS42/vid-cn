# Stage 1: Build the application
FROM alpine:3.14 as builder

# Set working directory
WORKDIR /app

# Install Node.js and npm
RUN apk add --update --no-cache nodejs npm

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the entire application
COPY . .

# Load environment variables from .env file

# ENV NODE_OPTIONS=--max-old-space-size=4096
# ARG NODE_OPTIONS

# Build the React app
# ENTRYPOINT ["/bin/bash"]  
RUN npm run build


# Stage 2: Create a production image using Nginx
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port
EXPOSE 80

# Start Nginx to serve the React app
CMD ["nginx", "-g", "daemon off;"]


