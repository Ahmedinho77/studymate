// main.js or add to existing main.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Download button functionality
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const resourceTitle = this.closest('.resource-content').querySelector('h3').textContent;
            simulateDownload(resourceTitle);
        });
    });

    // Preview button functionality
    const previewBtns = document.querySelectorAll('.preview-btn');
    previewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const resourceTitle = this.closest('.resource-content').querySelector('h3').textContent;
            showPreviewModal(resourceTitle);
        });
    });

    // Guide view button functionality
    const guideBtns = document.querySelectorAll('.guide-btn');
    guideBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const guideTitle = this.closest('.guide-card').querySelector('h3').textContent;
            const guideSubject = this.closest('.guide-card').querySelector('.guide-subject').textContent;
            showGuideModal(guideTitle, guideSubject);
        });
    });

    // Video play button functionality
    const videoBtns = document.querySelectorAll('.video-btn, .play-button');
    videoBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const videoTitle = this.closest('.video-card').querySelector('h3').textContent;
            showVideoModal(videoTitle, this.href || '#');
        });
    });

    // Tool link tracking
    const toolLinks = document.querySelectorAll('.tool-link');
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const toolName = this.closest('.tool-content').querySelector('h3').textContent;
            trackExternalLink(toolName, this.href);
        });
    });

    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Initialize animations for category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Download simulation function
function simulateDownload(resourceName) {
    // Show download notification
    showNotification(`Starting download: ${resourceName}`, 'success');
    
    // In a real application, this would initiate an actual file download
    // For demonstration, we'll simulate a download progress
    setTimeout(() => {
        showNotification(`${resourceName} downloaded successfully!`, 'success');
        
        // Update download count in UI (for demo purposes)
        const downloadCount = document.querySelector('.resource-meta .fa-users').closest('span');
        if (downloadCount) {
            const currentText = downloadCount.textContent;
            const matches = currentText.match(/(\d+)(,\d+)? downloads/);
            if (matches) {
                let count = parseInt(matches[1].replace(',', ''));
                count++;
                downloadCount.textContent = `${count.toLocaleString()} downloads`;
            }
        }
    }, 1500);
}

// Preview modal function
function showPreviewModal(resourceName) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Preview: ${resourceName}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="preview-container">
                    <div class="preview-placeholder">
                        <i class="fas fa-file-pdf" style="font-size: 4rem; color: #6c5ce7; margin-bottom: 1rem;"></i>
                        <h4>${resourceName}</h4>
                        <p>This is a preview of the resource content.</p>
                        <p>In the actual application, this would show the actual PDF/document viewer.</p>
                    </div>
                    <div class="preview-actions">
                        <button class="cta-btn primary full-download-btn">
                            <i class="fas fa-download"></i> Download Full Version
                        </button>
                        <button class="cta-btn secondary close-preview-btn">
                            <i class="fas fa-times"></i> Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-preview-btn').addEventListener('click', closeModal);
    modal.querySelector('.full-download-btn').addEventListener('click', function() {
        simulateDownload(resourceName);
        closeModal();
    });
}

// Guide modal function
function showGuideModal(guideTitle, subject) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content guide-modal">
            <div class="modal-header">
                <h3>${guideTitle}</h3>
                <span class="guide-subject ${subject.toLowerCase()}">${subject}</span>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="guide-preview">
                    <div class="guide-cover">
                        <h4>${guideTitle}</h4>
                        <p class="subject">${subject} Study Guide</p>
                        <div class="guide-stats">
                            <span><i class="fas fa-file-alt"></i> 45 pages</span>
                            <span><i class="fas fa-clock"></i> 3-4 hours to complete</span>
                            <span><i class="fas fa-star"></i> 4.8/5 rating</span>
                        </div>
                    </div>
                    <div class="guide-content">
                        <h4>Table of Contents</h4>
                        <ul class="toc-list">
                            <li>1. Introduction to ${subject}</li>
                            <li>2. Key Concepts and Fundamentals</li>
                            <li>3. Problem-Solving Techniques</li>
                            <li>4. Practice Exercises</li>
                            <li>5. Advanced Topics</li>
                            <li>6. Exam Preparation Tips</li>
                            <li>7. Additional Resources</li>
                        </ul>
                        <div class="guide-features">
                            <h5>Features:</h5>
                            <ul>
                                <li><i class="fas fa-check"></i> Comprehensive coverage</li>
                                <li><i class="fas fa-check"></i> Practice problems with solutions</li>
                                <li><i class="fas fa-check"></i> Visual diagrams and charts</li>
                                <li><i class="fas fa-check"></i> Self-assessment quizzes</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="guide-actions">
                    <button class="cta-btn primary download-guide-btn">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                    <button class="cta-btn secondary">
                        <i class="fas fa-book-open"></i> Read Online
                    </button>
                    <button class="cta-btn secondary close-guide-btn">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-guide-btn').addEventListener('click', closeModal);
    modal.querySelector('.download-guide-btn').addEventListener('click', function() {
        simulateDownload(guideTitle);
        closeModal();
    });
}

// Video modal function
function showVideoModal(videoTitle, videoUrl) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content video-modal">
            <div class="modal-header">
                <h3>${videoTitle}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="video-player">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle" style="font-size: 5rem; color: #6c5ce7;"></i>
                        <p>Video Player</p>
                        <p>In the actual application, this would embed the YouTube/Vimeo player.</p>
                    </div>
                </div>
                <div class="video-info">
                    <h4>About this video:</h4>
                    <p>This educational video covers important concepts related to ${videoTitle}.</p>
                    <div class="video-meta">
                        <span><i class="fas fa-eye"></i> 45,200 views</span>
                        <span><i class="fas fa-thumbs-up"></i> 2,450 likes</span>
                        <span><i class="fas fa-clock"></i> 15 minutes</span>
                    </div>
                </div>
                <div class="video-actions">
                    <a href="${videoUrl}" target="_blank" class="cta-btn primary">
                        <i class="fab fa-youtube"></i> Watch on YouTube
                    </a>
                    <button class="cta-btn secondary close-video-btn">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-video-btn').addEventListener('click', closeModal);
}

// Create modal backdrop
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    `;
    
    // Add fadeIn animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-content {
            background: white;
            border-radius: 10px;
            max-width: 700px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideIn 0.3s forwards;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e9ecef;
            background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            color: white;
            border-radius: 10px 10px 0 0;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s;
        }
        
        .modal-close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 2rem;
        }
        
        .preview-placeholder, .video-placeholder {
            text-align: center;
            padding: 3rem;
            background: #f8f9fa;
            border-radius: 10px;
            margin-bottom: 2rem;
        }
        
        .preview-actions, .guide-actions, .video-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .cta-btn.full-download-btn, .cta-btn.download-guide-btn {
            background-color: #6c5ce7;
            color: white;
        }
        
        .guide-preview {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .guide-cover {
            flex: 1;
            min-width: 250px;
            background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
        }
        
        .guide-content {
            flex: 2;
            min-width: 300px;
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
        }
        
        .toc-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .guide-features ul {
            list-style: none;
            padding: 0;
        }
        
        .guide-features li {
            padding: 0.3rem 0;
        }
        
        .guide-features i {
            color: #00b894;
            margin-right: 0.5rem;
        }
    `;
    
    document.head.appendChild(style);
    return modal;
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal-backdrop');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s forwards';
        
        // Create fadeOut animation
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        
        setTimeout(() => {
            modal.remove();
            fadeOutStyle.remove();
        }, 300);
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#00b894' : '#6c5ce7'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s forwards;
    `;
    
    // Add animation
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(notificationStyle);
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s forwards';
        setTimeout(() => {
            notification.remove();
            notificationStyle.remove();
        }, 300);
    }, 3000);
}

// Search functionality
function performSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showNotification('Please enter a search term', 'info');
        return;
    }
    
    // In a real application, this would make an API call
    // For demo, we'll just show a notification
    showNotification(`Searching for: "${searchTerm}"`, 'info');
    
    // Simulate search results
    setTimeout(() => {
        showNotification(`Found 15 resources matching "${searchTerm}"`, 'success');
    }, 1000);
}

// Filter functionality
function applyFilters() {
    const categoryFilter = document.querySelector('.filter-select:nth-child(1)').value;
    const subjectFilter = document.querySelector('.filter-select:nth-child(2)').value;
    const sortFilter = document.querySelector('.filter-select:nth-child(3)').value;
    
    // In a real application, this would filter and sort the resources
    // For demo, we'll just show what filters are applied
    let message = 'Applied filters: ';
    const filters = [];
    
    if (categoryFilter) filters.push(`Category: ${categoryFilter}`);
    if (subjectFilter) filters.push(`Subject: ${subjectFilter}`);
    if (sortFilter) filters.push(`Sorted by: ${sortFilter}`);
    
    if (filters.length > 0) {
        showNotification(message + filters.join(', '), 'info');
    }
}

// External link tracking
function trackExternalLink(toolName, url) {
    // In a real application, this would send analytics data
    console.log(`User clicked on external tool: ${toolName} - ${url}`);
    showNotification(`Opening ${toolName} in new tab...`, 'info');
    
    // Note: The link will open normally due to target="_blank"
    // We're just adding tracking here
}