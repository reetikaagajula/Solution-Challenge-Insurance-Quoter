# Use official Python image from DockerHub
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy everything from current dir to the container
COPY . .

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run the main app
CMD ["python", "main.py"]
