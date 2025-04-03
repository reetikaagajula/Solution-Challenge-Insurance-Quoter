# Use official Node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy frontend code
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Use nginx to serve frontend
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
