#  AI Email Productivity Agent

An intelligent email management system powered by Groq's LLaMA 3.1 8B model that automatically categorizes emails, extracts action items, generates draft replies, and provides AI-powered email analysis through a Gmail-style web interface.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1_8B-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Smart Email Categorization** – Automatically classifies emails into **Important**, **To-Do**, **Newsletter**, or **Spam** categories
- **Action Item Extraction** – Identifies tasks and deadlines from email content
- **AI Draft Replies** – Generates professional, context-aware email responses
- **Email Summarization** – Condenses long emails into concise 2–3 sentence summaries
- **AI Chat Interface** – Ask questions about emails and get instant AI-powered insights
- **Modern Gmail-Style UI** – Responsive web interface with a familiar sidebar, email list, and detail view
- **Customizable Prompts** – Edit AI behavior through configurable prompt templates
- **Email Analytics** – View statistics, counts, and category distribution

---

##  Architecture

The project consists of three main components:

### 1. Backend (`server.py`)

A **Flask** web server that:
- Serves the static frontend files (HTML, CSS, JS).
- Provides RESTful API endpoints for email management and AI features.
- Handles database operations and AI agent interactions.

### 2. Frontend (`static/`)

A modern web interface built with **HTML5, CSS3, and Vanilla JavaScript**:
- **`index.html`**: Main application layout.
- **`styles.css`**: Custom styling mimicking Gmail's design system.
- **`script.js`**: Handles API communication, UI state, and interactivity.

### 3. AI & Data Layer

- **`email_agent.py`**: Handles all AI operations using **Groq's LLaMA 3.1 8B Instant** model.
- **`database.py`**: JSON-based storage system for emails and prompts.

---

##  Setup Instructions

### Prerequisites

- **Python 3.13** or higher
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Harshjain10020/Ai-Email-Agent.git
   cd Ai-Email-Agent
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Groq API Key**

   Create a `.env` file in the project root:

   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Running the Application

1. **Start the Flask server:**

   ```bash
   python server.py
   ```

2. **Open the application:**

   Open your browser and navigate to `http://localhost:5000`.

### ☁️ Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on how to host this project for free on Render.

---

##  Mock Inbox Setup

The project includes a pre-configured `mock_inbox.json` with sample emails. You can edit this file to load your own email data.

### Email Structure

```json
{
  "emails": [
    {
      "id": 1,
      "from": "sender@example.com",
      "subject": "Meeting Request",
      "body": "Email content here...",
      "timestamp": "2025-11-25T10:30:00",
      "category": null,
      "action_items": [],
      "draft_reply": null
    }
  ]
}
```

---

## ⚙️ Prompt Configuration

You can customize the AI's behavior by editing the prompt templates.

### Editing Prompts via UI

1. Click the **Apps** icon (grid) in the top right header.
2. The **Prompt Configuration** modal will open.
3. Edit the templates for:
    - **Categorization**: Rules for sorting emails.
    - **Action Item Extraction**: Instructions for finding tasks.
    - **Auto-Reply**: Tone and style for drafts.
    - **Summarization**: Length and focus of summaries.
4. Click **Save Prompts** to persist changes to `prompts.json`.

---

##  Project Structure

```text
email-productivity-agent/
├── server.py           # Flask backend server
├── email_agent.py      # AI agent with Groq integration
├── database.py         # JSON database management
├── mock_inbox.json     # Sample email data
├── prompts.json        # AI prompt templates
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (API Key)
├── static/             # Frontend assets
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── script.js       # Frontend logic
└── README.md           # Project documentation
```


##  License

This project is licensed under the **MIT License**.
