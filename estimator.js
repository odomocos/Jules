document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const form = document.getElementById('estimate-form');
    const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
    const textInputContainer = document.getElementById('text-input-container');
    const pdfInputContainer = document.getElementById('pdf-input-container');
    const descriptionInput = document.getElementById('project-description');
    const zipCodeInput = document.getElementById('zip-code');
    const zipCodeValidationMessage = document.getElementById('zip-code-validation-message');
    const fileInput = document.getElementById('pdf-file');
    const resultsContent = document.getElementById('results-content');
    const placeholder = document.querySelector('.placeholder');

    // --- Event Listeners ---
    let zipCodeValidationTimer;

    zipCodeInput.addEventListener('input', () => {
        clearTimeout(zipCodeValidationTimer);
        const zipCode = zipCodeInput.value.trim();

        if (zipCode.length === 5) {
            zipCodeValidationTimer = setTimeout(() => {
                validateZipCode(zipCode);
            }, 300); // Debounce API call
        } else {
            zipCodeValidationMessage.textContent = '';
            zipCodeValidationMessage.className = 'validation-message';
        }
    });

    // Toggle between text and PDF input fields
    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'text') {
                textInputContainer.classList.remove('hidden');
                pdfInputContainer.classList.add('hidden');
            } else {
                textInputContainer.classList.add('hidden');
                pdfInputContainer.classList.remove('hidden');
            }
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputType = document.querySelector('input[name="inputType"]:checked').value;
        const description = descriptionInput.value.trim();
        const zipCode = zipCodeInput.value.trim();
        const file = fileInput.files[0];

        if (!zipCode) {
            // This is a fallback, the 'required' attribute should prevent this.
            alert('Please enter a zip code.');
            return;
        }

        if (inputType === 'text' && !description) {
            alert('Please enter a project description.');
            return;
        }
        if (inputType === 'pdf' && !file) {
            alert('Please select a PDF file.');
            return;
        }

        // Show loading indicator
        resultsContent.innerHTML = '<p class="loading-indicator">Analyzing your request and generating estimate...</p>';

        // --- API Call ---
        const webhookUrl = 'YOUR_N8N_WEBHOOK_URL'; // IMPORTANT: Replace with your actual webhook URL

        try {
            let response;
            if (inputType === 'pdf') {
                // File submission
                const formData = new FormData();
                formData.append('inputType', 'pdf');
                formData.append('file', file);
                formData.append('description', description);
                formData.append('zipcode', zipCode);

                response = await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData,
                });

            } else {
                // Text submission
                response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        inputType: 'text',
                        description: description,
                        zipcode: zipCode,
                    }),
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.statusText} (${response.status}) - ${errorText}`);
            }

            const resultData = await response.json();

            // Display formatted estimate
            resultsContent.innerHTML = formatEstimateResponse(resultData);

        } catch (error) {
            console.error('Error fetching estimate:', error);
            resultsContent.innerHTML = `<div class="error-message">
                <strong>Error:</strong> Could not retrieve estimate. Please try again later.<br>
                <small>${error.message}</small>
            </div>`;
        }
    });

    // --- Helper Functions ---

    /**
     * Formats the JSON response from the n8n workflow into HTML.
     * @param {object} data - The JSON data from the webhook.
     * @returns {string} - The HTML string to be rendered.
     */
    const formatEstimateResponse = (data) => {
        let html = ``;

        if (_get(data, 'projectSummary')) {
            html += `
                <h4>Project Summary</h4>
                <ul>
                    <li><strong>Total Square Footage:</strong> ${_get(data, 'projectSummary.totalSquareFootage', 'N/A')} sq ft</li>
                    <li><strong>Complexity Level:</strong> ${_get(data, 'projectSummary.complexityLevel', 'N/A')}</li>
                    <li><strong>Work Types:</strong> ${(_get(data, 'projectSummary.workTypes', [])).join(', ') || 'N/A'}</li>
                </ul>
            `;
        }

        const lineItems = _get(data, 'lineItems', []);
        if (lineItems.length > 0) {
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
                        ${lineItems.map(item => `
                            <tr>
                                <td>${_get(item, 'description', '')}</td>
                                <td>${_get(item, 'quantity', '')} ${_get(item, 'unit', '')}</td>
                                <td>$${(_get(item, 'rate', 0)).toFixed(2)}</td>
                                <td>$${(_get(item, 'amount', 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        if (_get(data, 'costBreakdown')) {
            html += `
                <h4>Cost Breakdown</h4>
                <table class="summary-table">
                    <tbody>
                        <tr><td>Labor Cost:</td><td>$${(_get(data, 'costBreakdown.laborCost', 0)).toFixed(2)}</td></tr>
                        <tr><td>Materials & Supplies (15%):</td><td>$${(_get(data, 'costBreakdown.materialsMarkup', 0)).toFixed(2)}</td></tr>
                        <tr><td>Contingency (10%):</td><td>$${(_get(data, 'costBreakdown.contingency', 0)).toFixed(2)}</td></tr>
                        <tr><td><strong>Subtotal:</strong></td><td><strong>$${(_get(data, 'costBreakdown.subtotal', 0)).toFixed(2)}</strong></td></tr>
                        <tr><td>Tax (8%):</td><td>$${(_get(data, 'costBreakdown.tax', 0)).toFixed(2)}</td></tr>
                        <tr><td><strong>Grand Total:</strong></td><td><strong>${_get(data, 'formattedTotal') || '$' + (_get(data, 'costBreakdown.grandTotal', 0)).toFixed(2)}</strong></td></tr>
                    </tbody>
                </table>
            `;
        } else {
             html += '<p>No detailed cost breakdown provided.</p>';
        }

        if (!html) {
            return '<p>The response from the estimator was empty or in an unrecognized format.</p>';
        }

        return html;
    };

    /**
     * Safely gets a nested value from an object.
     * @param {object} obj - The object to query.
     * @param {string} path - The path of the property to retrieve.
     * @param {*} defaultValue - The value to return if the path is not found.
     * @returns {*} - The value at the specified path or the default value.
     */
    const _get = (obj, path, defaultValue = undefined) => {
        const travel = (regexp) =>
            String.prototype.split
                .call(path, regexp)
                .filter(Boolean)
                .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
        const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
        return result === undefined || result === obj ? defaultValue : result;
    };

    /**
     * Validates a zip code by calling an external API and updates the UI.
     * @param {string} zipCode - The 5-digit zip code to validate.
     */
    const validateZipCode = async (zipCode) => {
        zipCodeValidationMessage.textContent = 'Validating...';
        zipCodeValidationMessage.className = 'validation-message';

        try {
            const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Invalid US Zip Code.');
                }
                throw new Error('Could not validate zip code.');
            }
            const data = await response.json();
            const place = data.places[0];
            const location = `${place['place name']}, ${place['state abbreviation']}`;

            zipCodeValidationMessage.textContent = location;
            zipCodeValidationMessage.className = 'validation-message success';

        } catch (error) {
            zipCodeValidationMessage.textContent = error.message;
            zipCodeValidationMessage.className = 'validation-message error';
        }
    };
});
