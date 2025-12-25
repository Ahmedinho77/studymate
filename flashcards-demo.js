// flashcards-demo.js - Updated with mobile touch fixes
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
            if (menu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Flashcard demo data
    const flashcardData = [
        {
            id: 1,
            question: "What is the powerhouse of the cell?",
            answer: "The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
            subject: "Science",
            difficulty: "medium",
            hint: "Think about cellular energy",
            example: "In muscle cells, mitochondria are abundant because muscles need lots of energy."
        },
        {
            id: 2,
            question: "What is the formula for calculating force?",
            answer: "Force = mass × acceleration (F = ma). This is Newton's second law of motion.",
            subject: "Physics",
            difficulty: "easy",
            hint: "Newton's second law",
            example: "A car with mass 1000kg accelerating at 2m/s² has a force of 2000N."
        },
        {
            id: 3,
            question: "What is the capital of France?",
            answer: "Paris is the capital and most populous city of France.",
            subject: "Geography",
            difficulty: "easy",
            hint: "Famous for the Eiffel Tower",
            example: "Paris is also known as the 'City of Light'."
        },
        {
            id: 4,
            question: "What does HTML stand for?",
            answer: "HyperText Markup Language. It's the standard markup language for documents designed to be displayed in a web browser.",
            subject: "Programming",
            difficulty: "medium",
            hint: "Web page structure",
            example: "HTML uses tags like <h1> for headings and <p> for paragraphs."
        },
        {
            id: 5,
            question: "What is the Pythagorean theorem?",
            answer: "In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²).",
            subject: "Mathematics",
            difficulty: "hard",
            hint: "Right triangles",
            example: "For a triangle with sides 3 and 4, the hypotenuse is 5 (3² + 4² = 5²)."
        }
    ];

    // Demo variables
    let currentCardIndex = 0;
    let stats = {
        mastered: 0,
        studyTime: 0,
        successRate: 0,
        totalAttempts: 0,
        correctAttempts: 0
    };

    // DOM Elements
    const demoFlashcard = document.getElementById('demoFlashcard');
    const demoQuestion = document.getElementById('demoQuestion');
    const demoAnswer = document.getElementById('demoAnswer');
    const demoSubject = document.getElementById('demoSubject');
    const demoDifficulty = document.getElementById('demoDifficulty');
    const demoCardNumber = document.getElementById('demoCardNumber');
    const prevCardBtn = document.getElementById('prevCard');
    const nextCardBtn = document.getElementById('nextCard');
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    const masteredCount = document.getElementById('masteredCount');
    const studyTime = document.getElementById('studyTime');
    const successRate = document.getElementById('successRate');

    // Load user stats
    loadStats();

    // Initialize first card
    updateCard();

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Event Listeners - CRITICAL MOBILE FIXES
    
    // Mobile touch fix - use both click and touch events
    if (isMobile) {
        // For mobile - use touch events
        demoFlashcard.addEventListener('touchstart', handleCardTap, { passive: true });
        demoFlashcard.addEventListener('click', handleCardTap);
        
        // Prevent double-tap zoom on cards
        demoFlashcard.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Make buttons more touch-friendly
        [prevCardBtn, nextCardBtn, ...feedbackBtns].forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
    } else {
        // For desktop - use click event
        demoFlashcard.addEventListener('click', handleCardTap);
    }
    
    // Prevent context menu on long press for mobile
    demoFlashcard.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    function handleCardTap(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Only flip if it's a simple tap (not a swipe)
        if (isMobile) {
            // For touch events, check if it's a tap (not a swipe)
            if (e.type === 'touchstart') {
                const touch = e.touches[0];
                const startX = touch.clientX;
                const startY = touch.clientY;
                
                demoFlashcard.addEventListener('touchend', function touchendHandler(e2) {
                    const touchEnd = e2.changedTouches[0];
                    const deltaX = Math.abs(touchEnd.clientX - startX);
                    const deltaY = Math.abs(touchEnd.clientY - startY);
                    
                    // If movement is small, it's a tap
                    if (deltaX < 10 && deltaY < 10) {
                        flipCard();
                    }
                    
                    demoFlashcard.removeEventListener('touchend', touchendHandler);
                }, { passive: true });
            } else {
                flipCard();
            }
        } else {
            flipCard();
        }
        
        // Track study time
        stats.studyTime += 1;
        updateStats();
        saveStats();
    }
    
    function flipCard() {
        demoFlashcard.classList.toggle('flipped');
        
        // Add animation class for visual feedback
        demoFlashcard.classList.add('flipping');
        setTimeout(() => {
            demoFlashcard.classList.remove('flipping');
        }, 600);
    }

    // Previous card
    prevCardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCard();
            demoFlashcard.classList.remove('flipped');
        }
    });

    // Next card
    nextCardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentCardIndex < flashcardData.length - 1) {
            currentCardIndex++;
            updateCard();
            demoFlashcard.classList.remove('flipped');
        }
    });

    // Swipe gestures for mobile card navigation
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    demoFlashcard.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    demoFlashcard.addEventListener('touchmove', function(e) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
        
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        // If horizontal movement is significant and vertical movement is small, it's a swipe
        if (deltaX > 30 && deltaY < 30) {
            isSwiping = true;
            e.preventDefault(); // Prevent scrolling when swiping horizontally
        }
    }, { passive: false });

    demoFlashcard.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        const deltaX = touchEndX - touchStartX;
        
        // Swipe threshold (50px)
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - previous card
                if (currentCardIndex > 0) {
                    currentCardIndex--;
                    updateCard();
                    demoFlashcard.classList.remove('flipped');
                }
            } else {
                // Swipe left - next card
                if (currentCardIndex < flashcardData.length - 1) {
                    currentCardIndex++;
                    updateCard();
                    demoFlashcard.classList.remove('flipped');
                }
            }
        }
        isSwiping = false;
    }, { passive: true });

    // Feedback buttons
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const difficulty = this.getAttribute('data-difficulty');
            
            // Update stats
            stats.totalAttempts++;
            if (difficulty === 'easy') {
                stats.correctAttempts++;
                stats.mastered++;
                showNotification('Great job! Card marked as easy.', 'success');
            } else if (difficulty === 'medium') {
                stats.correctAttempts++;
                showNotification('Good work! Keep practicing.', 'info');
            } else {
                showNotification('This card needs more review.', 'error');
            }
            
            // Update success rate
            stats.successRate = Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
            
            // Update UI
            updateStats();
            saveStats();
            
            // Go to next card after a delay
            setTimeout(() => {
                if (currentCardIndex < flashcardData.length - 1) {
                    currentCardIndex++;
                    updateCard();
                    demoFlashcard.classList.remove('flipped');
                }
            }, 500);
        });
        
        // Add touch support for feedback buttons
        btn.addEventListener('touchstart', function() {
            this.classList.add('active');
        }, { passive: true });
        
        btn.addEventListener('touchend', function() {
            this.classList.remove('active');
        }, { passive: true });
    });

    // Functions
    function updateCard() {
        const card = flashcardData[currentCardIndex];
        
        demoQuestion.textContent = card.question;
        demoAnswer.textContent = card.answer;
        demoSubject.textContent = card.subject;
        demoDifficulty.textContent = card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1);
        demoDifficulty.className = `difficulty ${card.difficulty}`;
        demoCardNumber.textContent = `Card ${currentCardIndex + 1}/${flashcardData.length}`;
        
        // Update button states
        prevCardBtn.disabled = currentCardIndex === 0;
        nextCardBtn.disabled = currentCardIndex === flashcardData.length - 1;
        
        // Add visual feedback for mobile
        if (prevCardBtn.disabled) {
            prevCardBtn.style.opacity = '0.5';
            prevCardBtn.style.cursor = 'not-allowed';
        } else {
            prevCardBtn.style.opacity = '1';
            prevCardBtn.style.cursor = 'pointer';
        }
        
        if (nextCardBtn.disabled) {
            nextCardBtn.style.opacity = '0.5';
            nextCardBtn.style.cursor = 'not-allowed';
        } else {
            nextCardBtn.style.opacity = '1';
            nextCardBtn.style.cursor = 'pointer';
        }
        
        // Update card example if available
        const exampleElement = document.querySelector('.example p');
        if (exampleElement && card.example) {
            exampleElement.textContent = card.example;
        }
    }

    function updateStats() {
        masteredCount.textContent = stats.mastered;
        studyTime.textContent = `${stats.studyTime} min`;
        successRate.textContent = `${stats.successRate}%`;
    }

    function saveStats() {
        localStorage.setItem('flashcard_demo_stats', JSON.stringify(stats));
    }

    function loadStats() {
        const savedStats = localStorage.getItem('flashcard_demo_stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStats();
        }
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
        
        // Position for mobile
        if (window.innerWidth <= 768) {
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.left = '10px';
            notification.style.maxWidth = 'calc(100% - 20px)';
        }
        
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

    // Auto-save stats every minute
    setInterval(saveStats, 60000);
});