# Data Analysis Chatbot

A ChatGPT-like interface that connects to an n8n Agent for data generation and analysis, with chart visualization capabilities.

## Overview

This project is a dark mode chatbot UI that allows users to query data through natural language. The chatbot connects to an n8n workflow via a webhook, which processes the request and returns data in a tabular format. Users can then visualize this data through bar or line charts.

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
   - `WEBHOOK_URL`: URL of your n8n webhook (default: http://localhost:5678/webhook/user-question)
   - `AUTH_NAME`: Authentication header name (default: admin)
   - `AUTH_VALUE`: Authentication value (default: vyphamdata)

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
4. Ensure the final output is formatted as a table
5. Activate the workflow and copy the webhook URL
6. Update the `WEBHOOK_URL` environment variable in the `docker-compose.yml` file

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
[Place screenshot here]

### Data Visualization
[Place screenshot here]

### n8n Workflow Example
[Place screenshot here]

## Limitations

- No file uploads
- No export options for data or charts
- No streaming responses
- Dark mode only
- Fixed size chat window

## License

[Your license information] 