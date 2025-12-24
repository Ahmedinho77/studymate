// login.js - Complete login system with localStorage integration
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.menu');
    
    // When mobile menu button is clicked
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle the 'active' class on the menu
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
    
    // Get the form
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Handle form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;
            
            // Validate and process login
            setTimeout(() => {
                // Simple validation
                let isValid = true;
                let errorMessage = '';
                
                // Check if all required fields are filled
                if (!email || !password) {
                    isValid = false;
                    errorMessage = 'Please fill in all required fields.';
                }
                
                // Check email format
                else if (!isValidEmail(email)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                
                if (isValid) {
                    // Check credentials against stored users
                    const loginSuccess = authenticateUser(email, password);
                    
                    if (loginSuccess) {
                        // Save "Remember me" preference
                        if (remember) {
                            localStorage.setItem('rememberLogin', 'true');
                        } else {
                            localStorage.removeItem('rememberLogin');
                        }
                        
                        // Show success message
                        showMessage('Login successful! Welcome back to StudyMate!', 'success');
                        
                        // Redirect to dashboard after a short delay
                        setTimeout(function() {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    } else {
                        // Show error message
                        showMessage('Invalid email or password. Please try again.', 'error');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                } else {
                    // Show error message
                    showMessage(errorMessage, 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }, 1000);
        });
    }
    
    // Simple password toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get platform name
            let platform = 'Google';
            if (this.classList.contains('facebook')) {
                platform = 'Facebook';
            } else if (this.classList.contains('apple')) {
                platform = 'Apple';
            }
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting...`;
            this.disabled = true;
            
            // For demo purposes, create a demo social account
            setTimeout(() => {
                const demoEmail = `social_${platform.toLowerCase()}_${Date.now()}@demo.com`;
                const demoName = `${platform} User`;
                
                // Check if demo user exists, otherwise create one
                let userExists = emailExists(demoEmail);
                
                if (!userExists) {
                    const userCreated = createSocialUser({
                        fullName: demoName,
                        email: demoEmail,
                        platform: platform.toLowerCase()
                    });
                    
                    if (userCreated) {
                        showMessage(`Successfully logged in with ${platform}!`, 'success');
                        
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    } else {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        showMessage('Error with social login. Please try again.', 'error');
                    }
                } else {
                    // Login existing demo user
                    setCurrentUser(demoEmail);
                    showMessage(`Welcome back via ${platform}!`, 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            }, 1500);
        });
    });
    
    // Forgot password link
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'forgotpassword.html';
        });
    }
    
    // Check if "Remember me" was previously checked
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox && localStorage.getItem('rememberLogin') === 'true') {
        rememberCheckbox.checked = true;
        
        // Auto-fill last used email if available
        const lastEmail = localStorage.getItem('studymate_last_email');
        if (lastEmail && document.getElementById('email')) {
            document.getElementById('email').value = lastEmail;
        }
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
    
    function authenticateUser(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (user) {
                // Simple password check (in a real app, use proper hashing comparison)
                const hashedPassword = btoa(password); // Same simple encoding as signup
                
                if (user.password === hashedPassword) {
                    // Update last login
                    user.lastLogin = new Date().toISOString();
                    localStorage.setItem('studymate_users', JSON.stringify(users));
                    
                    // Save last used email
                    localStorage.setItem('studymate_last_email', email);
                    
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
            }
            return false;
        } catch (error) {
            console.error('Error authenticating user:', error);
            return false;
        }
    }
    
    function createSocialUser(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
            
            const newUser = {
                id: Date.now(),
                fullName: userData.fullName,
                email: userData.email,
                password: btoa('social_login_' + Date.now()), // Dummy password for social login
                userType: 'student',
                educationLevel: 'undergraduate',
                newsletter: true,
                socialLogin: userData.platform,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                profileComplete: false
            };
            
            users.push(newUser);
            localStorage.setItem('studymate_users', JSON.stringify(users));
            
            // Set current user session
            const sessionData = {
                userId: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                userType: newUser.userType,
                loginTime: new Date().toISOString(),
                isLoggedIn: true
            };
            
            localStorage.setItem('studymate_current_user', JSON.stringify(sessionData));
            localStorage.setItem('studymate_is_logged_in', 'true');
            localStorage.setItem('studymate_last_email', newUser.email);
            
            return true;
        } catch (error) {
            console.error('Error creating social user:', error);
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
            
            // Save last used email
            localStorage.setItem('studymate_last_email', email);
            
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
    
    // Pre-populate demo account for testing (remove in production)
    function createDemoAccount() {
        const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
        const demoEmail = 'demo@studymate.com';
        
        if (!users.some(u => u.email === demoEmail)) {
            const demoUser = {
                id: Date.now(),
                fullName: 'Demo User',
                email: demoEmail,
                password: btoa('demo123'), // Password: demo123
                userType: 'student',
                educationLevel: 'undergraduate',
                newsletter: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                profileComplete: false
            };
            
            users.push(demoUser);
            localStorage.setItem('studymate_users', JSON.stringify(users));
            
            console.log('Demo account created: demo@studymate.com / demo123');
        }
    }
    
    // Create demo account on page load
    createDemoAccount();
});