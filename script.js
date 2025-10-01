// --- Mock Database (Redesigned) ---
const db = {
    // Simplified list of services for autocomplete and validation
    services: [
        "Handyman", "Plumbing", "HVAC", "Roofing", "Remodeling"
    ],
    // Simplified popular projects with monochrome SVG icons
    popularProjects: [
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>`, title: "Handyman", fromPrice: 80 },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>`, title: "Plumbing", fromPrice: 150 },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/></svg>`, title: "HVAC", fromPrice: 250 },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>`, title: "Roofing", fromPrice: 400 },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg>`, title: "Remodeling", fromPrice: 1200 }
    ],
    // Simplified categories with monochrome SVG icons
    categories: [
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>`, name: "Handyman" },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>`, name: "Plumbing" },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/></svg>`, name: "HVAC" },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>`, name: "Roofing" },
        { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"/></svg>`, name: "Remodeling" }
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
    initHeroSlider();
});

function initHeroSlider() {
    const slides = document.querySelectorAll('#hero-slider .slide');
    const nextBtn = document.getElementById('slider-next');
    const prevBtn = document.getElementById('slider-prev');
    const dotsContainer = document.getElementById('slider-dots');

    if (slides.length === 0) return;

    let currentSlide = 0;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function showSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = (n + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });

    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });

    // Auto-play functionality
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 7000); // Change slide every 7 seconds
}

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
