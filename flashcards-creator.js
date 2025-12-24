// flashcards-creator.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data
    initializeUserData();

    // DOM Elements
    const flashcardCreatorForm = document.getElementById('flashcardCreatorForm');
    const cardQuestion = document.getElementById('cardQuestion');
    const cardAnswer = document.getElementById('cardAnswer');
    const cardHint = document.getElementById('cardHint');
    const cardSubject = document.getElementById('cardSubject');
    const cardDifficulty = document.getElementById('cardDifficulty');
    const cardTags = document.getElementById('cardTags');
    const cardExample = document.getElementById('cardExample');
    const previewCardBtn = document.getElementById('previewCardBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const previewSection = document.getElementById('previewSection');
    const cardPreview = document.getElementById('cardPreview');
    const userDecksContainer = document.getElementById('userDecksContainer');
    const noDecksMessage = document.getElementById('noDecksMessage');

    // Load user's flashcards
    loadUserFlashcards();

    // Event Listeners
    // Preview card
    previewCardBtn.addEventListener('click', function() {
        if (validateForm()) {
            previewFlashcard();
            previewSection.style.display = 'block';
        }
    });

    // Save card
    saveCardBtn.addEventListener('click', function() {
        saveFlashcard();
    });

    // Clear form
    clearFormBtn.addEventListener('click', function() {
        clearForm();
        previewSection.style.display = 'none';
        showNotification('Form cleared', 'info');
    });

    // Form submission
    flashcardCreatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFlashcard();
    });

    // Functions
    function initializeUserData() {
        const currentUser = JSON.parse(localStorage.getItem('studymate_current_user') || 'null');
        
        if (!currentUser) {
            // If not logged in, use anonymous user ID
            if (!localStorage.getItem('flashcard_anonymous_user_id')) {
                localStorage.setItem('flashcard_anonymous_user_id', `anonymous_${Date.now()}`);
            }
        }
    }

    function getUserId() {
        const currentUser = JSON.parse(localStorage.getItem('studymate_current_user') || 'null');
        if (currentUser) {
            return currentUser.userId || currentUser.email;
        } else {
            return localStorage.getItem('flashcard_anonymous_user_id') || 'anonymous';
        }
    }

    function validateForm() {
        if (!cardQuestion.value.trim()) {
            showNotification('Please enter a question', 'error');
            cardQuestion.focus();
            return false;
        }
        if (!cardAnswer.value.trim()) {
            showNotification('Please enter an answer', 'error');
            cardAnswer.focus();
            return false;
        }
        if (!cardSubject.value) {
            showNotification('Please select a subject', 'error');
            cardSubject.focus();
            return false;
        }
        return true;
    }

    function previewFlashcard() {
        const cardData = getCardData();
        
        cardPreview.innerHTML = `
            <div class="preview-card-content">
                <h5>Question:</h5>
                <p>${cardData.question}</p>
                
                <h5>Answer:</h5>
                <p>${cardData.answer}</p>
                
                ${cardData.hint ? `<h5>Hint:</h5><p>${cardData.hint}</p>` : ''}
                ${cardData.example ? `<h5>Example:</h5><p>${cardData.example}</p>` : ''}
                
                <div class="preview-card-meta">
                    <span class="preview-tag">${cardData.subject}</span>
                    <span class="preview-tag">${cardData.difficulty}</span>
                    ${cardData.tags.length > 0 ? `<span class="preview-tag">${cardData.tags.join(', ')}</span>` : ''}
                </div>
            </div>
        `;
    }

    function getCardData() {
        return {
            id: Date.now(),
            question: cardQuestion.value.trim(),
            answer: cardAnswer.value.trim(),
            hint: cardHint.value.trim(),
            subject: cardSubject.value,
            difficulty: cardDifficulty.value,
            tags: cardTags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            example: cardExample.value.trim(),
            created: new Date().toISOString(),
            lastReviewed: null,
            reviewCount: 0,
            masteryLevel: 0
        };
    }

    function saveFlashcard() {
        if (!validateForm()) {
            return;
        }

        const cardData = getCardData();
        const userId = getUserId();
        const storageKey = `flashcards_${userId}`;
        
        // Get existing flashcards
        let flashcards = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check if card already exists (by question)
        const existingIndex = flashcards.findIndex(card => 
            card.question.toLowerCase() === cardData.question.toLowerCase() &&
            card.subject === cardData.subject
        );
        
        if (existingIndex >= 0) {
            // Update existing card
            flashcards[existingIndex] = {
                ...flashcards[existingIndex],
                ...cardData,
                id: flashcards[existingIndex].id, // Keep original ID
                updated: new Date().toISOString()
            };
            showNotification('Flashcard updated successfully!', 'success');
        } else {
            // Add new card
            flashcards.push(cardData);
            showNotification('Flashcard saved successfully!', 'success');
        }
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(flashcards));
        
        // Clear form
        clearForm();
        previewSection.style.display = 'none';
        
        // Reload user's flashcards
        loadUserFlashcards();
        
        // Update progress stats
        updateProgressStats();
    }

    function clearForm() {
        flashcardCreatorForm.reset();
        cardSubject.value = '';
        cardDifficulty.value = 'medium';
        cardPreview.innerHTML = '';
    }

    function loadUserFlashcards() {
        const userId = getUserId();
        const storageKey = `flashcards_${userId}`;
        const flashcards = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (flashcards.length === 0) {
            userDecksContainer.innerHTML = `
                <div class="no-decks" id="noDecksMessage">
                    <p>You haven't created any flashcard decks yet. Create your first card above!</p>
                    <button class="btn-primary" onclick="startCreating()">
                        <i class="fas fa-plus"></i> Create First Card
                    </button>
                </div>
            `;
            return;
        }
        
        // Hide no decks message
        if (noDecksMessage) {
            noDecksMessage.style.display = 'none';
        }
        
        // Group flashcards by subject
        const groupedBySubject = {};
        flashcards.forEach(card => {
            if (!groupedBySubject[card.subject]) {
                groupedBySubject[card.subject] = [];
            }
            groupedBySubject[card.subject].push(card);
        });
        
        // Display decks
        let decksHTML = '';
        Object.entries(groupedBySubject).forEach(([subject, cards]) => {
            const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
            const easyCards = cards.filter(card => card.masteryLevel >= 80).length;
            const totalCards = cards.length;
            
            decksHTML += `
                <div class="user-deck-card" data-subject="${subject}">
                    <div class="deck-card-header">
                        <div class="deck-title">${subjectName} Deck</div>
                        <span class="deck-subject-badge">${subjectName}</span>
                    </div>
                    <p>${cards[0].question.substring(0, 100)}${cards[0].question.length > 100 ? '...' : ''}</p>
                    <div class="deck-stats">
                        <span><i class="fas fa-layer-group"></i> ${totalCards} cards</span>
                        <span><i class="fas fa-check-circle"></i> ${easyCards} mastered</span>
                    </div>
                    <div class="deck-actions">
                        <button class="deck-action-btn" onclick="studyDeck('${subject}')">
                            <i class="fas fa-play"></i> Study
                        </button>
                        <button class="deck-action-btn" onclick="editDeck('${subject}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="deck-action-btn" onclick="deleteDeck('${subject}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        userDecksContainer.innerHTML = decksHTML;
    }

    function updateProgressStats() {
        const userId = getUserId();
        const storageKey = `flashcards_${userId}`;
        const flashcards = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (flashcards.length === 0) return;
        
        // Calculate stats
        const totalCards = flashcards.length;
        const reviewedCards = flashcards.filter(card => card.lastReviewed).length;
        const masteredCards = flashcards.filter(card => card.masteryLevel >= 80).length;
        
        // Save stats
        const stats = {
            totalCards,
            reviewedCards,
            masteredCards,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`flashcard_stats_${userId}`, JSON.stringify(stats));
        
        // Update global progress if user is logged in
        updateGlobalProgress(stats);
    }

    function updateGlobalProgress(stats) {
        const currentUser = JSON.parse(localStorage.getItem('studymate_current_user') || 'null');
        if (!currentUser) return;
        
        // Update user's progress in the main progress system
        const userProgressKey = `studymate_progress_${currentUser.userId || currentUser.email}`;
        const userProgress = JSON.parse(localStorage.getItem(userProgressKey) || '{}');
        
        if (!userProgress.stats) {
            userProgress.stats = {};
        }
        
        userProgress.stats.flashcardsCreated = stats.totalCards;
        userProgress.stats.flashcardsMastered = stats.masteredCards;
        
        // Update subject progress
        const userId = getUserId();
        const storageKey = `flashcards_${userId}`;
        const flashcards = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const subjectStats = {};
        flashcards.forEach(card => {
            if (!subjectStats[card.subject]) {
                subjectStats[card.subject] = { total: 0, mastered: 0 };
            }
            subjectStats[card.subject].total++;
            if (card.masteryLevel >= 80) {
                subjectStats[card.subject].mastered++;
            }
        });
        
        if (!userProgress.subjects) {
            userProgress.subjects = {};
        }
        
        Object.entries(subjectStats).forEach(([subject, stats]) => {
            if (!userProgress.subjects[subject]) {
                userProgress.subjects[subject] = {
                    score: 0,
                    lastWeek: 0,
                    hours: 0,
                    cards: 0,
                    accuracy: 0
                };
            }
            
            // Calculate score based on mastery percentage
            const masteryPercentage = stats.mastered / stats.total * 100;
            userProgress.subjects[subject].score = Math.max(
                userProgress.subjects[subject].score,
                Math.min(100, masteryPercentage)
            );
            userProgress.subjects[subject].cards = stats.total;
        });
        
        localStorage.setItem(userProgressKey, JSON.stringify(userProgress));
    }

    function showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Global functions for deck actions
    window.startCreating = function() {
        document.getElementById('cardQuestion').focus();
        showNotification('Start typing your question!', 'info');
    };

    window.studyDeck = function(subject) {
        showNotification(`Starting study session for ${subject}...`, 'info');
        // In a full implementation, this would open a study interface
        setTimeout(() => {
            showNotification('Study session started! Try answering the cards.', 'success');
        }, 500);
    };

    window.editDeck = function(subject) {
        showNotification(`Loading ${subject} cards for editing...`, 'info');
        // In a full implementation, this would load cards into editor
        setTimeout(() => {
            showNotification(`${subject} cards loaded. You can now edit them.`, 'success');
        }, 500);
    };

    window.deleteDeck = function(subject) {
        if (confirm(`Are you sure you want to delete all ${subject} flashcards? This cannot be undone.`)) {
            const userId = getUserId();
            const storageKey = `flashcards_${userId}`;
            let flashcards = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Filter out cards from this subject
            flashcards = flashcards.filter(card => card.subject !== subject);
            
            localStorage.setItem(storageKey, JSON.stringify(flashcards));
            showNotification(`${subject} deck deleted successfully!`, 'success');
            loadUserFlashcards();
            updateProgressStats();
        }
    };
});