# Base image with Node.js 20
FROM node:20-slim

# Install system dependencies, including Python, tmux, and vim
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    gnupg \
    tmux \
    vim \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# --- Backend Setup ---
# Create a virtual environment for Python to avoid system package conflicts
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# --- Frontend Setup ---
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
RUN npm install

# --- Final Setup ---
WORKDIR /app
COPY . .

# Expose ports for Backend (8001) and Frontend (5173)
EXPOSE 8001 5173

# Default command: Start bash so you can use tmux/vim
CMD ["/bin/bash"]
