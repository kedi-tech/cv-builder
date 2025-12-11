FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]