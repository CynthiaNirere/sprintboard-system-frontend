# Stage 1: Build the Vue application
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM httpd:2.4-alpine AS production-stage
COPY --from=build-stage /app/dist/ /usr/local/apache2/htdocs/

# Copy your custom configuration into Apache
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 80
