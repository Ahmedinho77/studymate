// Community Events JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Community events page loaded');
    
    // Mobile menu toggle (same as before)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('active');
            
            if (menu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
                document.body.style.overflow = 'hidden';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu when clicking links
        const navLinks = document.querySelectorAll('.menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = 'auto';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && 
                !menu.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                menu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Handle Register Now button clicks
    const registerButtons = document.querySelectorAll('.register-btn');
    
    registerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent immediate navigation
            
            // Store event data in localStorage
            const eventData = {
                type: this.getAttribute('data-event-type'),
                title: this.getAttribute('data-event-title'),
                date: this.getAttribute('data-event-date'),
                time: this.getAttribute('data-event-time'),
                instructor: this.getAttribute('data-event-instructor'),
                description: this.getAttribute('data-event-description'),
                duration: this.getAttribute('data-event-duration'),
                spots: this.getAttribute('data-event-spots'),
                price: this.getAttribute('data-event-price'),
                month: this.closest('.event-card').querySelector('.event-month').textContent,
                day: this.closest('.event-card').querySelector('.event-day').textContent
            };
            
            console.log('Registering for event:', eventData);
            
            // Save event data to localStorage
            localStorage.setItem('selectedEvent', JSON.stringify(eventData));
            
            // Store in sessionStorage as backup
            sessionStorage.setItem('currentEvent', JSON.stringify(eventData));
            
            // Optional: Show loading/confirmation message
            showRegistrationConfirmation(eventData);
            
            // Navigate to registration page after a brief delay
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 500);
        });
    });
    
    // Optional: Show confirmation message
    function showRegistrationConfirmation(eventData) {
        // Create a temporary confirmation message
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        confirmation.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>Redirecting to registration...</strong>
                <div style="font-size: 0.9em; opacity: 0.9;">
                    Registering for: ${eventData.title}
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Remove after 3 seconds
        setTimeout(() => {
            confirmation.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 300);
        }, 2500);
        
        // Add CSS animations
        if (!document.querySelector('#confirmation-styles')) {
            const style = document.createElement('style');
            style.id = 'confirmation-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Update event card styling on hover
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
});