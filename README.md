# Standalone Construction Estimator Frontend

This project is a standalone, one-page frontend for a remodeling and construction estimating agent. It provides a user-friendly form for users to submit their project details, either as a text description with a zip code, or by uploading a PDF blueprint.

The frontend is designed to integrate with an n8n (or similar) webhook backend that processes the data and returns a detailed cost estimate.

This frontend is built with vanilla HTML, CSS, and JavaScript.

## Features

-   **Standalone Page:** Runs independently from other pages.
-   **Dual Input Modes:** Users can either type a description of their project or upload a PDF file.
-   **Mandatory Zip Code:** Requires a 5-digit zip code for location-based estimates.
-   **Asynchronous Communication:** Communicates with a webhook backend without reloading the page.
-   **Formatted Results:** Displays the returned estimate in a structured and easy-to-read format.

## Setup and Configuration

To use this frontend, you **must** configure it to point to your n8n webhook URL.

1.  **Host the files:** Place `estimator.html`, `estimator.css`, and `estimator.js` on your web server.
2.  **Edit `estimator.js`:** Open the `estimator.js` file and find the following line:

    ```javascript
    const webhookUrl = 'YOUR_N8N_WEBHOOK_URL'; // IMPORTANT: Replace with your actual webhook URL
    ```

3.  **Replace the placeholder URL:** Change `'YOUR_N8N_WEBHOOK_URL'` to the actual URL of your n8n webhook trigger. For example: `https://your-n8n-instance.com/webhook/estimate-request`.

4.  **Done:** The estimator page is now ready to be used.

## N8N Workflow Requirements

The backend n8n workflow should be configured as follows:

-   **Webhook Trigger:**
    -   Must accept `POST` requests.
    -   Must be able to handle both `application/json` and `multipart/form-data`.
-   **Input Data:**
    -   The webhook will receive an `inputType` field, which will be either `'text'` or `'pdf'`.
    -   The project details and zip code will be in a `description` field (e.g., `Zip Code: 90210\n\nProject Description: ...`).
    -   For file submissions, the PDF file will be attached under the field name `file`.
-   **Response Data:**
    -   The workflow should return a JSON object with the estimate details. The frontend is designed to parse a structure containing keys like `projectSummary`, `lineItems`, and `costBreakdown`.
