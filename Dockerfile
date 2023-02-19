FROM node:16-alpine AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

FROM node:16-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN yarn build
CMD ["yarn", "start"]
