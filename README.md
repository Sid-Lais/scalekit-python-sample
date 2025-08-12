# FastAPI Passwordless Auth – Minimal Repro Steps

## How to Reproduce the SDK Issue

1. Clone this repo and enter the directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or: source venv/bin/activate  # On Linux/Mac
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your Scalekit credentials.
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. Use any API client (e.g. Postman, curl) to call:
   ```bash
   POST http://localhost:8000/api/auth/send-passwordless
   # with a valid email and template in the JSON body
   ```
7. Observe the server log and API response for the raw SDK output and error.

## To Run the Frontend UI

1. Change to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js frontend:
   ```bash
   npm run dev
   ```
4. Open your browser to http://localhost:3000 and use the UI to trigger passwordless auth flows. The UI will reflect the backend SDK issue in real time.

## Where to Find More Info

See [`SCALEKIT_SDK_ISSUES.md`](./SCALEKIT_SDK_ISSUES.md) for technical details, logs, and explanation of the SDK problem.
