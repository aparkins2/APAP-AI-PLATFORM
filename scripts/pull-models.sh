#!/usr/bin/env bash
# ==============================================================================
# Pull & Pre-Warm APAP AI Open-Weights LLM Models in Ollama
# ==============================================================================

CONTAINER_NAME="apap-ollama"

echo "Checking if ${CONTAINER_NAME} is running..."
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
  echo "Error: Container ${CONTAINER_NAME} is not running. Please start your Docker / Coolify stack first."
  exit 1
fi

echo "Pulling Fast Model: qwen3.5:4b (~2.6 GB)..."
docker exec -it "${CONTAINER_NAME}" ollama pull qwen3.5:4b

echo "Pulling Alternative Model: gemma3:4b (~3.3 GB)..."
docker exec -it "${CONTAINER_NAME}" ollama pull gemma3:4b

echo "Pulling Smart Model: qwen3.5:9b (~5.8 GB)..."
docker exec -it "${CONTAINER_NAME}" ollama pull qwen3.5:9b

echo "Listing installed models in Ollama:"
docker exec -it "${CONTAINER_NAME}" ollama list

echo "Done! All APAP AI models are downloaded and ready."
