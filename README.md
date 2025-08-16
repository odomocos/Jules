# Construction Estimating Agent Frontend

This project is a one-page frontend for a remodeling and construction estimating agent. It provides a user-friendly chat interface for users to submit their project details, either as a text description or a PDF blueprint file. The frontend is designed to integrate with an n8n (or similar) webhook backend that processes the data and returns a detailed cost estimate.

This frontend is built with vanilla HTML, CSS, and JavaScript, and is designed to be easily integrated into an existing website.

## Features

-   **Dual Input Modes:** Users can either type a description of their project or upload a PDF file (e.g., a blueprint).
-   **Dynamic UI:** The interface is clean and modern, with a chat-style interaction model.
-   **File Uploads:** Supports PDF file uploads, sending them as `multipart/form-data`.
-   **Text Submissions:** Sends project descriptions as `application/json`.
-   **Asynchronous Communication:** Communicates with a webhook backend without reloading the page.
-   **Formatted Results:** Displays the returned estimate in a structured and easy-to-read format, including a project summary, line items, and a cost breakdown.
-   **Responsive Design:** The interface is designed to work well on different screen sizes.

## Setup and Configuration

To use this frontend, you need to configure it to point to your n8n webhook URL.

1.  **Clone or download the files:** Get the `index.html`, `style.css`, and `script.js` files.
2.  **Edit `script.js`:** Open the `script.js` file and find the following line:

    ```javascript
    const webhookUrl = 'YOUR_N8N_WEBHOOK_URL'; // IMPORTANT: Replace with your actual webhook URL
    ```

3.  **Replace the placeholder URL:** Change `'YOUR_N8N_WEBHOOK_URL'` to the actual URL of your n8n webhook trigger.

4.  **Deploy:** Host the files on a web server. You can use any static site hosting service, or run it locally for testing.

## N8N Workflow Requirements

The backend n8n workflow should be configured as follows:

-   **Webhook Trigger:**
    -   Must accept `POST` requests.
    -   Must be able to handle both `application/json` and `multipart/form-data` content types.
    -   The path should correspond to the URL you configured (e.g., `/estimate-request`).
-   **Input Data:**
    -   The webhook will receive an `inputType` field, which will be either `'text'` or `'pdf'`.
    -   For text submissions, the project details will be in a `description` field.
    -   For file submissions, the PDF file will be attached under the field name `file`.
-   **Response Data:**
    -   The workflow should return a JSON object with the estimate details. The frontend is designed to parse a structure like the one below:
        ```json
        {
          "projectSummary": {
            "totalSquareFootage": 250,
            "complexityLevel": "standard",
            "workTypes": ["kitchen remodel", "bathroom remodel"]
          },
          "lineItems": [
            {
              "description": "Kitchen - kitchen remodel",
              "quantity": 150,
              "unit": "sq ft",
              "rate": 150,
              "amount": 22500
            }
          ],
          "costBreakdown": {
            "laborCost": 34500,
            "materialsMarkup": 5175,
            "contingency": 3450,
            "subtotal": 43125,
            "tax": 3450,
            "grandTotal": 46575
          },
          "formattedTotal": "$46,575.00"
        }
        ```
