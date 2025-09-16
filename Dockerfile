FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# Clean npm cache
RUN npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
