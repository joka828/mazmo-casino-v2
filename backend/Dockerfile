# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.19.1

FROM node:${NODE_VERSION}

ARG FRONTEND_URL
ENV FRONTEND_URL=${FRONTEND_URL}
ARG DB_USER
ENV DB_USER=${DB_USER}
ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD}
ARG DB_NAME
ENV DB_NAME=${DB_NAME}
ARG DB_HOST
ENV DB_HOST=${DB_HOST}

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY . .

RUN npm install

# Expose the port that the application listens on.
EXPOSE 8080

RUN npm run build

# Run the application.
ENTRYPOINT npm run start
