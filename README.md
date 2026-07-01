# Developer Intelligence Platform (AI OS)

A 100% open-source, commercially permissive, startup-grade portfolio operating system. The platform behaves like an agentic dashboard where visitors interact with a team of specialized AI agents to query the developer's career history, projects, and skills in real time.

![Developer Intelligence Platform Dashboard](frontend/src/assets/hero.png)

---

## 🚀 Key Features

* **📊 Mission Control Dashboard**: Real-time telemetry monitoring displaying client JS heap allocations (`window.performance.memory`), actual backend response latencies, and animated performance charts using **Recharts**.
* **🧠 Multi-Agent State Graph**: Orchestrated via **LangGraph**, utilizing a custom raw state graph (Planner Node $\rightarrow$ Intent Router $\rightarrow$ Specialized Agent Pool $\rightarrow$ Response Aggregator) with a live visual thinking console.
* **🧪 AI Labs Playground**: Interactive showcases for recruiting managers:
  * **Vision Lab**: Bounding box object coordinates and OCR text extractor powered by a local **Florence-2** worker.
  * **Resume Lab**: A Monaco-editor inspired parsed JSON viewer side-by-side with semantic ATS score audits and missing keyword tags.
* **⌨️ CLI System Console**: An interactive terminal shell on the Contact page executing custom command prompts (`help`, `projects`, `skills`, `resume`, `github`, `linkedin`, `clear`, `about`).
* **🔍 Global Command Palette (`Ctrl + K`)**: Floating navigation dialog supporting instant command triggers and routing hotkeys.
* **✨ Premium Micro-interactions**: Smooth, springy staggered entries powered by **GSAP** and cursor-bound glowing border card gradients (Stripe/Vercel style) tracked via a custom React cursor hook.

---

## 🏗️ System Architecture

The platform runs entirely on locally hosted or self-hosted permissive models, ensuring full data privacy and zero API bills:

```text
               +-------------------------------------------------+
               |             React + TypeScript UI               |
               |       (Vite, Tailwind v4, GSAP, Recharts)       |
               +-----------------------+-------------------------+
                                       |
                         REST / WebSockets Connection
                                       v
               +-------------------------------------------------+
               |             FastAPI Gateway Backend             |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |             LangGraph Orchestrator              |
               |      (Planner, Router, Aggregator Nodes)        |
               +------------+------------------------+-----------+
                            |                        |
                            v                        v
               +------------+------------+    +------+-----------+
               |     ChromaDB Collection |    | Local LLM Driver |
               | (SentenceTransformers)  |    | (Ollama - Qwen)  |
               +-------------------------+    +------------------+
```

---

## 🛠️ Tech Stack

| Category | Technology | License |
| --- | --- | --- |
| **Frontend Framework** | React + TypeScript + Vite | MIT |
| **Styling** | Tailwind CSS v4 | MIT |
| **Animations** | GSAP + Framer Motion | MIT |
| **Telemetry Charts** | Recharts | MIT |
| **Backend Framework** | FastAPI + Uvicorn | MIT |
| **AI Orchestration** | LangGraph | MIT |
| **Vector Storage** | ChromaDB | Apache-2.0 |
| **Embeddings** | SentenceTransformers (`all-MiniLM-L6-v2`) | Apache-2.0 |
| **Local LLM** | Ollama (`qwen2.5:8b` / `mistral:7b`) | Apache-2.0 |
| **Database Logs** | PostgreSQL (telemetry session memory) | PostgreSQL |
| **Containerization** | Docker + Docker Compose | Apache-2.0 |

---

## 📦 Local Installation & Setup

### 1. Prerequisite Environments
* Install **Docker** and **Docker Compose**
* Install **Python 3.11+**
* Install **Node.js 18+**
* Install **Ollama** and fetch target model weights:
  ```bash
  ollama pull qwen2.5:8b
  ```

### 2. Boot Database & Vector Instances
Spins up PostgreSQL (port 5432) and ChromaDB (port 8000) containers in background:
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 3. Initialize & Start Backend Gateway
Configure python virtual environment, install requirements, and index the structured career JSON files:
```bash
# Setup virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run indexer script to load knowledge base into ChromaDB
set PYTHONPATH=backend
python scripts/load_kb.py

# Boot FastAPI server
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
*(Swagger UI is available at `http://127.0.0.1:8000/docs`)*

### 4. Boot React Frontend OS
```bash
cd frontend
npm install
npm run dev
```
*(Open `http://localhost:5173` to explore the OS dashboard)*

---

## 📝 License

Distributed under the permissive **MIT License**. See `.gitignore` and `scripts/check_licenses.py` for commercial safety package details.
