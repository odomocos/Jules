// --- Mock Database (Redesigned) ---
const db = {
    // Simplified list of services for autocomplete and validation
    services: [
        "Handyman", "Plumbing", "HVAC", "Roofing", "Remodeling"
    ],
    // Simplified popular projects with monochrome icon placeholders
    popularProjects: [
        { icon: "🔧", title: "Handyman", fromPrice: 80 },
        { icon: "💧", title: "Plumbing", fromPrice: 150 },
        { icon: "💨", title: "HVAC", fromPrice: 250 },
        { icon: "🏠", title: "Roofing", fromPrice: 400 },
        { icon: "🔨", title: "Remodeling", fromPrice: 1200 }
    ],
    // Simplified categories
    categories: [
        { icon: "🔧", name: "Handyman" },
        { icon: "💧", name: "Plumbing" },
        { icon: "💨", name: "HVAC" },
        { icon: "🏠", name: "Roofing" },
        { icon: "🔨", name: "Remodeling" }
    ]
};

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Initializing components.');
    initContent();
    initEmbeddedChat();
});

function initEmbeddedChat() {
    const messagesContainer = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const attachButton = document.getElementById('attach-file-button');
    const fileInput = document.getElementById('file-input');
    const fileDisplayArea = document.getElementById('file-display-area');

    if (!messagesContainer || !form || !input || !attachButton || !fileInput || !fileDisplayArea) {
        console.error("Chat component not found. Aborting chat initialization.");
        return;
    }

    let selectedFile = null;

    // --- Helper Functions ---
    const addMessage = (content, sender, type = 'text') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        if (type === 'html') {
            messageDiv.innerHTML = content;
        } else {
            messageDiv.textContent = content;
        }
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageDiv;
    };

    const displaySelectedFile = () => {
        if (selectedFile) {
            fileDisplayArea.innerHTML = `
                <div class="selected-file">
                    <span>${selectedFile.name}</span>
                    <button type="button" class="remove-file-button">&times;</button>
                </div>
            `;
            fileDisplayArea.style.display = 'block';
            document.querySelector('.remove-file-button').addEventListener('click', () => {
                selectedFile = null;
                fileInput.value = ''; // Clear the file input
                fileDisplayArea.style.display = 'none';
                fileDisplayArea.innerHTML = '';
            });
        }
    };

    const formatEstimateResponse = (data) => {
        let html = `<strong>Here is your project estimate:</strong>`;

        if (data.projectSummary) {
            html += `
                <h4>Project Summary</h4>
                <ul>
                    <li><strong>Total Square Footage:</strong> ${data.projectSummary.totalSquareFootage || 'N/A'} sq ft</li>
                    <li><strong>Complexity Level:</strong> ${data.projectSummary.complexityLevel || 'N/A'}</li>
                    <li><strong>Work Types:</strong> ${(data.projectSummary.workTypes || []).join(', ') || 'N/A'}</li>
                </ul>
            `;
        }

        if (data.lineItems && data.lineItems.length > 0) {
            html += `
                <h4>Line Items</h4>
                <table class="estimate-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.lineItems.map(item => `
                            <tr>
                                <td>${item.description || ''}</td>
                                <td>${item.quantity || ''} ${item.unit || ''}</td>
                                <td>$${(item.rate || 0).toFixed(2)}</td>
                                <td>$${(item.amount || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        if (data.costBreakdown) {
            html += `
                <h4>Cost Breakdown</h4>
                <table class="summary-table">
                    <tbody>
                        <tr><td>Subtotal (Labor):</td><td>$${(data.costBreakdown.laborCost || 0).toFixed(2)}</td></tr>
                        <tr><td>Materials & Supplies (15%):</td><td>$${(data.costBreakdown.materialsMarkup || 0).toFixed(2)}</td></tr>
                        <tr><td>Contingency (10%):</td><td>$${(data.costBreakdown.contingency || 0).toFixed(2)}</td></tr>
                        <tr><td><strong>Subtotal:</strong></td><td><strong>$${(data.costBreakdown.subtotal || 0).toFixed(2)}</strong></td></tr>
                        <tr><td>Tax (8%):</td><td>$${(data.costBreakdown.tax || 0).toFixed(2)}</td></tr>
                        <tr><td><strong>Grand Total:</strong></td><td><strong>${data.formattedTotal || '$' + (data.costBreakdown.grandTotal || 0).toFixed(2)}</strong></td></tr>
                    </tbody>
                </table>
            `;
        }

        return html;
    };

    // --- Event Listeners ---
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            displaySelectedFile();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = input.value.trim();

        if (!userInput && !selectedFile) {
            return; // Don't send empty messages
        }

        // Add user message to chat
        if (userInput) {
            addMessage(userInput, 'user');
        }
        if (selectedFile) {
            addMessage(`Uploading file: ${selectedFile.name}`, 'user');
        }

        // Clear inputs
        input.value = '';
        const currentFile = selectedFile; // Keep a reference
        selectedFile = null;
        fileDisplayArea.style.display = 'none';
        fileDisplayArea.innerHTML = '';

        // Show thinking message
        const thinkingMessage = addMessage('...', 'agent thinking');
        const thinkingDots = setInterval(() => {
            thinkingMessage.textContent = thinkingMessage.textContent.length < 5 ? thinkingMessage.textContent + '.' : '.';
        }, 300);

        // --- API Call ---
        const webhookUrl = 'YOUR_N8N_WEBHOOK_URL'; // IMPORTANT: Replace with your actual webhook URL

        try {
            let response;
            if (currentFile) {
                // File submission
                const formData = new FormData();
                formData.append('inputType', 'pdf');
                // n8n expects the file in a field named 'file' for the 'Extract from File' node
                formData.append('file', currentFile);

                // If there's text, send it along with the file
                if (userInput) {
                    formData.append('description', userInput);
                }

                response = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData,
                });

            } else {
                // Text submission
                response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputType: 'text',
                        description: userInput,
                    }),
                });
            }

            clearInterval(thinkingDots); // Stop the "thinking" animation

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.statusText} - ${errorText}`);
            }

            const resultData = await response.json();

            // Display formatted estimate
            const formattedHtml = formatEstimateResponse(resultData);
            messagesContainer.removeChild(thinkingMessage);
            addMessage(formattedHtml, 'agent', 'html');

        } catch (error) {
            console.error('Error fetching estimate:', error);
            clearInterval(thinkingDots);
            messagesContainer.removeChild(thinkingMessage);
            addMessage(`Sorry, something went wrong. Please try again. \nError: ${error.message}`, 'agent');
        }
    });

    // Initial greeting
    setTimeout(() => {
        addMessage("Hi! I'm your remodeling estimator. Please describe your project in detail or upload a PDF blueprint.", 'agent');
    }, 500);
}

// --- Content Rendering Functions (Unchanged) ---
function initContent() {
    renderPopularProjects();
    renderCategories();
}

function renderPopularProjects() {
    const container = document.getElementById('popular-projects-grid');
    if (!container) return;
    const html = db.popularProjects.map(project => `
        <a href="#" class="service-card">
            <div class="icon">${project.icon}</div>
            <h3>${project.title}</h3>
            <div class="price">From $${project.fromPrice}</div>
        </a>
    `).join('');
    container.innerHTML = html;
}

function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    const html = db.categories.map(category => `
        <a href="#" class="service-card">
            <div class="icon">${category.icon}</div>
            <h3>${category.name}</h3>
        </a>
    `).join('');
    container.innerHTML = html;
}
