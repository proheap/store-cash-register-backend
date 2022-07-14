# Specify node version and choose image
FROM node:14

# Specify our working directory, this is in our container/in our image
WORKDIR /urs/src/app

# Copy the package.jsons from host to container
COPY package*.json ./

# Install all the deps
RUN npm install

# Bundle app source / copy all other files
COPY . .

# Set port
ENV PORT=3000
ARG PORT
EXPOSE $PORT

# Run app
CMD ["npm", "run", "start:dev"]