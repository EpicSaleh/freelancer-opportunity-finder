# Freelancer Opportunity Finder

## Overview

**Freelancer Opportunity Finder** is an AI-powered job monitoring assistant that automates the discovery and analysis of new project listings on Freelancer.com. It combines web scraping, Microsoft Power Platform (Dataverse, Power Automate), and a GPT-driven Copilot Studio agent to deliver tailored project recommendations and actionable insights to users.

---

## Architecture

### Part A: Data Collection & Ingestion

1. **Automated Scraping (Puppeteer)**
   - Uses Puppeteer to scrape new project listings from Freelancer.com, focusing on keywords relevant to platforms, SaaS, web apps, eCommerce, and more.
   - Filters out projects with low budgets or hourly rates.
   - Avoids duplicates by tracking sent projects in `sent_projects.json`.

2. **Data Delivery to Dataverse**
   - New, relevant projects are sent via webhook to a Microsoft Power Automate flow.
   - Power Automate inserts these projects into a Dataverse table for structured storage and later querying.

---

### Part B: AI Copilot Agent & User Interaction

1. **User Intent Recognition**
   - The Copilot Studio agent receives user queries (e.g., "Show me new SEO projects under $500").
   - Uses a GPT-based prompt to extract keywords and budget from user input, including synonyms and variations (see `docs/example-user-intent-prompt.txt`).

2. **Automated Search & Filtering**
   - The agent triggers a Power Automate flow to search and filter the Dataverse table based on extracted keywords and budget.

3. **Result Delivery**
   - The agent returns a list of matched projects to the user.

4. **Project Detail Inquiry**
   - Users can request more details about a specific project from the results.

5. **AI-Powered Summary & CTA**
   - The agent uses GPT to summarize the selected project and suggest potential next steps (calls-to-action) for the user.

---

## Key Files & Directories

- `send.js`: Puppeteer script for scraping Freelancer.com and sending new projects to Power Automate.
- `sent_projects.json`: Tracks URLs of already-sent projects to avoid duplicates.
- `package.json`: Node.js dependencies (`puppeteer`, `axios`, `dotenv`).
- `docs/`
  - `copilot-agent-logic.txt`: Contains the logic for the Copilot Studio agent, including two main topics:
    - **Content Analyser**: Handles user intent and project search.
    - **Detail Summary**: Handles project detail summarization and CTA.
  - `example-user-intent-prompt.txt`: Example of the GPT prompt used to extract keywords and budget from user input.
  - `power-automate-overview.png`, `power-automate-details-1.png`, `power-automate-details-2.png`: Screenshots illustrating the Power Automate flow and integration (step-by-step export is not possible).
  - `dataverse-schema.png`: Screenshot of the Dataverse table schema/columns for reference.
  - `test-and-error-handling.txt`: Guide for end-to-end testing and handling common errors.

---

## Setup & Usage

### Prerequisites

- Node.js (v16+ recommended)
- Microsoft Power Platform (Dataverse, Power Automate)
- Access to Copilot Studio (for agent configuration)
- A `.env` file with your `WEBHOOK_URL` for Power Automate

### Installation

```bash
npm install
```

### Running the Scraper

```bash
node send.js
```

- The script will scrape new projects, filter them, and send them to your Power Automate webhook.
- Sent projects are tracked in `sent_projects.json`.

### Copilot Studio Agent

- The agent logic and prompt examples are in the `docs/` directory.
- Configure the agent in Copilot Studio using the provided logic and prompts.
- The agent interacts with users, triggers Power Automate flows, and summarizes project details using GPT.

---

## Documentation

- See `docs/copilot-agent-logic.txt` for agent dialog logic.
- See `docs/example-user-intent-prompt.txt` for the user intent extraction prompt and example.
- See `docs/test-and-error-handling.txt` for testing and troubleshooting guidance.
- Power Automate flow screenshots: `docs/power-automate-overview.png`, `docs/power-automate-details-1.png`, `docs/power-automate-details-2.png`.
- Dataverse schema screenshot: `docs/dataverse-schema.png`.

---

## Missing or Recommended Information

- **Power Automate Flow Details**: Step-by-step export is not possible, but screenshots are provided for reference.
- **Dataverse Table Schema**: See `docs/dataverse-schema.png` for the current schema/columns.
- **Copilot Studio Agent Setup**: For best results, add a guide or screenshots for importing/configuring the agent topics in Copilot Studio.
- **Environment Variables**: Document all required environment variables in a `.env.example` file.
- **License & Contribution Guidelines**: If open source, add a license and guidelines for contributions.

---

## Contact

Have a question? Open an issue or start a discussion!
