# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if needed (e.g., for some python packages)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Upgrade pip to handle dependency resolution better
RUN pip install --upgrade pip

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && pip install -U ddgs

# Copy the current directory contents into the container at /app
COPY . .

# Make port 8001 available to the world outside this container
EXPOSE 8001

# Run app.py when the container launches
# Use --workers for production concurrency instead of --reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
