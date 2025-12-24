       document.addEventListener('DOMContentLoaded', function () {
            // Mobile menu toggle
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const menu = document.querySelector('.menu');

            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', function () {
                    menu.classList.toggle('active');
                    this.querySelector('i').classList.toggle('fa-bars');
                    this.querySelector('i').classList.toggle('fa-times');
                });
            }

            // Terms acceptance functionality
            const acceptBtn = document.getElementById('acceptTermsBtn');
            if (acceptBtn) {
                acceptBtn.addEventListener('click', function () {
                    // In a real application, this would save acceptance to user's account
                    // For demo purposes, we'll show a notification and redirect

                    // Show acceptance notification
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.innerHTML = `
                        <i class="fas fa-check-circle"></i> 
                        Thank you for accepting our Terms of Service! You can now use all StudyMate features.
                    `;
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 1rem 1.5rem;
                        background: #00b894;
                        color: white;
                        border-radius: 5px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                        z-index: 3000;
                        animation: slideInRight 0.3s forwards;
                        max-width: 400px;
                    `;

                    document.body.appendChild(notification);

                    // Add CSS for animation
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        @keyframes slideOutRight {
                            from { transform: translateX(0); opacity: 1; }
                            to { transform: translateX(100%); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);

                    // Change button state
                    acceptBtn.innerHTML = '<i class="fas fa-check"></i> Terms Accepted';
                    acceptBtn.style.background = '#00b894';
                    acceptBtn.style.color = 'white';
                    acceptBtn.disabled = true;

                    // Auto-remove notification after 5 seconds
                    setTimeout(() => {
                        notification.style.animation = 'slideOutRight 0.3s forwards';
                        setTimeout(() => {
                            notification.remove();
                            style.remove();
                        }, 300);
                    }, 5000);

                    // In a real app, you would:
                    // 1. Save acceptance to user's account
                    // 2. Update user's session/cookies
                    // 3. Possibly redirect to main app or signup

                    console.log('Terms accepted by user');
                });
            }

            // Smooth scrolling for table of contents links
            document.querySelectorAll('.toc-list a').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });

                        // Highlight the section
                        targetElement.style.transition = 'all 0.3s ease';
                        targetElement.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.3)';

                        setTimeout(() => {
                            targetElement.style.boxShadow = '';
                        }, 1500);
                    }
                });
            });

            // Add "back to top" functionality
            const backToTopBtn = document.createElement('button');
            backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #6c5ce7;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
            `;

            document.body.appendChild(backToTopBtn);

            // Show/hide back to top button
            window.addEventListener('scroll', function () {
                if (window.pageYOffset > 300) {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.transform = 'translateY(0)';
                } else {
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.transform = 'translateY(20px)';
                }
            });

            backToTopBtn.addEventListener('click', function () {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });