# Bugboard - Issue Triage

A modern issue-triage dashboard built with a Vanilla JavaScript frontend, a Python FastAPI backend, and backed by a Dolt version-controlled database.

![Bugboard Screenshot](./screenshot.png)

## Features

- **Glassmorphism Design**: Minimalist and modern aesthetic utilizing dark mode, smooth background gradients, and frosted-glass panels (`backdrop-filter`).
- **Dynamic Filtering**: Quickly filter issues by `Status`, `Severity`, or using the search bar.
- **FastAPI Backend**: A lightweight, lightning-fast Python API providing RESTful CRUD operations.
- **Dolt Database**: Data is stored securely in a Git-backed, MySQL-compatible database.
- **Comprehensive Testing**: Fully tested using `pytest` for backend routing and `playwright` for end-to-end browser testing.

## Getting Started

### Prerequisites
- Python 3.10+
- [Dolt](https://github.com/dolthub/dolt) installed globally.

### Installation

1. Clone the repository and navigate inside:
   ```bash
   cd bugboard
   ```

2. Set up a Python virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   playwright install chromium
   ```

### Running the Application

1. **Start the Database**:
   ```bash
   ./scripts/run_dolt_server.sh
   ```

2. **Start the Backend server** (in a new terminal):
   ```bash
   source venv/bin/activate
   uvicorn backend.main:app
   ```

3. Open your browser and navigate to `http://localhost:8000`.

## Testing

The project includes an automated test framework evaluating the server backend and the UI integration.

To run the entire test suite (API and E2E browser tests):
```bash
./scripts/run_tests.sh
```

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Fetch API
- **Backend API**: Python, FastAPI, Uvicorn, PyMySQL
- **Database**: Dolt (MySQL-compatible)
- **Testing**: Pytest, Pytest-Playwright, HTTPX

## License

This project is dedicated to the public domain under The Unlicense. Feel free to copy, modify, and use it however you wish.
