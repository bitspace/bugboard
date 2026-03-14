#!/bin/bash
# scripts/run_tests.sh
export PYTHONPATH=$PWD

echo "Cleaning up any existing servers..."
pkill -f dolt || true
pkill -f uvicorn || true
sleep 1

echo "Starting Dolt DB server..."
./scripts/run_dolt_server.sh > /dev/null 2>&1 &
DB_PID=$!
sleep 3

echo "Starting FastAPI backend server..."
source venv/bin/activate
uvicorn backend.main:app > /dev/null 2>&1 &
BACKEND_PID=$!
sleep 3

echo "Running Backend API Tests..."
pytest backend/tests/test_api.py -v

echo "Running Frontend UI Tests..."
pytest tests/test_ui.py -v

echo "Cleaning up processes..."
kill $BACKEND_PID
kill $DB_PID
wait $BACKEND_PID 2>/dev/null
wait $DB_PID 2>/dev/null

echo "All Done."
