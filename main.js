// script.js - Simple mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Get the mobile menu button and menu
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
    
   
});



