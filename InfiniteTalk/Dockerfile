# Use an official PyTorch image with CUDA support
# Upgraded to 2.5.1 to support xfuser dependencies
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

WORKDIR /app

# Install system dependencies
# ffmpeg is required for video processing
# git is often needed for installing dependencies from source
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsndfile1 \
    espeak-ng \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# We use --no-cache-dir to keep the image size down
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu124

# Copy the rest of the application
COPY . .

# Default command to run the API server
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]
