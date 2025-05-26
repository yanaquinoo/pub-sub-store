FROM node:14.16.1-alpine3.10 AS base
WORKDIR /var/www/

FROM base AS contact-service
ADD  services/contact/ .
RUN npm install --only=production 
CMD [ "node", "app.js" ]

FROM base AS order-service
ADD  services/order/ .
RUN npm install --only=production 
CMD [ "node", "app.js" ]

FROM base AS shipping-service
ADD  services/shipping/ .
RUN npm install --only=production 
CMD [ "node", "app.js" ]

FROM node:18-alpine AS report-service
WORKDIR /app
COPY rabbitmq rabbitmq
COPY services/report services/report
RUN npm install            # instala somente prod deps
CMD ["node", "services/report/app.js"]
