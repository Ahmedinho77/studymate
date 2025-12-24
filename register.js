// Registration Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration page loaded');
    
    // Mobile menu toggle
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
    
    // Load event data from localStorage
    function loadEventData() {
        const eventData = JSON.parse(localStorage.getItem('selectedEvent') || sessionStorage.getItem('currentEvent'));
        
        if (eventData) {
            console.log('Loading event data:', eventData);
            
            // Update page title
            document.title = `Register: ${eventData.title} - StudyMate`;
            
            // Update event date display
            const eventDateLarge = document.querySelector('.event-date-large');
            if (eventDateLarge) {
                // Parse the date properly
                const dateParts = eventData.date.split(' ');
                const year = dateParts.length >= 3 ? dateParts[2] : '2025';
                
                eventDateLarge.innerHTML = `
                    <span class="event-day">${eventData.day}</span>
                    <span class="event-month">${eventData.month}</span>
                    <span class="event-year">${year}</span>
                `;
            }
            
            // Update event title
            const eventTitle = document.querySelector('.event-title h2');
            if (eventTitle) {
                eventTitle.textContent = eventData.title;
            }
            
            // Update event badge
            const eventBadge = document.querySelector('.event-badge');
            if (eventBadge) {
                // Capitalize first letter of event type
                const typeText = eventData.type.charAt(0).toUpperCase() + eventData.type.slice(1);
                eventBadge.textContent = typeText;
                eventBadge.className = `event-badge ${eventData.type}`;
                
                // Update badge color based on type
                const badgeColors = {
                    webinar: { bg: 'rgba(108, 92, 231, 0.1)', color: '#6c5ce7' },
                    qna: { bg: 'rgba(0, 184, 148, 0.1)', color: '#00b894' },
                    workshop: { bg: 'rgba(253, 121, 168, 0.1)', color: '#fd79a8' },
                    studygroup: { bg: 'rgba(253, 203, 110, 0.1)', color: '#fdcb6e' }
                };
                
                if (badgeColors[eventData.type]) {
                    eventBadge.style.backgroundColor = badgeColors[eventData.type].bg;
                    eventBadge.style.color = badgeColors[eventData.type].color;
                }
            }
            
            // Update instructor
            const instructorSpan = document.querySelector('.event-instructor span');
            if (instructorSpan) {
                instructorSpan.textContent = eventData.instructor;
            }
            
            // Update time info
            const timeInfo = document.querySelector('.event-info .info-item:nth-child(1) p');
            if (timeInfo) {
                timeInfo.textContent = `${eventData.time} (${eventData.duration})`;
            }
            
            // Update date info
            const dateInfo = document.querySelector('.event-info .info-item:nth-child(2) p');
            if (dateInfo) {
                dateInfo.textContent = eventData.date;
            }
            
            // Update spots info
            const spotsSpan = document.querySelector('.spots-left');
            if (spotsSpan) {
                spotsSpan.textContent = eventData.spots;
            }
            
            // Update event description
            const eventDescription = document.querySelector('.event-description');
            if (eventDescription) {
                const firstP = eventDescription.querySelector('p');
                if (firstP) {
                    firstP.textContent = eventData.description;
                }
                
                // Also update the list items based on event type
                const ul = eventDescription.querySelector('ul');
                if (ul) {
                    if (eventData.type === 'webinar') {
                        ul.innerHTML = `
                            <li>Learn effective time management strategies</li>
                            <li>Master active recall and spaced repetition techniques</li>
                            <li>Discover how to create effective study schedules</li>
                            <li>Get tips for reducing exam anxiety</li>
                            <li>Learn memory improvement techniques</li>
                        `;
                    } else if (eventData.type === 'qna') {
                        ul.innerHTML = `
                            <li>Get your specific questions answered in real-time</li>
                            <li>Understand complex organic chemistry concepts</li>
                            <li>Learn problem-solving strategies for exams</li>
                            <li>Receive personalized guidance on challenging topics</li>
                            <li>Connect with peers facing similar challenges</li>
                        `;
                    } else if (eventData.type === 'workshop') {
                        ul.innerHTML = `
                            <li>Learn to prioritize tasks effectively</li>
                            <li>Create personalized study schedules</li>
                            <li>Balance academic and personal commitments</li>
                            <li>Overcome procrastination habits</li>
                            <li>Use technology to boost productivity</li>
                        `;
                    } else if (eventData.type === 'studygroup') {
                        ul.innerHTML = `
                            <li>Collaborate with peers on challenging problems</li>
                            <li>Explain concepts to reinforce your understanding</li>
                            <li>Get multiple perspectives on difficult topics</li>
                            <li>Build a support network for your studies</li>
                            <li>Stay motivated through group accountability</li>
                        `;
                    }
                }
            }
            
            // Update form price
            const priceFree = document.querySelector('.price-free');
            if (priceFree) {
                priceFree.textContent = eventData.price;
            }
            
            // Store event title in form for reference
            const form = document.getElementById('registrationForm');
            if (form) {
                // Remove existing hidden input if present
                const existingInput = form.querySelector('input[name="eventTitle"]');
                if (existingInput) {
                    existingInput.remove();
                }
                
                // Add new hidden input
                const eventInput = document.createElement('input');
                eventInput.type = 'hidden';
                eventInput.name = 'eventTitle';
                eventInput.value = eventData.title;
                form.appendChild(eventInput);
            }
            
            // Update registration form header with event name
            const formHeader = document.querySelector('.form-header h3');
            if (formHeader) {
                formHeader.innerHTML = `<i class="fas fa-user-plus"></i> Register for: ${eventData.title}`;
            }
            
        } else {
            console.log('No event data found, using default Organic Chemistry Q&A');
            // Set default event if none is selected
            const defaultEvent = {
                type: 'qna',
                title: 'Organic Chemistry Live Q&A',
                date: 'December 18, 2025',
                time: '6:30 PM EST',
                instructor: 'Prof. James Wilson',
                description: 'Get your questions answered by a chemistry professor specializing in organic chemistry.',
                duration: '90 minutes',
                spots: '47',
                price: 'FREE',
                month: 'DEC',
                day: '18'
            };
            localStorage.setItem('selectedEvent', JSON.stringify(defaultEvent));
            loadEventData(); // Reload with default data
        }
    }
    
    // Load event data when page loads
    loadEventData();
    
    // Registration Form Handling
    const registrationForm = document.getElementById('registrationForm');
    const confirmationModal = document.getElementById('confirmationModal');
    const userEmailSpan = document.getElementById('userEmail');
    const closeModal = document.querySelector('.close-modal');
    const goToCommunityBtn = document.getElementById('goToCommunity');
    const addToCalendarBtn = document.getElementById('addToCalendar');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const userEmail = formData.get('email');
            const eventTitle = formData.get('eventTitle');
            
            // Show confirmation modal
            userEmailSpan.textContent = userEmail;
            confirmationModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Update confirmation modal with event-specific info
            const eventData = JSON.parse(localStorage.getItem('selectedEvent') || sessionStorage.getItem('currentEvent'));
            if (eventData) {
                const modalTitle = confirmationModal.querySelector('.modal-header h3');
                if (modalTitle) {
                    modalTitle.innerHTML = `Registered for: ${eventData.title}`;
                }
                
                const modalBody = confirmationModal.querySelector('.modal-body p');
                if (modalBody) {
                    modalBody.textContent = `Thank you for registering for "${eventData.title}"!`;
                }
            }
            
            // You would typically send form data to a server here
            console.log('Registration submitted:', {
                event: eventTitle,
                name: formData.get('fullName'),
                email: userEmail,
                phone: formData.get('phone'),
                university: formData.get('university'),
                course: formData.get('course'),
                questions: formData.get('questions'),
                experience: formData.get('experience'),
                newsletter: formData.get('newsletter') ? 'yes' : 'no',
                timestamp: new Date().toISOString()
            });
            
            // Clear localStorage after successful registration
            setTimeout(() => {
                localStorage.removeItem('selectedEvent');
                sessionStorage.removeItem('currentEvent');
            }, 5000);
        });
    }
    
    // Modal close button
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            confirmationModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal when clicking outside
    if (confirmationModal) {
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Go to Community button
    if (goToCommunityBtn) {
        goToCommunityBtn.addEventListener('click', function() {
            window.location.href = 'community.html';
        });
    }
    
    // Add to Calendar button
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', function() {
            const eventData = JSON.parse(localStorage.getItem('selectedEvent') || sessionStorage.getItem('currentEvent'));
            
            if (!eventData) {
                alert('Event data not found. Please register again.');
                return;
            }
            
            // Create calendar event data
            const calendarData = {
                title: eventData.title,
                description: eventData.description + '\n\nRegistered via StudyMate Community Events',
                location: 'Zoom Webinar (Link sent via email)',
                instructor: eventData.instructor,
                duration: eventData.duration
            };
            
            // Parse the date and time
            const dateStr = eventData.date; // e.g., "December 18, 2025"
            const timeStr = eventData.time; // e.g., "6:30 PM EST"
            
            // Create .ics file content
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//StudyMate//Community Events//EN',
                'BEGIN:VEVENT',
                `SUMMARY:${calendarData.title}`,
                `DESCRIPTION:${calendarData.description}\\n\\nInstructor: ${calendarData.instructor}\\nDuration: ${calendarData.duration}`,
                `LOCATION:${calendarData.location}`,
                'STATUS:CONFIRMED',
                'CATEGORIES:EDUCATION,STUDY',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');
            
            // Create download link
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `StudyMate-${eventData.title.replace(/\s+/g, '-')}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success message
            alert('Calendar event file downloaded! Import it into your calendar application (Google Calendar, Outlook, Apple Calendar, etc.)');
        });
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = value.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                e.target.value = !value[2] ? value[1] : '(' + value[1] + ') ' + value[2] + (value[3] ? '-' + value[3] : '');
            }
        });
    }
    
    // Character counter for questions textarea
    const questionsTextarea = document.getElementById('questions');
    if (questionsTextarea) {
        // Create character counter
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            font-size: 0.8rem;
            color: #636e72;
            text-align: right;
            margin-top: 0.5rem;
            font-family: inherit;
        `;
        questionsTextarea.parentNode.appendChild(counter);
        
        function updateCounter() {
            const count = questionsTextarea.value.length;
            counter.textContent = `${count}/500 characters`;
            
            if (count > 500) {
                counter.style.color = '#e74c3c';
                questionsTextarea.style.borderColor = '#e74c3c';
            } else {
                counter.style.color = '#636e72';
                questionsTextarea.style.borderColor = '#e9ecef';
            }
        }
        
        questionsTextarea.addEventListener('input', updateCounter);
        updateCounter();
        
        // Add maxlength attribute
        questionsTextarea.setAttribute('maxlength', '500');
    }
    
    // Form validation for course selection
    const courseSelect = document.getElementById('course');
    if (courseSelect) {
        courseSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                // Create text input for other course
                const otherInput = document.createElement('input');
                otherInput.type = 'text';
                otherInput.id = 'courseOther';
                otherInput.name = 'courseOther';
                otherInput.placeholder = 'Please specify your course';
                otherInput.style.cssText = `
                    margin-top: 0.5rem;
                    width: 100%;
                    padding: 0.8rem;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: #f8f9fa;
                    font-family: inherit;
                `;
                
                // Add focus styling
                otherInput.addEventListener('focus', function() {
                    this.style.borderColor = '#6c5ce7';
                    this.style.backgroundColor = 'white';
                    this.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.1)';
                });
                
                otherInput.addEventListener('blur', function() {
                    this.style.borderColor = '#e9ecef';
                    this.style.backgroundColor = '#f8f9fa';
                    this.style.boxShadow = 'none';
                });
                
                // Check if input already exists
                const existingInput = document.getElementById('courseOther');
                if (!existingInput) {
                    this.parentNode.appendChild(otherInput);
                }
            } else {
                // Remove other input if it exists
                const existingInput = document.getElementById('courseOther');
                if (existingInput) {
                    existingInput.parentNode.removeChild(existingInput);
                }
            }
        });
    }
    
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form field validation styling
    const formInputs = document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.style.borderColor = '#e74c3c';
                this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
            } else {
                this.style.borderColor = '#e9ecef';
                this.style.boxShadow = 'none';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6c5ce7';
            this.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.1)';
            this.style.backgroundColor = 'white';
        });
    });
});