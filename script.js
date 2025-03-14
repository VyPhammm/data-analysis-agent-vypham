import config from './config.js';

class ChatUI {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.newChatBtn = document.getElementById('newChat');
        this.clearChatBtn = document.getElementById('clearChat');
        this.sendButton = document.getElementById('sendButton');
        this.modal = document.getElementById('chartModal');
        this.closeModalBtn = document.querySelector('.close-button');
        this.chartCanvas = document.getElementById('chartCanvas');
        this.chartContext = this.chartCanvas.getContext('2d');
        this.currentChart = null;
        
        this.setupEventListeners();
        this.loadChatHistory();
    }

    setupEventListeners() {
        // Send message function
        const sendMessage = () => {
            const message = this.userInput.value.trim();
            if (message) {
                this.handleUserMessage(message);
                this.userInput.value = '';
            }
        };

        // Input handling
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.userInput.value.trim()) {
                sendMessage();
            }
        });

        // Send button handling
        this.sendButton.addEventListener('click', sendMessage);

        // Button handlers
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            const messages = JSON.parse(history);
            messages.forEach(msg => this.addMessage(msg.text, msg.sender, false));
        }
    }

    saveChatHistory() {
        const messages = Array.from(this.messagesContainer.children).map(msg => ({
            text: msg.textContent,
            sender: msg.classList.contains('user-message') ? 'user' : 'bot'
        }));
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    addMessage(text, sender, save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        if (save) {
            this.saveChatHistory();
        }
    }

    async handleUserMessage(message) {
        this.addMessage(message, 'user');
        this.addMessage('Processing your request...', 'bot');
        
        try {
            console.log('Calling webhook with message:', message);
            const response = await this.callWebhook(message);
            console.log('Webhook response:', response);

            // Remove the processing message if it exists
            const processingMsg = Array.from(this.messagesContainer.children).find(
                msg => msg.textContent === 'Processing your request...'
            );
            if (processingMsg) {
                processingMsg.remove();
            }

            // Create a container for the bot response
            const botResponseContainer = document.createElement('div');
            botResponseContainer.classList.add('message', 'bot-message');
            
            // Add the response text
            const textDiv = document.createElement('div');
            textDiv.textContent = 'Here is the data you requested:';
            botResponseContainer.appendChild(textDiv);

            // Render table if data exists
            if (response && response.length > 0) {
                const tableContainer = this.renderTable(response);
                botResponseContainer.appendChild(tableContainer);
            }

            this.messagesContainer.appendChild(botResponseContainer);
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.saveChatHistory();

        } catch (error) {
            const errorMessage = error.message || 'Sorry, there was an error processing your request.';
            console.error('Full error details:', error);
            this.addMessage(`Error: ${errorMessage}`, 'bot');
            console.error('Error handling message:', error);
        }
    }

    async callWebhook(userMessage) {
        const url = config.WEBHOOK_URL;
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        headers[config.AUTH_HEADER.name] = config.AUTH_HEADER.value;
        
        console.log('Making request to:', url);
        console.log('With headers:', headers);
        console.log('And body:', {
            user_prompt: userMessage,
            date_time: currentDateTime
        });

        try {
            const response = await Promise.race([
                fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        user_prompt: userMessage,
                        date_time: currentDateTime
                    })
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 300000)
                )
            ]);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonResponse = await response.json();
            console.log('Received response:', jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    startNewChat() {
        if (confirm('Start a new chat? This will clear the current conversation.')) {
            this.clearChat();
        }
    }

    clearChat() {
        this.messagesContainer.innerHTML = '';
        localStorage.removeItem('chatHistory');
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    renderTable(data) {
        const tableContainer = document.createElement('div');
        tableContainer.classList.add('table-container');

        const table = document.createElement('table');
        table.classList.add('data-table');

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.replace(/_/g, ' ').toUpperCase();
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body with all rows
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        return tableContainer;
    }

    createChartButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('chart-buttons');

        const barChartBtn = document.createElement('button');
        barChartBtn.textContent = 'Bar Chart';
        barChartBtn.onclick = () => this.showChart('bar');

        const lineChartBtn = document.createElement('button');
        lineChartBtn.textContent = 'Line Chart';
        lineChartBtn.onclick = () => this.showChart('line');

        buttonContainer.appendChild(barChartBtn);
        buttonContainer.appendChild(lineChartBtn);

        return buttonContainer;
    }

    showChart(type) {
        // Destroy existing chart if any
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        // Get the data from the last table in the chat
        const lastTable = this.messagesContainer.querySelector('.data-table');
        if (!lastTable) return;

        const data = this.extractDataFromTable(lastTable);
        
        // Show modal
        this.modal.style.display = 'block';

        // Create new chart
        this.currentChart = new Chart(this.chartContext, {
            type: type,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Transaction Count',
                    data: data.values,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    extractDataFromTable(table) {
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const labels = [];
        const values = [];

        rows.forEach(row => {
            const cells = Array.from(row.cells);
            labels.push(cells[0].textContent); // Assuming first column is date
            values.push(parseFloat(cells[1].textContent)); // Assuming second column is transaction count
        });

        return { labels, values };
    }
}

// Initialize the chat UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatUI = new ChatUI();
});

export default ChatUI; 