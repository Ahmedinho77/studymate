// forgetpassword.js - Complete password recovery with login status integration
document.addEventListener('DOMContentLoaded', function() {
    
    // Login status variables
    let isUserLoggedIn = false;
    let currentUser = null;
    
    // Password recovery variables
    let currentStep = 1;
    let userEmail = '';
    let countdownInterval;
    let resendAttempts = 0;
    const MAX_RESEND_ATTEMPTS = 3;
    
    // Initialize the page
    initializePage();
    
    function initializePage() {
        // First check login status
        checkLoginStatus();
        
        // Setup navigation and forms
        setupStepNavigation();
        setupEmailForm();
        setupCodeForm();
        setupPasswordForm();
        setupPasswordToggle();
        setupCodeInputs();
        setupMobileMenu();
        setupPasswordStrengthMeter();
        updateStepDisplay();
    }
    
    function checkLoginStatus() {
        currentUser = JSON.parse(localStorage.getItem('studymate_current_user') || 'null');
        isUserLoggedIn = localStorage.getItem('studymate_is_logged_in') === 'true';
        
        // Update navbar based on login status
        updateNavbar();
        
        // Show login status alert if user is logged in
        if (isUserLoggedIn && currentUser) {
            showLoginStatusAlert();
            
            // Pre-fill email field with logged-in user's email
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = currentUser.email;
                userEmail = currentUser.email;
                document.getElementById('userEmail').textContent = currentUser.email;
            }
        }
    }
    
    function updateNavbar() {
        const userNavItem = document.getElementById('userNavItem');
        if (!userNavItem) return;
        
        if (isUserLoggedIn && currentUser) {
            const firstName = currentUser.fullName.split(' ')[0];
            userNavItem.innerHTML = `
                <button class="nav-btn"><a href="dashboard.html"><i class="fas fa-user"></i> Hi, ${firstName}</a></button>
            `;
        } else {
            userNavItem.innerHTML = `
                <button class="nav-btn"><a href="signUp.html"><i class="fas fa-user-plus"></i> Sign Up</a></button>
            `;
        }
    }
    
    function showLoginStatusAlert() {
        const alertElement = document.getElementById('loginStatusAlert');
        const loggedInEmail = document.getElementById('loggedInEmail');
        const alertMessage = document.getElementById('alertMessage');
        
        if (alertElement && loggedInEmail && alertMessage) {
            loggedInEmail.textContent = currentUser.email;
            alertElement.style.display = 'block';
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logoutFromAlert');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    logoutUser();
                });
            }
        }
    }
    
    function logoutUser() {
        localStorage.removeItem('studymate_current_user');
        localStorage.setItem('studymate_is_logged_in', 'false');
        showAlert('You have been logged out successfully.', 'success');
        
        // Refresh page to update login status
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    function setupStepNavigation() {
        const stepIndicators = document.querySelectorAll('.step');
        stepIndicators.forEach(step => {
            step.addEventListener('click', function() {
                const stepNumber = parseInt(this.getAttribute('data-step'));
                if (stepNumber < currentStep) {
                    currentStep = stepNumber;
                    updateStepDisplay();
                }
            });
        });
    }
    
    function setupEmailForm() {
        const emailForm = document.getElementById('emailForm');
        if (emailForm) {
            emailForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!email || !emailRegex.test(email)) {
                    showAlert('Please enter a valid email address.', 'error');
                    shakeElement(document.getElementById('email'));
                    return;
                }
                
                // Check if email exists in registered users
                if (!checkIfEmailExists(email)) {
                    showAlert('No account found with this email address. Please check or sign up.', 'error');
                    return;
                }
                
                // Save email for display in next step
                userEmail = email;
                document.getElementById('userEmail').textContent = email;
                
                // Show loading state
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Simulate API call delay
                setTimeout(() => {
                    // Send verification code
                    const verificationCode = generateVerificationCode();
                    saveVerificationCode(email, verificationCode);
                    
                    showAlert(`Verification code sent to ${email}. Use code: ${verificationCode} for demo.`, 'success');
                    
                    // Move to step 2
                    currentStep = 2;
                    updateStepDisplay();
                    startCountdown();
                    
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            });
            
            // Add real-time email validation
            const emailInput = document.getElementById('email');
            emailInput.addEventListener('blur', function() {
                validateEmail(this.value);
            });
        }
    }
    
    function checkIfEmailExists(email) {
        try {
            const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
            const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
            
            // Also check if it's the currently logged in user
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
                return true;
            }
            
            return userExists;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    }
    
    function generateVerificationCode() {
        // For demo, always return 123456
        // In production, generate random 6-digit code
        return '123456';
    }
    
    function saveVerificationCode(email, code) {
        const recoveryData = {
            email: email,
            code: code,
            timestamp: new Date().getTime(),
            expires: new Date().getTime() + (5 * 60 * 1000) // 5 minutes
        };
        
        localStorage.setItem(`password_recovery_${email}`, JSON.stringify(recoveryData));
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        const emailInput = document.getElementById('email');
        if (email && !isValid) {
            emailInput.style.borderColor = '#e74c3c';
        } else if (isValid) {
            emailInput.style.borderColor = '#2ecc71';
        } else {
            emailInput.style.borderColor = '#e9ecef';
        }
        
        return isValid;
    }
    
    function setupCodeForm() {
        const codeForm = document.getElementById('codeForm');
        const resendBtn = document.getElementById('resendBtn');
        
        if (codeForm) {
            codeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get all code inputs
                const codeInputs = document.querySelectorAll('.code-input');
                let code = '';
                
                codeInputs.forEach(input => {
                    code += input.value;
                });
                
                // Validate code
                if (code.length !== 6) {
                    showAlert('Please enter a complete 6-digit verification code.', 'error');
                    shakeElement(codeForm);
                    return;
                }
                
                // Show loading state
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                submitBtn.disabled = true;
                
                // Simulate API verification delay
                setTimeout(() => {
                    // Get saved verification code
                    const recoveryData = JSON.parse(localStorage.getItem(`password_recovery_${userEmail}`) || '{}');
                    const savedCode = recoveryData.code;
                    const isExpired = recoveryData.expires && new Date().getTime() > recoveryData.expires;
                    
                    if (isExpired) {
                        showAlert('Verification code has expired. Please request a new one.', 'error');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        return;
                    }
                    
                    // Demo: Accept saved code or "123456"
                    if (code === savedCode || code === '123456') {
                        showAlert('Code verified successfully!', 'success');
                        
                        // Move to step 3
                        currentStep = 3;
                        updateStepDisplay();
                        stopCountdown();
                    } else {
                        showAlert('Invalid verification code. Please try again.', 'error');
                        shakeElement(codeForm);
                    }
                    
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1000);
            });
        }
        
        if (resendBtn) {
            resendBtn.addEventListener('click', function() {
                if (!this.disabled && resendAttempts < MAX_RESEND_ATTEMPTS) {
                    resendAttempts++;
                    
                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
                    this.disabled = true;
                    
                    // Simulate API call delay
                    setTimeout(() => {
                        // Generate and save new code
                        const verificationCode = generateVerificationCode();
                        saveVerificationCode(userEmail, verificationCode);
                        
                        showAlert(`New verification code sent to ${userEmail}. Use code: ${verificationCode} for demo.`, 'success');
                        startCountdown();
                        
                        // Update resend attempts display
                        const remainingAttempts = MAX_RESEND_ATTEMPTS - resendAttempts;
                        if (remainingAttempts > 0) {
                            console.log(`Resend attempts remaining: ${remainingAttempts}`);
                        } else {
                            showAlert('Maximum resend attempts reached. Please try again later.', 'warning');
                        }
                        
                        // Reset button state
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }, 1500);
                }
            });
        }
    }
    
    function setupPasswordForm() {
        const passwordForm = document.getElementById('passwordForm');
        
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmNewPassword').value;
                
                // Check if passwords match
                if (newPassword !== confirmPassword) {
                    showAlert('Passwords do not match. Please try again.', 'error');
                    shakeElement(document.getElementById('confirmNewPassword'));
                    return;
                }
                
                // Check password length
                if (newPassword.length < 8) {
                    showAlert('Password must be at least 8 characters long.', 'error');
                    shakeElement(document.getElementById('newPassword'));
                    return;
                }
                
                // Check password complexity
                const hasUpperCase = /[A-Z]/.test(newPassword);
                const hasLowerCase = /[a-z]/.test(newPassword);
                const hasNumbers = /\d/.test(newPassword);
                
                if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                    showAlert('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 'error');
                    return;
                }
                
                // Show loading state
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting Password...';
                submitBtn.disabled = true;
                
                // Simulate API call delay
                setTimeout(() => {
                    // Update password in localStorage
                    const passwordUpdated = updateUserPassword(userEmail, newPassword);
                    
                    if (passwordUpdated) {
                        showAlert('Password has been successfully reset!', 'success');
                        
                        // If user is currently logged in, log them out
                        if (isUserLoggedIn && currentUser && currentUser.email === userEmail) {
                            logoutUserForSecurity();
                        }
                        
                        // Move to step 4
                        currentStep = 4;
                        updateStepDisplay();
                        
                        // Clear verification data
                        localStorage.removeItem(`password_recovery_${userEmail}`);
                    } else {
                        showAlert('Failed to reset password. Please try again.', 'error');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }, 2000);
            });
            
            // Live password validation
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmNewPassword');
            
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', function() {
                    const password = this.value;
                    validatePasswordRequirements(password);
                    updatePasswordStrengthMeter(password);
                    
                    // Real-time confirmation validation
                    const confirmPassword = confirmPasswordInput.value;
                    if (confirmPassword) {
                        validatePasswordMatch(password, confirmPassword);
                    }
                });
            }
            
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', function() {
                    const password = newPasswordInput.value;
                    const confirmPassword = this.value;
                    validatePasswordMatch(password, confirmPassword);
                });
            }
        }
    }
    
    function updateUserPassword(email, newPassword) {
        try {
            const users = JSON.parse(localStorage.getItem('studymate_users') || '[]');
            const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
            
            if (userIndex >= 0) {
                // Hash password (simple encoding for demo)
                const hashedPassword = btoa(newPassword);
                users[userIndex].password = hashedPassword;
                users[userIndex].lastPasswordChange = new Date().toISOString();
                
                localStorage.setItem('studymate_users', JSON.stringify(users));
                
                // If this is the current user, update session
                if (currentUser && currentUser.email === email) {
                    currentUser.lastPasswordChange = new Date().toISOString();
                    localStorage.setItem('studymate_current_user', JSON.stringify(currentUser));
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating password:', error);
            return false;
        }
    }
    
    function logoutUserForSecurity() {
        localStorage.removeItem('studymate_current_user');
        localStorage.setItem('studymate_is_logged_in', 'false');
        
        // Show security message
        const step4Content = document.querySelector('#step4 .success-message p');
        if (step4Content) {
            step4Content.innerHTML += '<br><strong>For security reasons, you have been logged out from all devices. Please log in again with your new password.</strong>';
        }
    }
    
    function setupPasswordToggle() {
        const togglePasswordBtns = document.querySelectorAll('.toggle-password');
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const passwordInput = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    this.setAttribute('aria-label', 'Hide password');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    this.setAttribute('aria-label', 'Show password');
                }
            });
        });
    }
    
    function setupCodeInputs() {
        const codeInputs = document.querySelectorAll('.code-input');
        codeInputs.forEach((input, index) => {
            // Auto-focus first input
            if (index === 0) {
                input.focus();
            }
            
            // Handle input
            input.addEventListener('input', function(e) {
                if (this.value.length === 1 && /[0-9]/.test(this.value)) {
                    // Move to next input if available
                    if (index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                } else if (this.value.length > 1) {
                    this.value = this.value.charAt(0);
                }
                
                // Auto-submit when all fields are filled
                if (index === codeInputs.length - 1 && this.value.length === 1) {
                    const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
                    if (allFilled) {
                        setTimeout(() => {
                            document.getElementById('codeForm').dispatchEvent(new Event('submit'));
                        }, 300);
                    }
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value.length === 0) {
                    if (index > 0) {
                        codeInputs[index - 1].focus();
                        codeInputs[index - 1].value = '';
                    }
                }
            });
            
            // Handle paste
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                if (/^\d{6}$/.test(pastedData)) {
                    const digits = pastedData.split('');
                    codeInputs.forEach((input, i) => {
                        if (i < digits.length) {
                            input.value = digits[i];
                        }
                    });
                    
                    if (codeInputs.length > 0) {
                        codeInputs[Math.min(digits.length, codeInputs.length) - 1].focus();
                    }
                    
                    setTimeout(() => {
                        document.getElementById('codeForm').dispatchEvent(new Event('submit'));
                    }, 300);
                }
            });
            
            // Allow only numbers
            input.addEventListener('keypress', function(e) {
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
            
            // Handle arrow keys for navigation
            input.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' && index > 0) {
                    codeInputs[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            });
        });
    }
    
    function setupPasswordStrengthMeter() {
        const passwordGroup = document.querySelector('.form-group');
        if (passwordGroup) {
            const strengthMeter = document.createElement('div');
            strengthMeter.className = 'password-strength-meter';
            strengthMeter.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill"></div>
                </div>
                <div class="strength-text"></div>
            `;
            
            const passwordRequirements = document.querySelector('.password-requirements');
            if (passwordRequirements) {
                passwordRequirements.parentNode.insertBefore(strengthMeter, passwordRequirements);
            }
        }
    }
    
    function updatePasswordStrengthMeter(password) {
        const strengthMeter = document.querySelector('.password-strength-meter');
        if (!strengthMeter) return;
        
        const strengthFill = strengthMeter.querySelector('.strength-fill');
        const strengthText = strengthMeter.querySelector('.strength-text');
        
        let strength = 0;
        let color = '#e74c3c';
        let text = 'Very Weak';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        
        if (/[^A-Za-z0-9]/.test(password)) strength = Math.min(strength + 10, 100);
        
        if (strength >= 80) {
            color = '#2ecc71';
            text = 'Strong';
        } else if (strength >= 60) {
            color = '#f39c12';
            text = 'Good';
        } else if (strength >= 40) {
            color = '#f1c40f';
            text = 'Fair';
        } else if (strength >= 20) {
            color = '#e67e22';
            text = 'Weak';
        }
        
        strengthFill.style.width = `${strength}%`;
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
    
    function validatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password)
        };
        
        const reqLength = document.querySelector('.req-length');
        const reqUppercase = document.querySelector('.req-uppercase');
        const reqLowercase = document.querySelector('.req-lowercase');
        const reqNumber = document.querySelector('.req-number');
        
        if (reqLength) updateRequirementIndicator(reqLength, requirements.length);
        if (reqUppercase) updateRequirementIndicator(reqUppercase, requirements.uppercase);
        if (reqLowercase) updateRequirementIndicator(reqLowercase, requirements.lowercase);
        if (reqNumber) updateRequirementIndicator(reqNumber, requirements.number);
        
        return requirements;
    }
    
    function updateRequirementIndicator(element, isMet) {
        const icon = element.querySelector('i');
        if (isMet) {
            element.classList.add('requirement-met');
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#2ecc71';
            element.style.color = '#2ecc71';
        } else {
            element.classList.remove('requirement-met');
            icon.className = 'fas fa-circle';
            icon.style.color = '#636e72';
            element.style.color = '#636e72';
        }
    }
    
    function validatePasswordMatch(password, confirmPassword) {
        const confirmInput = document.getElementById('confirmNewPassword');
        if (!confirmInput) return;
        
        if (confirmPassword.length === 0) {
            confirmInput.style.borderColor = '#e9ecef';
            return;
        }
        
        if (password === confirmPassword && password.length >= 8) {
            confirmInput.style.borderColor = '#2ecc71';
        } else {
            confirmInput.style.borderColor = '#e74c3c';
        }
    }
    
    function startCountdown() {
        const countdownElement = document.getElementById('countdown');
        const resendBtn = document.getElementById('resendBtn');
        let timeLeft = 300;
        
        stopCountdown();
        
        countdownInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = '00:00';
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend Code';
                    showAlert('Verification code has expired. Please request a new one.', 'warning');
                }
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
        }, 1000);
        
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.innerHTML = `<i class="fas fa-redo"></i> Resend Code (${MAX_RESEND_ATTEMPTS - resendAttempts} left)`;
        }
    }
    
    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }
    
    function updateStepDisplay() {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        const stepContents = document.querySelectorAll('.step-content');
        stepContents.forEach(content => {
            const stepId = content.id;
            const stepNumber = parseInt(stepId.replace('step', ''));
            
            if (stepNumber === currentStep) {
                content.classList.add('active');
                
                switch(stepNumber) {
                    case 1:
                        const emailInput = document.getElementById('email');
                        if (emailInput && !emailInput.value) {
                            emailInput.focus();
                        }
                        break;
                    case 2:
                        const codeInputs = document.querySelectorAll('.code-input');
                        if (codeInputs.length > 0) {
                            codeInputs[0].focus();
                        }
                        startCountdown();
                        break;
                    case 3:
                        const passwordInput = document.getElementById('newPassword');
                        if (passwordInput) {
                            passwordInput.focus();
                        }
                        break;
                    case 4:
                        console.log('Password reset completed');
                        break;
                }
            } else {
                content.classList.remove('active');
            }
        });
        
        history.pushState(null, null, `#step${currentStep}`);
        
        window.scrollTo({
            top: document.querySelector('.forgot-password-content').offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    function showAlert(message, type = 'info') {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.classList.remove('show');
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        const closeBtn = alert.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                alert.classList.remove('show');
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 300);
            });
        }
    }
    
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    function setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                const menu = document.querySelector('.navbar .menu');
                if (menu) {
                    menu.classList.toggle('active');
                    const icon = this.querySelector('i');
                    if (menu.classList.contains('active')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        }
    }
    
    window.addEventListener('popstate', function() {
        const hash = window.location.hash;
        if (hash) {
            const stepNumber = parseInt(hash.replace('#step', ''));
            if (stepNumber >= 1 && stepNumber <= 4) {
                currentStep = stepNumber;
                updateStepDisplay();
            }
        }
    });
    
    if (window.location.hash) {
        const stepNumber = parseInt(window.location.hash.replace('#step', ''));
        if (stepNumber >= 1 && stepNumber <= 4) {
            currentStep = stepNumber;
            updateStepDisplay();
        }
    }
    
    // Add CSS for custom alert and login status
    const style = document.createElement('style');
    style.textContent = `
        .custom-alert {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 500px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
            border-left: 4px solid #3498db;
        }
        
        .custom-alert.show {
            transform: translateX(0);
        }
        
        .custom-alert.success {
            border-left-color: #2ecc71;
        }
        
        .custom-alert.error {
            border-left-color: #e74c3c;
        }
        
        .custom-alert.warning {
            border-left-color: #f39c12;
        }
        
        .alert-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }
        
        .alert-content i {
            font-size: 1.2rem;
        }
        
        .alert-content i.fa-check-circle {
            color: #2ecc71;
        }
        
        .alert-content i.fa-exclamation-circle {
            color: #e74c3c;
        }
        
        .alert-content i.fa-exclamation-triangle {
            color: #f39c12;
        }
        
        .alert-content i.fa-info-circle {
            color: #3498db;
        }
        
        .alert-close {
            background: none;
            border: none;
            color: #636e72;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.25rem;
            margin-left: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .alert-close:hover {
            color: #2d3436;
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .password-strength-meter {
            margin-top: 1rem;
        }
        
        .strength-bar {
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .strength-fill {
            height: 100%;
            width: 0%;
            border-radius: 3px;
            transition: width 0.3s ease, background-color 0.3s ease;
        }
        
        .strength-text {
            font-size: 0.85rem;
            font-weight: 600;
            text-align: right;
        }
        
        .login-status-alert {
            background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
            color: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
            animation: slideDown 0.5s ease;
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .login-status-alert .alert-content {
            margin-bottom: 1rem;
        }
        
        .login-status-alert .alert-content i {
            font-size: 1.5rem;
            color: white;
        }
        
        .login-status-alert .alert-content span {
            font-size: 1rem;
            font-weight: 500;
        }
        
        .login-status-alert .alert-actions {
            display: flex;
            gap: 1rem;
        }
        
        .alert-btn {
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            font-size: 0.9rem;
        }
        
        .alert-btn.primary {
            background: white;
            color: #6c5ce7;
        }
        
        .alert-btn.primary:hover {
            background: #f8f9fa;
            transform: translateY(-2px);
        }
        
        .alert-btn.secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .alert-btn.secondary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .custom-alert {
                top: 10px;
                right: 10px;
                left: 10px;
                min-width: auto;
                max-width: none;
            }
            
            .login-status-alert .alert-actions {
                flex-direction: column;
            }
            
            .alert-btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
});