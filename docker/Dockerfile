FROM node:22-alpine

# Install dependencies
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Install OpenClaw globally
RUN npm install -g openclaw@latest

# Create user
RUN addgroup -g 1000 -S node && \
    adduser -u 1000 -S node -G node

# Create config directories
RUN mkdir -p /home/node/.openclaw /home/node/.otacon/workspace && \
    chown -R node:node /home/node

# Copy default config
COPY config/default.json /home/node/.openclaw/openclaw.json
RUN chown node:node /home/node/.openclaw/openclaw.json

# Switch to node user
USER node

# Expose ports
EXPOSE 18789 18790

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:18789/health || exit 1

# Start command
CMD ["openclaw", "gateway", "--port", "18789", "--bind", "0.0.0.0"]
