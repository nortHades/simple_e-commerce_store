/**
 * Common functions for all pages
 */

/**
 * Update the navigation bar based on authentication status
 */
function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const ordersLink = document.getElementById('orders-link');

    if (!loginLink) return;

    const authToken = localStorage.getItem('authToken');
    let currentUser = null;

    try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            currentUser = JSON.parse(currentUserStr);
        }
    } catch (e) {
        console.error("Error parsing currentUser JSON:", e);
        localStorage.removeItem('currentUser');
    }

    // Handle My Orders link visibility
    if (ordersLink) {
        if (authToken && currentUser) {
            ordersLink.style.display = 'inline-block'; // Show orders link for logged in users
        } else {
            ordersLink.style.display = 'none'; // Hide orders link for logged out users
        }
    }

    if (authToken && currentUser) {
        // User is logged in, show username and logout button
        loginLink.textContent = `${currentUser.username} (Logout)`;
        loginLink.classList.add('logout-button');
        loginLink.href = '#';

        // Create a new link to remove existing handlers
        const newLoginLink = loginLink.cloneNode(true);
        newLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear stored authentication information
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            // Redirect to login page or reload current page depending on context
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'checkout.html' || currentPage === 'orders.html' || currentPage === 'order-confirmation.html') {
                window.location.href = 'login.html';
            } else {
                window.location.reload();
            }
        });

        // Replace the old link with the new one
        loginLink.parentNode.replaceChild(newLoginLink, loginLink);
    } else {
        // User is not logged in, show login link
        loginLink.textContent = 'Login';
        loginLink.classList.remove('logout-button');
        loginLink.href = 'login.html';

        // Remove any existing click event listeners
        const newLoginLink = loginLink.cloneNode(true);
        loginLink.parentNode.replaceChild(newLoginLink, loginLink);
    }
}

/**
 * Check if user is authenticated and redirect to login if not
 * @param {string} redirectPath - The path to redirect after login
 * @returns {boolean} - True if authenticated, false otherwise
 */
function checkAuthentication(redirectPath) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('User not logged in, redirecting to login page');
        // Save current URL to redirect back after login
        if (redirectPath) {
            sessionStorage.setItem('redirectAfterLogin', redirectPath);
        } else {
            const currentPage = window.location.pathname.split('/').pop();
            sessionStorage.setItem('redirectAfterLogin', currentPage);
        }
        // Redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Format currency value
 * @param {number} value - The value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    return '$' + (value || 0).toFixed(2);
}

/**
 * Format date to localized string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}