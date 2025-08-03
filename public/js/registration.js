// Registration form functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous messages
        utils.hide(successMessage);
        utils.hide(errorMessage);
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            position_type: formData.get('position_type'),
            department: formData.get('department'),
            experience: formData.get('experience'),
            motivation: formData.get('motivation'),
            availability: formData.get('availability')
        };
        
        // Basic validation
        if (!data.name || !data.email || !data.position_type || !data.department) {
            showError('Please fill in all required fields.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;
        
        try {
            // Submit form data
            const response = await fetch('/api/applicants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success
                showSuccess();
                form.reset();
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Error from server
                showError(result.error || 'An error occurred while submitting your application.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Restore button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
    
    // Show success message
    function showSuccess() {
        utils.show(successMessage);
        setTimeout(() => {
            utils.hide(successMessage);
        }, 5000); // Hide after 5 seconds
    }
    
    // Show error message
    function showError(message) {
        errorText.textContent = message;
        utils.show(errorMessage);
        
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            utils.hide(errorMessage);
        }, 8000); // Hide after 8 seconds
    }
    
    // Real-time email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.style.borderColor = '#dc2626';
            this.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
        } else {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        }
    });
    
    // Character counter for text areas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = 1000; // Set reasonable limit
        
        // Create character counter
        const counter = document.createElement('div');
        counter.style.cssText = 'font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; text-align: right;';
        counter.textContent = `0 / ${maxLength}`;
        textarea.parentNode.appendChild(counter);
        
        // Update counter on input
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length} / ${maxLength}`;
            
            if (length > maxLength * 0.9) {
                counter.style.color = '#dc2626';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
            
            // Prevent exceeding limit
            if (length > maxLength) {
                this.value = this.value.substring(0, maxLength);
                counter.textContent = `${maxLength} / ${maxLength}`;
            }
        });
    });
    
    // Auto-resize textareas
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
});