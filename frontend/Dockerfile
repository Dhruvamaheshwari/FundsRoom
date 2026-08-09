FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variable for API URL
ARG VITE_API_URL="http://localhost:5000/api"
ENV VITE_API_URL=$VITE_API_URL

# Expose Vite default port
EXPOSE 5173

# Start the Vite development server on all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
