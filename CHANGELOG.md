# Changelog

## Setup
- Created project structure (frontend, backend, agents, scrapers, integrations)
- Installed dependencies: express, dotenv, anthropic, playwright, axios, cheerio

## Agents
### tailor.js
- Claude API integration for resume tailoring
- Claude API integration for cover letter tailoring
- ATS keyword scoring system
- If resume scores 80% or above, send as is with no changes
- If below 80%, only change objective and project sections
- Power words list to replace weak action words
- Weak words list that get replaced automatically
- Font instructions: Calibri body, bold headings, min 10pt

## Coming Next
- backend/server.js — Express API server
- scrapers/linkedin.js — LinkedIn job scraper
- scrapers/indeed.js — Indeed scraper
- scrapers/greenhouse.js — Greenhouse scraper
- scrapers/lever.js — Lever scraper
- scrapers/workday.js — Workday scraper
- integrations/gmail.js — Gmail reply tracker
- frontend — React dashboard