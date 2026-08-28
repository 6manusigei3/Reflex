#!/usr/bin/env bash

set -e

echo "Starting Reflex backend..."

echo "Applying database migrations..."
alembic upgrade head

echo "Running deployment preflight..."
python -m app.preflight

echo "Starting FastAPI..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}"
