FROM node:22

WORKDIR /app

COPY package*.json ./ 
RUN yarn install

ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN yarn build

EXPOSE 3200

CMD ["yarn", "dev"]