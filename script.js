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

// --- Mock Cost Estimation Agent Logic (remains the same) ---
function getCostRange(projectType, zip, params = {}) {
    const baseCost = projectType.length * 150 + (parseInt(zip) % 100) * 15;
    let multiplier = 1.0;

    if (params.material === 'premium') multiplier = 1.5;
    if (params.size) multiplier *= (params.size / 100);

    const estimatedBase = baseCost * multiplier;

    if (!db.services.includes(projectType)) {
        return {
            good: { min: 400, max: 800 },
            better: { min: 800, max: 1500 },
            best: { min: 1500, max: 3000 },
            notes: "This is a conservative national median estimate as specific data for your project is unavailable.",
            isFallback: true
        };
    }

    return {
        good: { min: Math.round(estimatedBase * 0.8), max: Math.round(estimatedBase * 1.2) },
        better: { min: Math.round(estimatedBase * 1.2), max: Math.round(estimatedBase * 1.8) },
        best: { min: Math.round(estimatedBase * 1.8), max: Math.round(estimatedBase * 3.0) },
        notes: `Factors include material quality, home accessibility, and local labor rates in ZIP ${zip}.`,
        isFallback: false
    };
}


// --- Main App Logic (to be built out in subsequent steps) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded for redesigned site. Ready to initialize components.');
    initContent();
    initEmbeddedChat();
});

function initEmbeddedChat() {
    const messagesContainer = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    if (!messagesContainer || !form || !input) return;

    const addMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        // A simple way to format the multi-line responses
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    let conversationState = {
        stage: 'awaiting_zip_project',
        zip: null,
        projectType: null,
        params: {}
    };

    const handleAgentResponse = (userInput) => {
        if (conversationState.stage === 'awaiting_zip_project') {
            const zipMatch = userInput.match(/\b\d{5}\b/);
            const projectMatch = db.services.find(service => userInput.toLowerCase().includes(service.toLowerCase()));

            if (zipMatch && projectMatch) {
                conversationState.zip = zipMatch[0];
                conversationState.projectType = projectMatch;
                conversationState.stage = 'done';

                const costEstimate = getCostRange(conversationState.projectType, conversationState.zip, conversationState.params);

                let response = `Great! For a ${conversationState.projectType} project in ZIP ${conversationState.zip}, here's a rough estimate:\n`
                response += `\n- Good: $${costEstimate.good.min} - $${costEstimate.good.max}`;
                response += `\n- Better: $${costEstimate.better.min} - $${costEstimate.better.max}`;
                response += `\n- Best: $${costEstimate.best.min} - $${costEstimate.best.max}`;

                setTimeout(() => addMessage(response, 'agent'), 500);

                const ctaMessage = "What would you like to do next?\n1. Get 3 free quotes\n2. Save estimate";
                setTimeout(() => addMessage(ctaMessage, 'agent'), 1000);

            } else {
                addMessage("I need a 5-digit ZIP code and a project type (e.g., '90210, Roofing'). Please try again.", 'agent');
            }
        } else if (conversationState.stage === 'done') {
            if (userInput.includes('1') || userInput.toLowerCase().includes('quote')) {
                addMessage("Great! We can connect you with up to 3 pros. This would typically open a lead form.", 'agent');
            } else if (userInput.includes('2') || userInput.toLowerCase().includes('save')) {
                addMessage("Your estimate has been saved. (This is a simulation).", 'agent');
            } else {
                addMessage("Sorry, I didn't understand. Please choose an option from the list.", 'agent');
            }
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = input.value.trim();
        if (!userInput) return;

        addMessage(userInput, 'user');
        handleAgentResponse(userInput);

        input.value = '';
    });

    // Initial greeting
    setTimeout(() => {
        addMessage("Hi! I can provide a cost estimate for your project. Just tell me the project type and your 5-digit ZIP code.", 'agent');
    }, 500);
}

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
