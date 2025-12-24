// Complete JavaScript for All Navigation Tabs and Buttons with Login Verification

// ============= USER AUTHENTICATION SYSTEM =============
class AuthSystem {
    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' || 
               localStorage.getItem('studymate_is_logged_in') === 'true';
    }
    
    static getCurrentUser() {
        // Try new format first
        const newUser = localStorage.getItem('currentUser');
        if (newUser) {
            return JSON.parse(newUser);
        }
        
        // Try old format
        const oldUser = localStorage.getItem('studymate_current_user');
        if (oldUser) {
            const parsed = JSON.parse(oldUser);
            return {
                id: parsed.userId,
                email: parsed.email,
                name: parsed.fullName,
                userType: parsed.userType
            };
        }
        return null;
    }
    
    static setLoggedIn(user) {
        // Set in both formats for compatibility
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        localStorage.setItem('studymate_is_logged_in', 'true');
        localStorage.setItem('studymate_current_user', JSON.stringify({
            userId: user.id,
            email: user.email,
            fullName: user.name,
            userType: user.userType,
            loginTime: new Date().toISOString(),
            isLoggedIn: true
        }));
    }
    
    static logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('studymate_is_logged_in');
        localStorage.removeItem('studymate_current_user');
        sessionStorage.removeItem('welcomeShown');
    }
    
    static requireLogin(callback) {
        if (!this.isLoggedIn()) {
            showLoginRequiredModal(callback);
            return false;
        }
        return true;
    }
}

// ============= NAVIGATION TABS FUNCTIONALITY =============

// Tab Functionality
document.querySelectorAll('.nav-tabs a').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        const tabId = this.getAttribute('href').replace('#', '');
        const tabName = this.querySelector('span, i').nextSibling?.textContent.trim() || this.textContent.trim();
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tabs a').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Handle different tab actions
        switch(tabId) {
            case 'all-groups':
                showAllGroups();
                break;
            case 'discussions':
                showDiscussions();
                break;
            case 'events':
                showEvents();
                break;
            case 'popular':
                showPopular();
                break;
            case 'create-group':
                if (AuthSystem.requireLogin()) {
                    showCreateGroupModal();
                }
                break;
            case 'my-groups':
                if (AuthSystem.requireLogin()) {
                    showMyGroups();
                }
                break;
            default:
                if (tabId.includes('.html')) {
                    window.location.href = tabId;
                    return;
                }
                showAllGroups();
        }
        
        showNotification(`Switched to ${tabName} view`);
    });
});

// All Groups View
function showAllGroups() {
    document.querySelector('.groups-section').style.display = 'block';
    document.querySelector('.discussions-section').style.display = 'block';
    
    // Show all groups
    document.querySelectorAll('.group-card').forEach(card => {
        card.style.display = 'block';
    });
    
    // Show all discussions
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.style.display = 'block';
    });
    
    // Reset search
    document.querySelector('.search-bar input').value = '';
    document.querySelector('.search-bar input').placeholder = 'Search groups, discussions, or topics...';
}

// Discussions View
function showDiscussions() {
    document.querySelector('.groups-section').style.display = 'none';
    document.querySelector('.discussions-section').style.display = 'block';
    
    // Update search placeholder
    document.querySelector('.search-bar input').placeholder = 'Search discussions...';
    
    // Show all discussions
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.style.display = 'block';
    });
    
    // Load more discussions if needed
    if (document.querySelectorAll('.discussion-item').length < 5) {
        loadMoreDiscussions();
    }
}

// Events View
function showEvents() {
    document.querySelector('.groups-section').style.display = 'none';
    document.querySelector('.discussions-section').style.display = 'none';
    
    // Create or show events content
    let eventsContent = document.querySelector('.events-content');
    if (!eventsContent) {
        eventsContent = document.createElement('div');
        eventsContent.className = 'events-content';
        eventsContent.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-calendar"></i> Upcoming Events</h2>
                <div class="section-actions">
                    <button class="btn btn-primary" id="createEventBtn">
                        <i class="fas fa-plus"></i>
                        Create Event
                    </button>
                    <button class="btn btn-secondary" id="viewCalendar">
                        <i class="fas fa-calendar-alt"></i>
                        View Calendar
                    </button>
                </div>
            </div>
            <div class="events-grid" id="eventsGrid">
                <!-- Events will be loaded here -->
            </div>
        `;
        document.querySelector('.main-content').appendChild(eventsContent);
    }
    
    eventsContent.style.display = 'block';
    
    // Load events
    loadEvents();
    
    // Update search placeholder
    document.querySelector('.search-bar input').placeholder = 'Search events...';
}

// Popular View
function showPopular() {
    document.querySelector('.groups-section').style.display = 'block';
    document.querySelector('.discussions-section').style.display = 'block';
    
    const popularThreshold = 80; // Lower threshold for demo
    
    // Filter groups by member count
    document.querySelectorAll('.group-card').forEach(card => {
        const memberText = card.querySelector('.members-count').textContent;
        const memberCount = parseInt(memberText.match(/\d+/)[0]) || 0;
        card.style.display = memberCount >= popularThreshold ? 'block' : 'none';
    });
    
    // Filter discussions by views
    document.querySelectorAll('.discussion-item').forEach(item => {
        const viewsText = item.querySelector('.meta-item:nth-child(4)').textContent;
        const views = parseInt(viewsText.match(/\d+/)[0]) || 0;
        item.style.display = views >= popularThreshold ? 'block' : 'none';
    });
    
    document.querySelector('.search-bar input').placeholder = 'Search popular content...';
}

// My Groups View
function showMyGroups() {
    document.querySelector('.groups-section').style.display = 'block';
    document.querySelector('.discussions-section').style.display = 'block';
    
    // Filter to show only joined groups
    document.querySelectorAll('.group-card').forEach(card => {
        const joinBtn = card.querySelector('.join-btn');
        const isJoined = joinBtn.classList.contains('joined');
        card.style.display = isJoined ? 'block' : 'none';
    });
    
    // Show all discussions in my groups view
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.style.display = 'block';
    });
    
    document.querySelector('.search-bar input').placeholder = 'Search my groups and discussions...';
}

// ============= LOGIN REQUIRED MODAL =============
function showLoginRequiredModal(callback = null) {
    const modalHTML = `
        <div class="modal-overlay active" id="loginRequiredModal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <i class="fas fa-user-lock" style="color: #6c5ce7; font-size: 2rem; margin-right: 1rem;"></i>
                    <h3>Login Required</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="modal-icon">
                        <i class="fas fa-sign-in-alt"></i>
                    </div>
                    <h4>You need to log in to continue</h4>
                    <p>Please log in or create an account to join groups, create events, and access all community features.</p>
                    
                    <div class="login-options">
                        <a href="login.html?redirect=${encodeURIComponent(window.location.href)}" class="login-btn primary">
                            <i class="fas fa-sign-in-alt"></i>
                            Log In
                        </a>
                        <a href="signUp.html?redirect=${encodeURIComponent(window.location.href)}" class="login-btn secondary">
                            <i class="fas fa-user-plus"></i>
                            Sign Up
                        </a>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeLoginModal">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Close modal functionality
    function closeLoginModal() {
        modalContainer.remove();
        if (callback) {
            callback();
        }
    }
    
    modalContainer.querySelector('.close-modal').addEventListener('click', closeLoginModal);
    modalContainer.querySelector('#closeLoginModal').addEventListener('click', closeLoginModal);
    
    // Store callback in localStorage for after login
    if (callback) {
        // Store the current URL for redirect
        localStorage.setItem('redirectAfterLogin', window.location.href);
        // Store callback reference
        localStorage.setItem('afterLoginAction', 'community_action');
    }
    
    // Close on overlay click
    modalContainer.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLoginModal();
        }
    });
}

// ============= EVENT REGISTRATION FUNCTIONALITY =============

// Register for Event Button
document.addEventListener('click', function(e) {
    if (e.target.closest('.register-event') || e.target.closest('.view-details')) {
        e.preventDefault();
        
        if (e.target.closest('.register-event')) {
            // Check if user is logged in
            if (!AuthSystem.requireLogin(() => {
                const eventCard = e.target.closest('.event-card');
                // Store event info for after login
                const eventTitle = eventCard.querySelector('.event-card-title').textContent;
                localStorage.setItem('pendingEventRegistration', eventTitle);
                localStorage.setItem('redirectAfterLogin', window.location.href);
            })) {
                return;
            }
            // Register button clicked
            const eventCard = e.target.closest('.event-card');
            registerForEvent(eventCard);
        } else if (e.target.closest('.view-details')) {
            // View Details button clicked
            const eventCard = e.target.closest('.event-card');
            const eventTitle = eventCard.querySelector('.event-card-title').textContent;
            showEventDetailsModal(eventTitle);
        }
    }
});

function registerForEvent(eventCard) {
    const user = AuthSystem.getCurrentUser();
    if (!user) {
        showLoginRequiredModal(() => registerForEvent(eventCard));
        return;
    }
    
    const eventTitle = eventCard.querySelector('.event-card-title').textContent;
    const eventCategory = eventCard.querySelector('.event-category').textContent;
    const eventDate = eventCard.querySelector('.info-item:nth-child(1) span').textContent;
    const eventTime = eventCard.querySelector('.info-item:nth-child(2) span').textContent;
    const eventHost = eventCard.querySelector('.info-item:nth-child(3) span').textContent;
    const spotsElement = eventCard.querySelector('.info-item:nth-child(4) span');
    const availableSpots = parseInt(spotsElement.textContent) || 0;
    
    // Decrease available spots
    if (availableSpots > 0) {
        const newSpots = availableSpots - 1;
        spotsElement.textContent = newSpots;
        eventCard.querySelector('.info-item:nth-child(4) p').innerHTML = 
            `<span class="spots-left">${newSpots}</span> out of 100 spots remaining`;
        
        // Store event data for registration page
        const eventData = {
            type: eventCategory.toLowerCase(),
            title: eventTitle,
            date: eventDate,
            time: eventTime,
            instructor: eventHost,
            description: eventCard.querySelector('.event-description')?.textContent || "Live interactive session with expert instructor",
            duration: "90 minutes",
            spots: newSpots.toString(),
            price: "FREE",
            month: eventDate.split(' ')[1]?.substring(0, 3)?.toUpperCase() || 'DEC',
            day: eventDate.split(' ')[1]?.replace(',', '') || '18'
        };
        
        // Store in localStorage for registration page
        localStorage.setItem('selectedEvent', JSON.stringify(eventData));
        
        // Show registration modal
        showRegistrationModal(eventTitle, eventData);
        
        showNotification(`Registered for "${eventTitle}"! Redirecting to registration form...`);
        
        // Redirect to registration page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 1500);
        
        // Update register button state
        const registerBtn = eventCard.querySelector('.register-event');
        registerBtn.innerHTML = '<i class="fas fa-check"></i> Registered';
        registerBtn.classList.add('registered');
        registerBtn.disabled = true;
        
    } else {
        showNotification('Sorry, no spots available for this event', 'error');
    }
}

function showEventDetailsModal(eventTitle) {
    const modalHTML = `
        <div class="modal-overlay active" id="eventDetailsModal">
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <i class="fas fa-calendar-alt" style="color: #6c5ce7; font-size: 2rem; margin-right: 1rem;"></i>
                    <h3>Event Details: ${eventTitle}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="event-details-content">
                        <div class="event-detail-section">
                            <h4><i class="fas fa-info-circle"></i> Description</h4>
                            <p>This is a detailed description of the event. You'll learn about various topics and interact with the instructor in real-time.</p>
                        </div>
                        
                        <div class="event-detail-section">
                            <h4><i class="fas fa-list-check"></i> What You'll Learn</h4>
                            <ul>
                                <li>Key concepts and principles</li>
                                <li>Practical applications</li>
                                <li>Problem-solving strategies</li>
                                <li>Best practices and tips</li>
                            </ul>
                        </div>
                        
                        <div class="event-detail-section">
                            <h4><i class="fas fa-user-graduate"></i> Instructor Bio</h4>
                            <p>Expert instructor with years of experience in the field. Dedicated to helping students succeed.</p>
                        </div>
                        
                        <div class="event-detail-section">
                            <h4><i class="fas fa-clock"></i> Schedule</h4>
                            <p><strong>Duration:</strong> 90 minutes</p>
                            <p><strong>Format:</strong> Live webinar with Q&A session</p>
                            <p><strong>Platform:</strong> Zoom (link provided after registration)</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeEventDetails">
                        Close
                    </button>
                    <button class="modal-btn primary" id="registerFromDetails">
                        <i class="fas fa-calendar-plus"></i>
                        Register Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .event-details-content {
            padding: 1rem 0;
        }
        
        .event-detail-section {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e9ecef;
        }
        
        .event-detail-section:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .event-detail-section h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #2d3436;
            margin-bottom: 0.8rem;
        }
        
        .event-detail-section h4 i {
            color: #6c5ce7;
        }
        
        .event-detail-section p, .event-detail-section li {
            color: #636e72;
            line-height: 1.6;
        }
        
        .event-detail-section ul {
            padding-left: 1.5rem;
            margin: 0;
        }
        
        .event-detail-section li {
            margin-bottom: 0.5rem;
        }
    `;
    document.head.appendChild(modalStyles);
    
    // Close modal functionality
    modalContainer.querySelector('.close-modal').addEventListener('click', function() {
        modalContainer.remove();
        modalStyles.remove();
    });
    
    modalContainer.querySelector('#closeEventDetails').addEventListener('click', function() {
        modalContainer.remove();
        modalStyles.remove();
    });
    
    // Register from details modal
    modalContainer.querySelector('#registerFromDetails').addEventListener('click', function() {
        modalContainer.remove();
        modalStyles.remove();
        
        // Check if user is logged in
        if (!AuthSystem.requireLogin()) {
            // Store event info for after login
            localStorage.setItem('pendingEventRegistration', eventTitle);
            localStorage.setItem('redirectAfterLogin', window.location.href);
            return;
        }
        
        showNotification('Redirecting to registration...');
        // Find and click the register button for this event
        const events = document.querySelectorAll('.event-card');
        events.forEach(event => {
            if (event.querySelector('.event-card-title').textContent === eventTitle) {
                registerForEvent(event);
            }
        });
    });
    
    // Close on overlay click
    modalContainer.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            modalContainer.remove();
            modalStyles.remove();
        }
    });
}

// ============= BUTTON FUNCTIONALITY =============

// 1. Filter Button
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-secondary') && e.target.closest('.btn-secondary').textContent.includes('Filter')) {
        e.preventDefault();
        showFilterModal();
    }
});

// 2. Create Group Button
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').textContent.includes('Create Group')) {
        e.preventDefault();
        if (AuthSystem.requireLogin()) {
            showCreateGroupModal();
        }
    }
});

// 3. View Calendar Button
document.addEventListener('click', function(e) {
    if (e.target.closest('#viewCalendar')) {
        e.preventDefault();
        showCalendarView();
    }
});

// 4. Create Event Button
document.addEventListener('click', function(e) {
    if (e.target.closest('#createEventBtn')) {
        e.preventDefault();
        if (AuthSystem.requireLogin()) {
            showCreateEventModal();
        }
    }
});

// 5. New Discussion Button
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').textContent.includes('New Discussion')) {
        e.preventDefault();
        if (AuthSystem.requireLogin()) {
            showNewDiscussionModal();
        }
    }
});

// 6. Discussion Filter Buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.filter-btn')) {
        const filterBtn = e.target.closest('.filter-btn');
        const filterValue = filterBtn.textContent.trim();
        
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        filterBtn.classList.add('active');
        
        // Filter discussions
        filterDiscussions(filterValue);
    }
});

// 7. Join Group Functionality (Updated with login check)
document.addEventListener('click', function(e) {
    if (e.target.closest('.join-btn')) {
        const joinBtn = e.target.closest('.join-btn');
        
        // Check if user is logged in
        if (!AuthSystem.requireLogin(() => {
            // Store group info for after login
            const groupCard = joinBtn.closest('.group-card');
            const groupTitle = groupCard.querySelector('.group-title').textContent;
            localStorage.setItem('pendingGroupJoin', groupTitle);
            localStorage.setItem('redirectAfterLogin', window.location.href);
        })) {
            return;
        }
        
        const groupCard = joinBtn.closest('.group-card');
        const groupTitle = groupCard.querySelector('.group-title').textContent;
        const membersCount = groupCard.querySelector('.members-count');
        let currentCount = parseInt(membersCount.textContent.match(/\d+/)[0]) || 0;
        
        if (joinBtn.classList.contains('joined')) {
            // Leave group
            joinBtn.classList.remove('joined');
            joinBtn.innerHTML = '<i class="fas fa-plus"></i> Leave Group';
            currentCount = Math.max(0, currentCount - 1);
            showNotification(`Left "${groupTitle}"`);
        } else {
            // Join group
            joinBtn.classList.add('joined');
            joinBtn.innerHTML = '<i class="fas fa-check"></i> Joined';
            currentCount += 1;
            showNotification(`Joined "${groupTitle}" successfully!`);
        }
        
        membersCount.innerHTML = `<i class="fas fa-users"></i> ${currentCount} ${currentCount === 1 ? 'member' : 'members'}`;
    }
});

// ============= CREATE EVENT MODAL =============
function showCreateEventModal() {
    const user = AuthSystem.getCurrentUser();
    if (!user) {
        showLoginRequiredModal(showCreateEventModal);
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay active" id="createEventModal">
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <i class="fas fa-calendar-plus" style="color: #6c5ce7; font-size: 2.5rem; margin-right: 1rem;"></i>
                    <h3>Create New Event</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <form id="createEventForm">
                        <div class="form-group">
                            <label for="eventTitle">Event Title *</label>
                            <input type="text" id="eventTitle" name="eventTitle" placeholder="e.g., Organic Chemistry Q&A Session" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="eventType">Event Type *</label>
                            <div class="event-type-options">
                                <div class="event-type-option" data-type="webinar">
                                    <input type="radio" id="type-webinar" name="eventType" value="webinar" checked>
                                    <label for="type-webinar">
                                        <i class="fas fa-video"></i>
                                        <span>Webinar</span>
                                    </label>
                                </div>
                                <div class="event-type-option" data-type="qna">
                                    <input type="radio" id="type-qna" name="eventType" value="qna">
                                    <label for="type-qna">
                                        <i class="fas fa-question-circle"></i>
                                        <span>Q&A Session</span>
                                    </label>
                                </div>
                                <div class="event-type-option" data-type="workshop">
                                    <input type="radio" id="type-workshop" name="eventType" value="workshop">
                                    <label for="type-workshop">
                                        <i class="fas fa-tools"></i>
                                        <span>Workshop</span>
                                    </label>
                                </div>
                                <div class="event-type-option" data-type="studygroup">
                                    <input type="radio" id="type-studygroup" name="eventType" value="studygroup">
                                    <label for="type-studygroup">
                                        <i class="fas fa-users"></i>
                                        <span>Study Group</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="datetime-group">
                            <div class="datetime-item">
                                <label for="eventDate">Date *</label>
                                <input type="date" id="eventDate" name="eventDate" required min="2025-12-01">
                            </div>
                            <div class="datetime-item">
                                <label for="eventTime">Time *</label>
                                <input type="time" id="eventTime" name="eventTime" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="eventDuration">Duration *</label>
                                <select id="eventDuration" name="eventDuration" required>
                                    <option value="30">30 minutes</option>
                                    <option value="60" selected>60 minutes</option>
                                    <option value="90">90 minutes</option>
                                    <option value="120">2 hours</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="eventMaxParticipants">Maximum Participants</label>
                                <input type="number" id="eventMaxParticipants" name="eventMaxParticipants" placeholder="100" min="1" max="500" value="100">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="eventHost">Host Name *</label>
                            <input type="text" id="eventHost" name="eventHost" placeholder="Your name or instructor name" required value="${user.name || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="eventDescription">Description *</label>
                            <textarea id="eventDescription" name="eventDescription" rows="4" placeholder="Describe your event..." required></textarea>
                        </div>
                        
                        <div class="event-form-notice">
                            <i class="fas fa-info-circle"></i>
                            <p>Your event will be visible to the entire StudyMate community. Make sure to provide clear details so members know what to expect.</p>
                        </div>
                        
                        <div class="event-preview-section">
                            <h4><i class="fas fa-eye"></i> Event Preview</h4>
                            <div class="event-preview-card" id="eventPreview">
                                <div class="preview-header">
                                    <div class="preview-date">
                                        <span class="day">18</span>
                                        <span class="month">DEC</span>
                                    </div>
                                    <div class="preview-title">
                                        <h5>Your Event Title</h5>
                                        <span class="preview-type">Webinar</span>
                                    </div>
                                </div>
                                <div class="preview-details">
                                    <div class="preview-detail">
                                        <i class="fas fa-calendar"></i>
                                        <div>
                                            <h6>Date</h6>
                                            <p>Select a date</p>
                                        </div>
                                    </div>
                                    <div class="preview-detail">
                                        <i class="fas fa-clock"></i>
                                        <div>
                                            <h6>Time</h6>
                                            <p>Select a time</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="preview-description">
                                    Your event description will appear here.
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="cancelEvent">
                        Cancel
                    </button>
                    <button class="modal-btn primary" id="createEvent">
                        <i class="fas fa-calendar-check"></i>
                        Create Event
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    document.getElementById('eventDate').value = dateString;
    
    // Set default time to 6:30 PM
    document.getElementById('eventTime').value = '18:30';
    
    // Update preview when form changes
    const updatePreview = () => {
        const title = document.getElementById('eventTitle').value || 'Your Event Title';
        const type = document.querySelector('input[name="eventType"]:checked').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value || 'Your event description will appear here.';
        
        const eventDate = new Date(date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        
        const previewTitle = modalContainer.querySelector('.preview-title h5');
        const previewType = modalContainer.querySelector('.preview-type');
        const previewDate = modalContainer.querySelector('.preview-date .day');
        const previewMonth = modalContainer.querySelector('.preview-date .month');
        const previewDateText = modalContainer.querySelector('.preview-detail:nth-child(1) p');
        const previewTime = modalContainer.querySelector('.preview-detail:nth-child(2) p');
        const previewDesc = modalContainer.querySelector('.preview-description');
        
        previewTitle.textContent = title;
        previewType.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        previewDate.textContent = day;
        previewMonth.textContent = month;
        previewDateText.textContent = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        previewTime.textContent = formatTime(time);
        previewDesc.textContent = description;
    };
    
    // Add event listeners for preview updates
    modalContainer.querySelectorAll('#eventTitle, #eventDate, #eventTime, #eventDescription, input[name="eventType"]').forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Initial preview update
    updatePreview();
    
    // Close modal functionality
    modalContainer.querySelector('.close-modal').addEventListener('click', function() {
        modalContainer.remove();
    });
    
    modalContainer.querySelector('#cancelEvent').addEventListener('click', function() {
        modalContainer.remove();
    });
    
    // Create event functionality
    modalContainer.querySelector('#createEvent').addEventListener('click', function() {
        const eventTitle = document.getElementById('eventTitle').value;
        const eventType = document.querySelector('input[name="eventType"]:checked').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventHost = document.getElementById('eventHost').value;
        const eventDescription = document.getElementById('eventDescription').value;
        
        if (eventTitle && eventType && eventDate && eventTime && eventHost && eventDescription) {
            const user = AuthSystem.getCurrentUser();
            const eventData = {
                title: eventTitle,
                type: eventType,
                date: eventDate,
                time: eventTime,
                host: eventHost,
                description: eventDescription,
                createdBy: user.name || user.email,
                createdById: user.id || user.email,
                spots: 100
            };
            
            // Save event to localStorage
            saveEventToStorage(eventData);
            
            showNotification(`Created event: "${eventTitle}"`);
            modalContainer.remove();
            
            // Add event to events grid if on events tab
            if (document.querySelector('.events-content')) {
                addNewEventToView(eventData);
            }
        } else {
            showNotification('Please fill in all required fields', 'error');
        }
    });
    
    // Close on overlay click
    modalContainer.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            modalContainer.remove();
        }
    });
}

// ============= HELPER FUNCTIONS =============

// Save event to localStorage
function saveEventToStorage(eventData) {
    try {
        // Get existing events
        let events = JSON.parse(localStorage.getItem('studyMateEvents') || '[]');
        
        // Add ID and timestamp
        eventData.id = 'event_' + Date.now();
        eventData.createdAt = new Date().toISOString();
        eventData.createdBy = AuthSystem.getCurrentUser()?.name || 'Anonymous';
        
        // Add to events array
        events.push(eventData);
        
        // Save back to localStorage
        localStorage.setItem('studyMateEvents', JSON.stringify(events));
        
        return true;
    } catch (error) {
        console.error('Error saving event:', error);
        return false;
    }
}

// Load More Discussions
function loadMoreDiscussions() {
    const discussionList = document.querySelector('.discussion-list');
    
    const newDiscussions = [
        {
            title: "Help with integration by parts",
            tags: ["Mathematics", "Calculus"],
            author: "David Wilson",
            time: "3 hours ago",
            replies: 6,
            views: 42,
            content: "I'm stuck on this integration problem. Can someone explain the steps?"
        },
        {
            title: "MCAT Biology question - cellular respiration",
            tags: ["Biology", "MCAT"],
            author: "Emma Thompson",
            time: "1 day ago",
            replies: 15,
            views: 89,
            content: "Looking for clarification on the electron transport chain steps."
        }
    ];
    
    newDiscussions.forEach(discussion => {
        const discussionItem = document.createElement('div');
        discussionItem.className = 'discussion-item';
        discussionItem.innerHTML = `
            <div class="discussion-header">
                <h3 class="discussion-title">${discussion.title}</h3>
                <div class="discussion-tags">
                    ${discussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <p>${discussion.content}</p>
            <div class="discussion-meta">
                <div class="meta-item">
                    <i class="fas fa-user"></i>
                    ${discussion.author}
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    ${discussion.time}
                </div>
                <div class="meta-item">
                    <i class="fas fa-comment"></i>
                    ${discussion.replies} replies
                </div>
                <div class="meta-item">
                    <i class="fas fa-eye"></i>
                    ${discussion.views} views
                </div>
            </div>
        `;
        discussionList.appendChild(discussionItem);
    });
}

// Load Events
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    // Load events from localStorage
    const events = JSON.parse(localStorage.getItem('studyMateEvents') || '[]');
    
    // If no events in localStorage, use demo events
    const displayEvents = events.length > 0 ? events : [
        {
            id: 'event_1',
            title: "Organic Chemistry Q&A Session",
            date: "2025-12-18",
            time: "18:30",
            host: "Prof. James Wilson",
            type: "qna",
            spots: 47,
            description: "Live Q&A session covering reaction mechanisms and synthesis problems. Bring your questions!",
            createdBy: "Admin"
        },
        {
            id: 'event_2',
            title: "Physics Problem-Solving Workshop",
            date: "2025-12-20",
            time: "16:00",
            host: "Dr. Sarah Chen",
            type: "workshop",
            spots: 32,
            description: "Interactive workshop focusing on classical mechanics problems with step-by-step solutions.",
            createdBy: "Admin"
        }
    ];
    
    displayEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-card-header" style="background: linear-gradient(135deg, ${getEventColor(event.type)});">
                <span class="event-category ${event.type}">${getEventTypeLabel(event.type)}</span>
                <h4 class="event-card-title">${event.title}</h4>
            </div>
            <div class="event-card-body">
                <div class="event-info">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(event.time)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user"></i>
                        <span>${event.host}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${event.spots || 100} spots available</span>
                    </div>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <button class="btn btn-secondary view-details">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                    <button class="btn btn-primary register-event">
                        <i class="fas fa-calendar-plus"></i>
                        Register
                    </button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

function getEventTypeLabel(type) {
    const labels = {
        webinar: 'Webinar',
        qna: 'Q&A Session',
        workshop: 'Workshop',
        studygroup: 'Study Group'
    };
    return labels[type] || 'Event';
}

function getEventColor(type) {
    const colors = {
        qna: '#00b894, #00a085',
        webinar: '#6c5ce7, #a29bfe',
        workshop: '#fd79a8, #e84393',
        studygroup: '#fdcb6e, #f39c12'
    };
    return colors[type] || '#6c5ce7, #a29bfe';
}

// Add New Event to View
function addNewEventToView(eventData) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    const eventDate = new Date(eventData.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
        <div class="event-card-header" style="background: linear-gradient(135deg, ${getEventColor(eventData.type)});">
            <span class="event-category ${eventData.type}">${getEventTypeLabel(eventData.type)}</span>
            <h4 class="event-card-title">${eventData.title}</h4>
        </div>
        <div class="event-card-body">
            <div class="event-info">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <span>${formatTime(eventData.time)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-user"></i>
                    <span>${eventData.host}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${eventData.spots || 100} spots available</span>
                </div>
            </div>
            <p class="event-description">${eventData.description}</p>
            <div class="event-actions">
                <button class="btn btn-secondary view-details">
                    <i class="fas fa-info-circle"></i>
                    Details
                </button>
                <button class="btn btn-primary register-event">
                    <i class="fas fa-calendar-plus"></i>
                    Register
                </button>
            </div>
        </div>
    `;
    
    eventsGrid.insertBefore(eventCard, eventsGrid.firstChild);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// ============= NOTIFICATION SYSTEM =============
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Set colors based on type
    const colors = {
        success: '#6c5ce7',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const bgColor = colors[type] || colors.success;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Add icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const icon = icons[type] || icons.success;
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn && menu) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
            
            if (menu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Check if user just logged in and show welcome message
    const user = AuthSystem.getCurrentUser();
    if (user) {
        // Check if this is a fresh login by checking sessionStorage
        if (!sessionStorage.getItem('welcomeShown')) {
            showNotification(`Welcome back, ${user.name || user.email}!`);
            sessionStorage.setItem('welcomeShown', 'true');
        }
        
        // Check for pending actions after login
        checkPendingActions();
    }
    
    // Check URL parameters for login success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('login') && urlParams.get('login') === 'success') {
        showNotification('Login successful! Welcome to StudyMate Community!');
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    // Initialize with All Groups view
    if (!document.querySelector('.nav-tabs a.active')) {
        const firstTab = document.querySelector('.nav-tabs a');
        if (firstTab) {
            firstTab.classList.add('active');
            showAllGroups();
        }
    }
});

// Check for pending actions after login
function checkPendingActions() {
    const pendingEvent = localStorage.getItem('pendingEventRegistration');
    const pendingGroup = localStorage.getItem('pendingGroupJoin');
    
    if (pendingEvent) {
        showNotification(`You can now register for: ${pendingEvent}`);
        localStorage.removeItem('pendingEventRegistration');
    }
    
    if (pendingGroup) {
        showNotification(`You can now join: ${pendingGroup}`);
        localStorage.removeItem('pendingGroupJoin');
    }
    
    // Clear redirect storage
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('afterLoginAction');
}

// Animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyles);