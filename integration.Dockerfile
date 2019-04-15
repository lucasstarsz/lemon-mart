FROM duluca/minimal-node-build-env:lts-alpine as builder

ENV BUILDER_SRC_DIR=/usr/src

# setup source code directory and copy source code
WORKDIR $BUILDER_SRC_DIR
COPY . .

# install dependencies and build
RUN yes | npm ci
RUN npm run build:prod

#FROM duluca/minimal-node-chromium:lts-alpine as tester
FROM circleci/node:lts-browsers as tester

ENV BUILDER_SRC_DIR=/usr/src
ENV TESTER_SRC_DIR=/root/repo

WORKDIR $TESTER_SRC_DIR
COPY --from=builder $BUILDER_SRC_DIR .

RUN npm run test:prod
# RUN npm run test:prod:e2e

FROM duluca/minimal-nginx-web-server:1-alpine as webserver

ENV BUILDER_SRC_DIR=/usr/src

COPY --from=builder $BUILDER_SRC_DIR/dist/lemon-mart /var/www
CMD 'nginx'
