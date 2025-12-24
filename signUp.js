document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            menu.classList.toggle('active');
            
            // Change the hamburger icon to X when menu is open
            if (menu.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Initialize users in localStorage if not exists
    if (!localStorage.getItem('studymate_users')) {
        localStorage.setItem('studymate_users', JSON.stringify([]));
    }

    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }

    // Also add toggle for confirm password
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
    
    // Password strength indicator
    const passwordField = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordField && strengthBar && strengthText) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let color = '#dc3545';
            let text = 'Weak';
            
            // Check password length
            if (password.length >= 8) strength += 1;
            if (password.length >= 12) strength += 1;
            
            // Check for uppercase letters
            if (/[A-Z]/.test(password)) strength += 1;
            
            // Check for lowercase letters
            if (/[a-z]/.test(password)) strength += 1;
            
            // Check for numbers
            if (/[0-9]/.test(password)) strength += 1;
            
            // Check for special characters
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            
            // Determine strength level
            if (strength >= 5) {
                color = '#00b894';
                text = 'Strong';
            } else if (strength >= 3) {
                color = '#fdca40';
                text = 'Medium';
            }
            
            // Update strength indicator
            const width = (strength / 5) * 100;
            
            // Create or update the strength fill element
            let strengthFill = strengthBar.querySelector('.strength-fill');
            if (!strengthFill) {
                strengthFill = document.createElement('div');
                strengthFill.className = 'strength-fill';
                strengthBar.appendChild(strengthFill);
            }
            
            // Update the fill
            strengthFill.style.width = width + '%';
            strengthFill.style.backgroundColor = color;
            strengthFill.style.height = '100%';
            strengthFill.style.borderRadius = '5px';
            strengthFill.style.transition = 'all 0.3s ease';
            
            strengthText.textContent = text;
            strengthText.style.color = color;
        });
    }
    
    // Form validation
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (signupForm && submitBtn) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('fullName')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
            const userType = document.getElementById('userType')?.value || 'student';
            const educationLevel = document.getElementById('educationLevel')?.value || 'highschool';
            const terms = document.getElementById('terms')?.checked || false;
            const newsletter = document.getElementById('newsletter')?.checked || false;
            
            // Validate form
            let isValid = true;
            let errorMessage = '';
            
            // Check if all required fields are filled
            if (!fullName || !email || !password || !confirmPassword) {
                isValid = false;
                errorMessage = 'Please fill in all required fields.';
            }
            
            // Check email format
            else if (!isValidEmail(email)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
            
            // Check if email already exists
            else if (emailExists(email)) {
                isValid = false;
                errorMessage = 'An account with this email already exists.';
            }
            
            // Check password match
            else if (password !== confirmPassword) {
                isValid = false;
                errorMessage = 'Passwords do not match.';
            }
            
            // Check password length
            else if (password.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long.';
            }
            
            // Check terms agreement
            else if (!terms) {
                isValid = false;
                errorMessage = 'You must agree to the Terms of Service and Privacy Policy.';
            }
            
            // Submit form if valid
            if (isValid) {
                // Show loading state
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                submitBtn.disabled = true;
                
                // Create user account
                const userCreated = createUser({
                    fullName,
                    email,
                    password,
                    userType,
                    educationLevel,
                    newsletter,
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true
                });
                
                if (userCreated) {
                    // Set current user session
                    setCurrentUser(email);
                    
                    // Show success message
                    showMessage('Account created successfully! Welcome to StudyMate!', 'success');
                    
                    // Redirect to dashboard after 2 seconds
                    setTimeout(function() {
                        window.location.href = 'dashboard.html'; // Create this page
                    }, 2000);
                } else {
                    // Show error message
                    showMessage('Error creating account. Please try again.', 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                // Show error message
                showMessage(errorMessage, 'error');
            }
        });
    }
    
    // Social sign up buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    if (socialButtons.length > 0) {
        socialButtons.forEach(button => {
            button.addEventListener('click', function() {
                const platform = this.classList.contains('google') ? 'Google' : 
                               this.classList.contains('facebook') ? 'Facebook' : 'Apple';
                
                showMessage(`Simulating ${platform} sign up...`, 'info');
                
                // For demo purposes, create a demo social account
                const demoEmail = `demo_${Date.now()}@social.com`;
                const demoName = `${platform} User`;
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
                this.disabled = true;
                
                setTimeout(() => {
                    const userCreated = createUser({
                        fullName: demoName,
                        email: demoEmail,
                        password: 'social_login_' + Date.now(),
                        userType: 'student',
                        educationLevel: 'undergraduate',
                        newsletter: true,
                        socialLogin: platform.toLowerCase(),
                        createdAt: new Date().toISOString(),
                        isActive: true
                    });
                    
                    if (userCreated) {
                        setCurrentUser(demoEmail);
                        showMessage(`Successfully signed in with ${platform}!`, 'success');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    } else {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        showMessage('Error with social login. Please try again.', 'error');
                    }
                }, 1500);
            });
        });
    }
    
    // Helper functions
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function emailExists(email) {
        const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }
    
    function createUser(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
            
            // Hash password (in a real app, use proper hashing)
            const hashedPassword = btoa(userData.password); // Simple encoding for demo
            
            const newUser = {
                id: Date.now(),
                ...userData,
                password: hashedPassword, // Store hashed password
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                profileComplete: false
            };
            
            users.push(newUser);
            localStorage.setItem('studymate_users', JSON.stringify(users));
            
            // Also store user profile separately for easy access
            localStorage.setItem('studymate_user_' + newUser.id, JSON.stringify({
                id: newUser.id,
                fullName: newUser.fullName,
                email: newUser.email,
                userType: newUser.userType,
                educationLevel: newUser.educationLevel,
                createdAt: newUser.createdAt
            }));
            
            console.log('User created:', newUser);
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    }
    
    function setCurrentUser(email) {
        const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('studymate_users', JSON.stringify(users));
            
            // Set current user session
            const sessionData = {
                userId: user.id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                loginTime: new Date().toISOString(),
                isLoggedIn: true
            };
            
            localStorage.setItem('studymate_current_user', JSON.stringify(sessionData));
            localStorage.setItem('studymate_is_logged_in', 'true');
            
            return true;
        }
        return false;
    }
    
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Set colors based on type
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
        messageElement.style.cssText = `
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
            text-align: left;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            background-color: ${style.backgroundColor};
            color: ${style.color};
            border: ${style.border};
        `;
        
        messageElement.querySelector('i').style.color = style.iconColor;
        
        // Insert message at the top of the form
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(messageElement, formHeader.nextSibling);
        } else {
            const form = document.querySelector('form');
            if (form) {
                form.insertBefore(messageElement, form.firstChild);
            }
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
    }
    
    // Add CSS animations only once
    if (!document.querySelector('#slide-animations')) {
        const style = document.createElement('style');
        style.id = 'slide-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateY(-10px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-10px);
                    opacity: 0;
                }
            }
            
            .fa-spinner {
                animation: fa-spin 1s linear infinite;
            }
            
            @keyframes fa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
});