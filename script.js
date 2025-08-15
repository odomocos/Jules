document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('lead-form');

    if (leadForm) {
        leadForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // --- Form Validation ---
            const name = leadForm.querySelector('[name="name"]').value.trim();
            const email = leadForm.querySelector('[name="email"]').value.trim();
            const phone = leadForm.querySelector('[name="phone"]').value.trim();
            const zip = leadForm.querySelector('[name="zip"]').value.trim();

            if (!name || !email || !phone || !zip) {
                alert('Please fill out all required fields.');
                return;
            }

            // --- Data Simulation ---
            const formData = {
                name: name,
                email: email,
                phone: phone,
                zip: zip,
                description: leadForm.querySelector('[name="description"]').value.trim()
            };

            // In a real application, you would send this data to your backend API
            // fetch('/api/leads', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            'body': JSON.stringify(formData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     console.log('Success:', data);
            //     alert('Thank you! Your request has been submitted.');
            //     leadForm.reset();
            // })
            // .catch((error) => {
            //     console.error('Error:', error);
            //     alert('There was an error submitting your request. Please try again.');
            // });

            // Simulate a successful submission for this example
            console.log('Form data that would be sent to the backend:', formData);
            alert('Thank you for your request! A contractor will contact you shortly.');
            leadForm.reset();
        });
    }
});
