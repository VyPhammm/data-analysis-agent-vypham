# Data Analysis Chatbot

A Chatbot interface that connects to an n8n Agent for data generation and analysis, with chart visualization capabilities.

## Overview

This project is a dark-mode chatbot UI that allows users to query data using natural language. The chatbot connects to an n8n workflow via a webhook, which processes the request by reading the database document, generating the required SQL query, and returning the requested data in a tabular format. Users can then visualize this data using bar or line charts.

## Features

- **Intuitive Chat Interface**: Similar to ChatGPT with dark mode UI
- **Data Visualization**: Generate bar and line charts from retrieved data using Chart.js
- **Persistent Chat History**: Conversations are stored locally and persist across sessions
- **n8n Integration**: Connect to powerful n8n workflows for data processing and generation
- **Responsive Design**: Works on different screen sizes

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript (React/Vue or Vanilla JS)
- **Data Visualization**: Chart.js
- **Backend Connection**: Webhook to n8n Agent
- **Data Persistence**: Local Storage
- **Deployment**: Docker container for easy setup and configuration

## Docker Setup

1. **Build the Docker image**:
   ```bash
   docker-compose build
   ```

2. **Run the container**:
   ```bash
   docker-compose up
   ```

3. **Configuration**:
   The application can be configured through environment variables:
   - `WEBHOOK_URL`: URL of your n8n webhook
   - `AUTH_NAME`: Authentication header name (default: admin)
   - `AUTH_VALUE`: Authentication value (default: admin)

   These can be modified in the `docker-compose.yml` file.

## n8n Agent Setup

To use this chatbot, you need to set up an n8n workflow that:

1. Accepts webhook POST requests with the following structure:
   ```json
   {
     "user_prompt": "User's question",
     "date_time": "YYYY-MM-DD HH:MM:SS"
   }
   ```

2. Processes the natural language query to retrieve relevant data
   
3. Returns data in a structured, tabular format that can be displayed in the UI

### n8n Workflow Configuration

1. Create a new workflow in n8n
2. Add a Webhook node as the trigger
3. Configure your data processing nodes (database connections, API calls, etc.)
4. Prepare your database document in a google sheet
5. Ensure the final output is formatted as a table
6. Activate the workflow and copy the webhook URL
7. Update the `WEBHOOK_URL` environment variable in the `docker-compose.yml` file

## Usage

1. Open the chatbot UI in your browser
2. Type a data-related question in the chat input
3. View the returned data in tabular format
4. Click "Bar Chart" or "Line Chart" to visualize the data
5. Use "New Chat" to start a fresh conversation or "Clear Chat" to remove all messages

## Error Handling

- If no response is received from the n8n webhook within 5 minutes, an error message will be displayed
- The UI will show a typing indicator while waiting for a response

## Screenshots

### Chat Interface
<img width="800" alt="image" src="https://github.com/user-attachments/assets/85a5acef-4f41-4ddc-9571-e311e41955ee" />


### n8n Workflow
![image](https://github.com/user-attachments/assets/1845e338-e348-49f4-9f10-e3659e801349)





