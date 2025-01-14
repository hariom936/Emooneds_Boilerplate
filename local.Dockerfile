# Step 1: Use an official Node runtime as a parent image
#FROM node:18-alpine
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if available)
#COPY package*.json ./

# Step 4: Install dependencies
#RUN npm install

# Step 5: Copy the rest of the application's source code from your host to the container
COPY . .
RUN npm install
# Step 6: Build your application
RUN npm run build

# Step 7: Copy swagger api paths in json to build directory. tsc fails to compile these dynamically imported files
RUN cp "src/docs/paths/"*.json "dist/src/docs/paths/"

# Step 8: Your app will be served on port 3000, expose this port
EXPOSE 4000

# Step 9: Define the command to run your app using CMD which defines your runtime. Assuming 'npm serve' is a valid script in your package.json
CMD [ "npm", "run", "serve" ]
