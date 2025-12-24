
// progress.js - Complete integrated progress tracking with dashboard linking
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            menu.classList.toggle('active');
            
            if (menu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Check user authentication
    checkUserAuthentication();

    // Initialize progress tracking
    initializeProgressTracking();
    
    // Set default dates for new goal form
    setDefaultGoalDates();
    
    // Initialize event listeners
    initializeEventListeners();
});

// Global variables
let currentGoalId = null;
let currentUser = null;
let progressData = {
    goals: {},
    subjects: {
        mathematics: {
            score: 0,
            lastWeek: 0,
            hours: 0,
            cards: 0,
            accuracy: 0
        },
        science: {
            score: 0,
            lastWeek: 0,
            hours: 0,
            cards: 0,
            accuracy: 0
        },
        languages: {
            score: 0,
            lastWeek: 0,
            hours: 0,
            cards: 0,
            accuracy: 0
        }
    },
    stats: {
        studyTime: 0,
        cardsMastered: 0,
        averageScore: 0,
        studyStreak: 0,
        lastUpdated: null
    }
};

// Authentication check
function checkUserAuthentication() {
    currentUser = JSON.parse(localStorage.getItem('studymate_current_user') || 'null');
    const isLoggedIn = localStorage.getItem('studymate_is_logged_in') === 'true';
    
    if (!currentUser || !isLoggedIn) {
        // Update navbar for non-logged in users
        const userNavItem = document.getElementById('userNavItem');
        if (userNavItem) {
            userNavItem.innerHTML = `
                <button class="nav-btn"><a href="signUp.html"><i class="fas fa-user-plus"></i> Sign Up</a></button>
            `;
        }
        // Set default welcome messages
        document.getElementById('welcomeTitle').textContent = 'Progress Tracking';
        document.getElementById('userGreeting').textContent = 'Ready to Boost Your Learning?';
    } else {
        // Update navbar for logged in users
        const userNavItem = document.getElementById('userNavItem');
        if (userNavItem) {
            userNavItem.innerHTML = `
                <button class="nav-btn"><a href="dashboard.html"><i class="fas fa-user"></i> Hi, ${currentUser.fullName.split(' ')[0]}</a></button>
            `;
        }
        // Update welcome messages
        document.getElementById('welcomeTitle').textContent = `Welcome back, ${currentUser.fullName.split(' ')[0]}!`;
        document.getElementById('userGreeting').textContent = `Keep Going, ${currentUser.fullName.split(' ')[0]}!`;
        
        // Load user's progress data
        loadUserProgressData();
    }
}

// Load user progress data from localStorage
function loadUserProgressData() {
    if (!currentUser) return;
    
    const userProgressKey = `studymate_progress_${currentUser.userId || currentUser.email}`;
    const savedProgress = localStorage.getItem(userProgressKey);
    
    if (savedProgress) {
        const parsedData = JSON.parse(savedProgress);
        
        // Merge saved data with defaults
        progressData = {
            ...progressData,
            ...parsedData,
            subjects: {
                ...progressData.subjects,
                ...parsedData.subjects
            },
            stats: {
                ...progressData.stats,
                ...parsedData.stats
            }
        };
        
        // Ensure goals is an object
        if (parsedData.goals && typeof parsedData.goals === 'object') {
            progressData.goals = parsedData.goals;
        }
    } else {
        // Initialize with demo data for new users
        initializeDemoData();
    }
    
    // Update UI with loaded data
    updateAllDisplays();
}

// Save user progress data to localStorage
function saveUserProgressData() {
    if (!currentUser) return;
    
    const userProgressKey = `studymate_progress_${currentUser.userId || currentUser.email}`;
    localStorage.setItem(userProgressKey, JSON.stringify(progressData));
}

// Initialize with demo data for new users
function initializeDemoData() {
    progressData = {
        goals: {
            1: {
                id: 1,
                title: "Complete Calculus Module",
                progress: 65,
                lastProgress: 60,
                targetDate: "Dec 15, 2025",
                createdAt: new Date().toISOString()
            },
            2: {
                id: 2,
                title: "Master 500 Spanish Vocabulary Words",
                progress: 40,
                lastProgress: 35,
                targetDate: "Jan 30, 2026",
                createdAt: new Date().toISOString()
            }
        },
        subjects: {
            mathematics: {
                score: 92,
                lastWeek: 88,
                hours: 14,
                cards: 320,
                accuracy: 87
            },
            science: {
                score: 85,
                lastWeek: 80,
                hours: 18,
                cards: 450,
                accuracy: 82
            },
            languages: {
                score: 78,
                lastWeek: 72,
                hours: 10,
                cards: 275,
                accuracy: 76
            }
        },
        stats: {
            studyTime: 42,
            cardsMastered: 1245,
            averageScore: 87,
            studyStreak: 24,
            lastUpdated: new Date().toISOString()
        }
    };
    
    saveUserProgressData();
}

// Initialize progress tracking
function initializeProgressTracking() {
    // Initialize charts
    initializeCharts();
    
    // Update subject cards
    updateSubjectCards();
    
    // Update goals display
    updateGoalDisplay();
}

// Initialize charts
function initializeCharts() {
    // Sample data for charts
    const chartData = {
        week: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [80, 65, 90, 75, 85, 70, 60]
        },
        month: {
            days: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [70, 75, 85, 90]
        },
        year: {
            days: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 85, 90]
        }
    };
    
    updateStudyTimeChart('week');
    updateProgressLineChart('week');
}

// Update study time chart
function updateStudyTimeChart(timeframe) {
    const studyTimeChart = document.getElementById('studyTimeChart');
    if (!studyTimeChart) return;
    
    const data = {
        week: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [80, 65, 90, 75, 85, 70, 60] },
        month: { days: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [70, 75, 85, 90] },
        year: { days: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 85, 90] }
    }[timeframe];
    
    studyTimeChart.innerHTML = '';
    const colors = ['#6c5ce7', '#00b894', '#fd79a8', '#fdcb6e', '#a29bfe', '#55efc4'];

    data.days.forEach((day, index) => {
        const barHeight = data.values[index];
        const color = colors[index % colors.length];

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${barHeight}%`;
        bar.style.backgroundColor = color;

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = day;

        bar.appendChild(label);
        studyTimeChart.appendChild(bar);
    });
}

// Update progress line chart
function updateProgressLineChart(timeframe) {
    const progressLineChart = document.getElementById('progressLineChart');
    const progressChartLabels = document.getElementById('progressChartLabels');
    if (!progressLineChart || !progressChartLabels) return;
    
    const data = {
        week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [60, 65, 70, 75, 80, 85, 90] },
        month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [70, 75, 85, 90] },
        year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], values: [60, 65, 70, 75, 80, 85, 90] }
    }[timeframe];
    
    progressLineChart.innerHTML = '';
    progressChartLabels.innerHTML = '';

    data.values.forEach((value, index) => {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.height = `${value}%`;
        progressLineChart.appendChild(line);

        const label = document.createElement('span');
        label.textContent = data.labels[index];
        progressChartLabels.appendChild(label);
    });
}

// Update all displays
function updateAllDisplays() {
    updateOverallStats();
    updateSubjectCards();
    updateGoalDisplay();
}

// Update overall statistics
function updateOverallStats() {
    document.getElementById('totalStudyTime').innerHTML = `${progressData.stats.studyTime} <span class="stat-unit">hours</span>`;
    document.getElementById('studyTimeChange').textContent = `+${Math.floor(Math.random() * 15) + 5}% from last week`;
    
    document.getElementById('cardsMastered').innerHTML = `${progressData.stats.cardsMastered} <span class="stat-unit">cards</span>`;
    document.getElementById('cardsChange').textContent = `+${Math.floor(Math.random() * 20) + 5}% from last week`;
    
    document.getElementById('averageScore').innerHTML = `${progressData.stats.averageScore}<span class="stat-unit">%</span>`;
    document.getElementById('scoreChange').textContent = `+${Math.floor(Math.random() * 10) + 1}% from last month`;
    
    document.getElementById('studyStreak').innerHTML = `${progressData.stats.studyStreak} <span class="stat-unit">days</span>`;
    document.getElementById('streakMessage').textContent = progressData.stats.studyStreak > 0 ? 'Keep it up!' : 'Start your streak!';
}

// Update subject cards
function updateSubjectCards() {
    // Mathematics
    const math = progressData.subjects.mathematics;
    document.getElementById('mathScore').textContent = `${math.score}%`;
    document.getElementById('mathProgress').style.width = `${math.score}%`;
    document.getElementById('mathLastWeek').textContent = `Last week: ${math.lastWeek}%`;
    document.getElementById('mathImprovement').textContent = `+${math.score - math.lastWeek}% improvement`;
    document.getElementById('mathHours').textContent = `${math.hours} hours studied`;
    document.getElementById('mathCards').textContent = `${math.cards} cards mastered`;
    document.getElementById('mathAccuracy').textContent = `${math.accuracy}% accuracy rate`;

    // Science
    const science = progressData.subjects.science;
    document.getElementById('scienceScore').textContent = `${science.score}%`;
    document.getElementById('scienceProgress').style.width = `${science.score}%`;
    document.getElementById('scienceLastWeek').textContent = `Last week: ${science.lastWeek}%`;
    document.getElementById('scienceImprovement').textContent = `+${science.score - science.lastWeek}% improvement`;
    document.getElementById('scienceHours').textContent = `${science.hours} hours studied`;
    document.getElementById('scienceCards').textContent = `${science.cards} cards mastered`;
    document.getElementById('scienceAccuracy').textContent = `${science.accuracy}% accuracy rate`;

    // Languages
    const languages = progressData.subjects.languages;
    document.getElementById('languageScore').textContent = `${languages.score}%`;
    document.getElementById('languageProgress').style.width = `${languages.score}%`;
    document.getElementById('languageLastWeek').textContent = `Last week: ${languages.lastWeek}%`;
    document.getElementById('languageImprovement').textContent = `+${languages.score - languages.lastWeek}% improvement`;
    document.getElementById('languageHours').textContent = `${languages.hours} hours studied`;
    document.getElementById('languageCards').textContent = `${languages.cards} cards mastered`;
    document.getElementById('languageAccuracy').textContent = `${languages.accuracy}% accuracy rate`;
}

// Update goal display
function updateGoalDisplay() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;
    
    goalsList.innerHTML = '';
    
    // Get goals as array and sort by creation date
    const goalsArray = Object.values(progressData.goals).sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    if (goalsArray.length === 0) {
        goalsList.innerHTML = `
            <div class="no-goals">
                <p>No goals set yet. Create your first goal to track your progress!</p>
            </div>
        `;
        return;
    }
    
    goalsArray.forEach(goal => {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.setAttribute('data-goal-id', goal.id);
        
        goalElement.innerHTML = `
            <div class="goal-info">
                <h4>${goal.title}</h4>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%;"></div>
                    </div>
                    <span class="progress-text">${goal.progress}% complete</span>
                </div>
                <p class="goal-deadline">Target: Complete by ${goal.targetDate}</p>
            </div>
            <button class="goal-btn" data-goal="${goal.id}">Update Progress</button>
        `;
        
        goalsList.appendChild(goalElement);
    });
    
    // Re-attach event listeners to update buttons
    document.querySelectorAll('.goal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.getAttribute('data-goal');
            openUpdateModal(goalId);
        });
    });
}

// Open update modal
function openUpdateModal(goalId) {
    const goal = progressData.goals[goalId];
    if (!goal) return;
    
    currentGoalId = goalId;
    
    // Set modal content
    document.getElementById('modalTitle').textContent = `Update: ${goal.title}`;
    document.getElementById('currentProgressLabel').textContent = `${goal.progress}%`;
    document.getElementById('progressValue').value = goal.progress;
    document.getElementById('progressValueDisplay').textContent = `${goal.progress}%`;
    
    // Show modal
    document.getElementById('progressModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close update modal
function closeUpdateModal() {
    document.getElementById('progressModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentGoalId = null;
}

// Set default dates for new goal form
function setDefaultGoalDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 30);

    const startDateInput = document.getElementById('goalStart');
    const endDateInput = document.getElementById('goalEnd');
    
    if (startDateInput) {
        startDateInput.valueAsDate = today;
    }
    if (endDateInput) {
        endDateInput.valueAsDate = tomorrow;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Chart time selectors
    const studyTimeSelector = document.getElementById('studyTimeSelector');
    const progressTimeSelector = document.getElementById('progressTimeSelector');
    
    if (studyTimeSelector) {
        studyTimeSelector.addEventListener('change', function() {
            updateStudyTimeChart(this.value);
        });
    }
    
    if (progressTimeSelector) {
        progressTimeSelector.addEventListener('change', function() {
            updateProgressLineChart(this.value);
        });
    }
    
    // Progress slider for modal
    const progressSlider = document.getElementById('progressValue');
    const progressValueDisplay = document.getElementById('progressValueDisplay');
    
    if (progressSlider && progressValueDisplay) {
        progressSlider.addEventListener('input', function() {
            progressValueDisplay.textContent = `${this.value}%`;
        });
    }
    
    // Initial progress slider for new goal form
    const initialProgressSlider = document.getElementById('goalInitialProgress');
    const initialProgressValue = document.getElementById('initialProgressValue');
    
    if (initialProgressSlider && initialProgressValue) {
        initialProgressSlider.addEventListener('input', function() {
            initialProgressValue.textContent = `${this.value}%`;
        });
    }
    
    // Modal buttons
    const closeModalBtn = document.getElementById('closeModal');
    const cancelUpdateBtn = document.getElementById('cancelUpdate');
    const saveProgressBtn = document.getElementById('saveProgress');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeUpdateModal);
    }
    
    if (cancelUpdateBtn) {
        cancelUpdateBtn.addEventListener('click', closeUpdateModal);
    }
    
    if (saveProgressBtn) {
        saveProgressBtn.addEventListener('click', function() {
            saveGoalProgress();
        });
    }
    
    // Close modal when clicking outside
    const progressModal = document.getElementById('progressModal');
    if (progressModal) {
        progressModal.addEventListener('click', function(e) {
            if (e.target === progressModal) {
                closeUpdateModal();
            }
        });
    }
    
    // New goal form submission
    const newGoalForm = document.getElementById('newGoalForm');
    if (newGoalForm) {
        newGoalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewGoal();
        });
    }
}

// Save goal progress
function saveGoalProgress() {
    if (!currentGoalId) return;
    
    const progressValue = parseInt(document.getElementById('progressValue').value);
    const goal = progressData.goals[currentGoalId];
    
    if (!goal) return;
    
    // Update goal progress
    goal.lastProgress = goal.progress;
    goal.progress = progressValue;
    
    // Update progress data
    saveUserProgressData();
    
    // Update display
    updateGoalDisplay();
    
    // Update subject scores based on goal progress (simulated improvement)
    if (currentGoalId == 1 || goal.title.toLowerCase().includes('calculus') || goal.title.toLowerCase().includes('math')) {
        progressData.subjects.mathematics.score = Math.min(100, progressData.subjects.mathematics.score + 1);
    } else if (currentGoalId == 2 || goal.title.toLowerCase().includes('spanish') || goal.title.toLowerCase().includes('language')) {
        progressData.subjects.languages.score = Math.min(100, progressData.subjects.languages.score + 2);
    } else if (goal.title.toLowerCase().includes('science')) {
        progressData.subjects.science.score = Math.min(100, progressData.subjects.science.score + 1);
    }
    
    // Update overall stats
    progressData.stats.averageScore = Math.min(100, progressData.stats.averageScore + 1);
    progressData.stats.cardsMastered += 25;
    progressData.stats.studyTime += 2;
    
    // Save updated data
    saveUserProgressData();
    
    // Update all displays
    updateAllDisplays();
    
    // Show success message
    showNotification(`Progress updated to ${progressValue}%!`, 'success');
    
    // Close modal
    closeUpdateModal();
}

// Add new goal
function addNewGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const startDate = document.getElementById('goalStart').value;
    const endDate = document.getElementById('goalEnd').value;
    const initialProgress = parseInt(document.getElementById('goalInitialProgress').value);
    
    if (!title) {
        showNotification('Please enter a goal title', 'error');
        return;
    }
    
    // Generate a new goal ID
    const goalIds = Object.keys(progressData.goals).map(id => parseInt(id));
    const newGoalId = goalIds.length > 0 ? Math.max(...goalIds) + 1 : 1;
    
    // Format target date
    const formattedDate = new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Create new goal object
    progressData.goals[newGoalId] = {
        id: newGoalId,
        title: title,
        progress: initialProgress,
        lastProgress: 0,
        targetDate: formattedDate,
        createdAt: new Date().toISOString()
    };
    
    // Save progress data
    saveUserProgressData();
    
    // Update goals display
    updateGoalDisplay();
    
    // Reset form
    document.getElementById('newGoalForm').reset();
    document.getElementById('initialProgressValue').textContent = '0%';
    document.getElementById('goalInitialProgress').value = 0;
    
    // Set default dates
    setDefaultGoalDates();
    
    // Show success message
    showNotification('New goal added successfully!', 'success');
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Set styles
    const styles = {
        success: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            iconColor: '#28a745'
        },
        error: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            iconColor: '#dc3545'
        },
        info: {
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            border: '1px solid #bee5eb',
            iconColor: '#17a2b8'
        }
    };
    
    const style = styles[type] || styles.info;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: ${style.backgroundColor};
        color: ${style.color};
        border: ${style.border};
        max-width: 400px;
    `;
    
    notification.querySelector('i').style.color = style.iconColor;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add keyframes if not exists
    if (!document.getElementById('notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Simulate study activity (call this from other pages when user studies)
window.updateStudyActivity = function(activity) {
    if (!currentUser) return;
    
    switch(activity.type) {
        case 'flashcard_study':
            progressData.stats.cardsMastered += activity.cards || 1;
            if (activity.subject) {
                progressData.subjects[activity.subject].cards += activity.cards || 1;
                progressData.subjects[activity.subject].score = Math.min(100, 
                    progressData.subjects[activity.subject].score + 1);
            }
            break;
            
        case 'study_session':
            progressData.stats.studyTime += activity.hours || 0.5;
            if (activity.subject) {
                progressData.subjects[activity.subject].hours += activity.hours || 0.5;
            }
            break;
            
        case 'quiz_completed':
            progressData.stats.averageScore = Math.round(
                (progressData.stats.averageScore + (activity.score || 0)) / 2
            );
            if (activity.subject) {
                progressData.subjects[activity.subject].accuracy = Math.min(100,
                    Math.round((progressData.subjects[activity.subject].accuracy + (activity.score || 0)) / 2)
                );
            }
            break;
            
        case 'streak_update':
            progressData.stats.studyStreak = activity.days || 1;
            break;
    }
    
    // Update last updated timestamp
    progressData.stats.lastUpdated = new Date().toISOString();
    
    // Save progress data
    saveUserProgressData();
    
    // Update display if on progress page
    if (window.location.pathname.includes('progress.html')) {
        updateAllDisplays();
    }
};