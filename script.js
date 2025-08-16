// --- Mock Database ---
const db = {
    services: [
        "Roof Repair", "Fence Installation", "Appliance Repair", "Gutter Cleaning", "Plumbing",
        "House Cleaning", "HVAC Maintenance", "Lawn Mowing", "Tree Trimming", "Window Replacement",
        "Bathroom Remodel", "Kitchen Remodel", "Flooring Installation", "Water Heater Repair",
        "Siding Installation", "Concrete Pouring", "Electrician Services", "Handyperson",
        "Interior Painting", "Exterior Painting", "Deck Building", "Patio Pavers", "Septic Service",
        "Well Pump Service", "Door Installation", "Drywall Repair", "Insulation Installation"
    ],
    popularProjects: [
        { icon: "🔨", title: "Roof Repair", ratingCount: 48, fromPrice: 350 },
        { icon: "🚧", title: "Fence Repair", ratingCount: 72, fromPrice: 250 },
        { icon: "🔧", title: "Appliance Repair", ratingCount: 110, fromPrice: 95 },
        { icon: "💧", title: "Gutter Services", ratingCount: 88, fromPrice: 150 },
        { icon: "🔩", title: "Plumbing", ratingCount: 230, fromPrice: 120 },
        { icon: "🧹", title: "House Cleaning", ratingCount: 150, fromPrice: 100 },
        { icon: "💨", title: "HVAC", ratingCount: 95, fromPrice: 200 }
    ],
    costGuides: [
        { image: "https://via.placeholder.com/400x250/0B1220/FFFFFF?text=Bathroom", title: "Bathroom Remodel Cost" },
        { image: "https://via.placeholder.com/400x250/0B1220/FFFFFF?text=Roof", title: "Roof Installation Cost" },
        { image: "https://via.placeholder.com/400x250/0B1220/FFFFFF?text=Water+Heater", title: "Water Heater Replacement Cost" },
        { image: "https://via.placeholder.com/400x250/0B1220/FFFFFF?text=Flooring", title: "New Flooring Cost Guide" }
    ],
    categories: [
        { icon: "🏠", name: "Roofing" }, { icon: "🖼️", name: "Windows" }, { icon: "🧱", name: "Concrete" },
        { icon: "🌳", name: "Landscaping" }, { icon: "🌲", name: "Tree Service" }, { icon: "🚽", name: "Septic & Wells" },
        { icon: "💡", name: "Electricians" }, { icon: "🚰", name: "Plumbers" }, { icon: "🛠️", name: "Handyperson" },
        { icon: "🧽", name: "Cleaning" }, { icon: "🏢", name: "Siding" }, { icon: "🚪", name: "Doors" }
    ],
    featuredArticles: [
        { image: "https://via.placeholder.com/400x250/1F2937/FFFFFF?text=Kitchen", title: "2025 Kitchen Remodel Cost Guide", author: "Jane Doe", date: "July 15, 2024" },
        { image: "https://via.placeholder.com/400x250/1F2937/FFFFFF?text=Roof+Repair", title: "How Much Does a Roof Repair Cost?", author: "John Smith", date: "July 10, 2024" },
        { image: "https://via.placeholder.com/400x250/1F2937/FFFFFF?text=Water+Heater", title: "Water Heater Installation vs. Repair", author: "Emily White", date: "July 5, 2024" },
        { image: "https://via.placeholder.com/400x250/1F2937/FFFFFF?text=Bathroom", title: "Small Bathroom Remodel Ideas on a Budget", author: "Chris Green", date: "June 28, 2024" }
    ]
};

// --- Mock Cost Estimation Agent Logic ---

/**
 * A mock function to get a cost range for a project.
 * In a real application, this would call a complex pricing API.
 * @param {string} projectType - The type of project (e.g., "Roof Repair").
 * @param {string} zip - The user's ZIP code.
 * @param {object} params - Additional parameters (e.g., { size: 100, material: 'wood' }).
 * @returns {object} An object with cost ranges and notes.
 */
function getCostRange(projectType, zip, params = {}) {
    const baseCost = projectType.length * 100 + (parseInt(zip) % 100) * 10;
    let multiplier = 1.0;

    if (params.material === 'premium') multiplier = 1.5;
    if (params.size) multiplier *= (params.size / 100);

    const estimatedBase = baseCost * multiplier;

    // Simulate a fallback for unknown projects
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


// --- Main App Logic (to be built out) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. App is ready.');
    initHeroAutocomplete();
    initPageContent();
    initCostAgent();
    initLeadModal();
    // All other initialization functions will be called from here.
});

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function initLeadModal() {
    const modal = document.getElementById('lead-form-modal');
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const closeBtn = document.getElementById('modal-close-btn');

    const step1 = document.getElementById('modal-step-1');
    const step2 = document.getElementById('modal-step-2');
    const form1 = document.getElementById('lead-form-step-1');
    const form2 = document.getElementById('lead-form-step-2');

    const serviceInput = document.getElementById('service-input');
    const zipInput = document.getElementById('zip-input');

    const leadServiceInput = document.getElementById('lead-service');
    const leadZipInput = document.getElementById('lead-zip');

    if (!modal || !heroCtaBtn || !closeBtn || !form1 || !form2) return;

    const showModal = (show) => {
        modal.style.display = show ? 'flex' : 'none';
        if (show) {
            // Reset to step 1 each time it opens
            step1.style.display = 'block';
            step2.style.display = 'none';
        }
    };

    heroCtaBtn.addEventListener('click', () => {
        leadServiceInput.value = serviceInput.value;
        leadZipInput.value = zipInput.value;
        showModal(true);
    });

    closeBtn.addEventListener('click', () => showModal(false));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            showModal(false);
        }
    });

    form1.addEventListener('submit', (e) => {
        e.preventDefault();
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    form2.addEventListener('submit', (e) => {
        e.preventDefault();
        const leadPayload = {
            projectType: leadServiceInput.value,
            zip: leadZipInput.value,
            email: document.getElementById('lead-email').value,
            phone: document.getElementById('lead-phone').value,
            notes: document.getElementById('lead-notes').value,
            timing: document.getElementById('lead-timing').value,
            utm: { source: "hero_cta", medium: "web" }
        };
        console.log("--- FINAL LEAD PAYLOAD (to CRM/webhook) ---");
        console.log(JSON.stringify(leadPayload, null, 2));

        showModal(false);
        showToast('Thanks! We are matching you with pros now.');
    });
}

function initPageContent() {
    renderPopularProjects();
    renderCostGuides();
    renderCategories();
    renderFeaturedArticles();
}

function renderPopularProjects() {
    const container = document.getElementById('popular-projects-carousel');
    if (!container) return;
    const html = db.popularProjects.map(project => `
        <div class="project-card">
            <div class="icon">${project.icon}</div>
            <h3>${project.title}</h3>
            <div class="rating">${project.ratingCount} reviews</div>
            <div class="price-pill">from $${project.fromPrice}</div>
        </div>
    `).join('');
    container.innerHTML = html;
}

function renderCostGuides() {
    const container = document.getElementById('cost-guides-grid');
    if (!container) return;
    const html = db.costGuides.map(guide => `
        <a href="#" class="guide-tile">
            <img src="${guide.image}" alt="${guide.title}">
            <div class="guide-tile-content">
                <h3>${guide.title}</h3>
            </div>
        </a>
    `).join('');
    container.innerHTML = html;
}

function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    const html = db.categories.map(category => `
        <a href="#" class="category-card">
            <div class="icon">${category.icon}</div>
            <span>${category.name}</span>
        </a>
    `).join('');
    container.innerHTML = html;
}

function renderFeaturedArticles() {
    const container = document.getElementById('articles-grid');
    if (!container) return;
    const html = db.featuredArticles.map(article => `
        <a href="#" class="article-card">
            <img src="${article.image}" alt="${article.title}">
            <div class="article-content">
                <h3>${article.title}</h3>
                <div class="article-meta">By ${article.author} &bull; ${article.date}</div>
            </div>
        </a>
    `).join('');
    container.innerHTML = html;
}

function initCostAgent() {
    const bubble = document.getElementById('agent-bubble');
    const panel = document.getElementById('agent-panel');
    const closeBtn = document.getElementById('agent-close-btn');
    const messagesContainer = document.getElementById('agent-messages');
    const form = document.getElementById('agent-form');
    const input = document.getElementById('agent-input');

    const togglePanel = (show) => {
        panel.style.display = show ? 'flex' : 'none';
    };

    bubble.addEventListener('click', () => togglePanel(true));
    closeBtn.addEventListener('click', () => togglePanel(false));

    const addMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
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
                response += `\n\nNote: ${costEstimate.notes}`;

                setTimeout(() => addMessage(response, 'agent'), 500);

                const ctaMessage = "What would you like to do next?\n1. Get 3 free quotes\n2. See full cost guide\n3. Save estimate";
                setTimeout(() => addMessage(ctaMessage, 'agent'), 1000);

            } else {
                addMessage("I need a 5-digit ZIP code and a project type (e.g., '90210, Roof Repair'). Please try again.", 'agent');
            }
        } else if (conversationState.stage === 'done') {
            if (userInput.includes('1') || userInput.toLowerCase().includes('quote')) {
                const leadPayload = {
                    projectType: conversationState.projectType,
                    zip: conversationState.zip,
                    params: conversationState.params,
                    costEstimate: getCostRange(conversationState.projectType, conversationState.zip, conversationState.params),
                    userContact: { email: "prefilled@example.com", phone: "555-123-4567" }, // Prefilled from a logged-in state
                    utm: { source: "cost_agent", medium: "chat" }
                };
                console.log("--- LEAD PAYLOAD (to CRM/webhook) ---");
                console.log(JSON.stringify(leadPayload, null, 2));

                addMessage("Great! We'll have up to 3 pros contact you shortly. (Lead details logged to console).", 'agent');
                // In a real app, this would open the lead form modal.
            } else if (userInput.includes('2') || userInput.toLowerCase().includes('guide')) {
                addMessage("Sure, here is our full cost guide for this project: [Link to guide]", 'agent');
            } else if (userInput.includes('3') || userInput.toLowerCase().includes('save')) {
                addMessage("Your estimate has been sent to your email.", 'agent');
                // In a real app, this would trigger a toast notification.
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
        addMessage("Hi! I'm the Project Cost Agent. Tell me your ZIP code and the project you're planning.", 'agent');
    }, 1000);
}

function initHeroAutocomplete() {
    const serviceInput = document.getElementById('service-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    if (!serviceInput || !resultsContainer) return;

    serviceInput.addEventListener('input', () => {
        const query = serviceInput.value.toLowerCase();
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        const filteredServices = db.services.filter(service =>
            service.toLowerCase().includes(query)
        );

        if (filteredServices.length > 0) {
            resultsContainer.innerHTML = filteredServices
                .map(service => `<div>${service}</div>`)
                .join('');
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    });

    resultsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV') {
            serviceInput.value = e.target.textContent;
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!serviceInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}
