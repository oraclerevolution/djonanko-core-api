## Build assets
FROM node:14-slim as assets

# Add tini to correctly handle process signals / https://gist.github.com/StevenACoffman/41fee08e8782b411a4a26b9700ad7af5#dont-run-pid-1
ENV TINI_VERSION v0.19.0
ARG BUILD_ARCH=amd64

ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-${BUILD_ARCH} /tini
RUN chmod +x /tini

# Install ps command (required by --watch)
RUN apt update && apt install -y procps
# install system dependencies
RUN npm install -g typescript
RUN npm install -g @nestjs/cli

# set the workdir to /app
WORKDIR /app

COPY  .eslintrc.js        \
      .prettierrc         \
      nest-cli.json       \
      package.json        \
      package-lock.json   \
      tsconfig.build.json \
      tsconfig.json       \
      ./

RUN chown -R node:node /app
USER node

# Install modules on container
RUN npm install

# Copy required files to container
COPY --chown=node:node src ./src
COPY --chown=node:node test ./test

# Build app on container
RUN npm run build

##############################################

# expose needed ports
EXPOSE 3000
# Setup Environment
ARG APP_ENV=dev
ENV APP_ENV ${APP_ENV}

# Run app
# ENTRYPOINT npm run start:${APP_ENV}

# Run app, with /tini that will be PID 1, for correct process signal handling
ENTRYPOINT ["/tini", "--"]
CMD ["node", "/app/dist/main.js"]
