# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.19.1

FROM node:${NODE_VERSION}-alpine AS build

# Use production node environment by default.
ARG NODE_ENV production

WORKDIR /usr/src/app

# Copy necessary files and directories for the build
COPY package.json package-lock.json tsconfig.json .env ./
COPY src ./src
COPY public ./public

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


RUN npm run build

# Stage 2: Serve the React app
FROM nginx AS serve

# Copy the build output from the build stage to the default Nginx public directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

COPY start.sh /start.sh
RUN chmod +x /start.sh

RUN apt-get update && apt-get install -y gettext-base

# Start Nginx when the container launches
ENTRYPOINT "/start.sh"