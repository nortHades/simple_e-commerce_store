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

/**
 * Get cart item count
 * @returns {number} - Total number of items in cart
 */
function getCartItemCount() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Update cart count in the UI
 */
function updateCartCount() {
    const cartLink = document.querySelector('a[href="cart.html"]');
    if (!cartLink) return;

    const count = getCartItemCount();

    // Remove any existing badge
    const existingBadge = cartLink.querySelector('.cart-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    // If cart has items, add a badge
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = count;

        // Style the badge
        badge.style.backgroundColor = '#B5EAEA';
        badge.style.color = 'white';
        badge.style.borderRadius = '50%';
        badge.style.padding = '0.25em 0.6em';
        badge.style.fontSize = '0.8em';
        badge.style.fontWeight = 'bold';
        badge.style.marginLeft = '5px';

        cartLink.appendChild(badge);
    }
}

/**
 * Add product to cart
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 * @returns {Object} cartItem - The cart item that was added or updated
 */
function addToCartAndSelect(product, quantity) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    let cartItem;

    if (existingItemIndex > -1) {
        // Update quantity if product is already in cart
        cart[existingItemIndex].quantity += quantity;
        cartItem = cart[existingItemIndex];
    } else {
        // Add new item to cart
        cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity
        };
        cart.push(cartItem);
    }

    // Save updated cart
    localStorage.setItem('shoppingCart', JSON.stringify(cart));

    // Add to selected items (default selected)
    let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
    if (!selectedItems.includes(product.id)) {
        selectedItems.push(product.id);
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
    }

    // Update cart count in UI
    updateCartCount();

    // If user is logged in, sync cart to server
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        syncCartWithServer(cart);
    }

    return cartItem;
}

/**
 * Sync cart with the server
 * @param {Array} cart - The cart to sync
 */
function syncCartWithServer(cart) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    fetch('/api/users/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ items: cart })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to sync cart');
            }
            console.log('Cart synchronized with server successfully');
        })
        .catch(error => {
            console.error('Error syncing cart with server:', error);
        });
}

/**
 * Show Add to Cart confirmation modal with options
 * @param {Object} product - The product that was added
 * @param {number} quantity - The quantity that was added
 * @param {Object} options - Additional options like size
 */
function showAddToCartModal(product, quantity, options = {}) {
    // Create modal background
    const modal = document.createElement('div');
    modal.className = 'add-to-cart-modal';

    // Calculate cart subtotal
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-message">
                <span class="check-icon">✓</span>
                <span>Added to cart</span>
            </div>
            <div class="product-info-mini">
                <img src="${product.imageUrl || 'images/placeholder.png'}" alt="${product.name}">
                <div>
                    <div class="product-name">${product.name}</div>
                    ${options.size ? `<div class="product-size">Size: ${options.size}</div>` : ''}
                    <div class="product-quantity">Quantity: ${quantity}</div>
                </div>
            </div>
            <div class="cart-subtotal">
                <div class="subtotal-label">Cart Subtotal (${cartItemCount} items):</div>
                <div class="subtotal-value">${formatCurrency(cartTotal)}</div>
            </div>
            <div class="modal-actions">
                <button class="go-to-cart-btn">Go to Cart</button>
                <button class="proceed-to-checkout-btn">Proceed to Checkout (${cartItemCount} items)</button>
            </div>
        </div>
    `;

    // Add to body
    document.body.appendChild(modal);

    // Trigger animation (delay for DOM to update)
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);

    // Add event listeners
    modal.querySelector('.go-to-cart-btn').addEventListener('click', function() {
        closeModal(modal);
        window.location.href = 'cart.html';
    });

    modal.querySelector('.proceed-to-checkout-btn').addEventListener('click', function() {
        closeModal(modal);
        // Check if user is logged in
        if (!localStorage.getItem('authToken')) {
            sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
            window.location.href = 'login.html';
        } else {
            window.location.href = 'checkout.html';
        }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // Close modal after 10 seconds if no action
    setTimeout(() => {
        if (document.body.contains(modal)) {
            closeModal(modal);
        }
    }, 10000);
}

/**
 * Close the modal with animation
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    modal.classList.remove('visible');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

// Call updateCartCount when the page loads
document.addEventListener('DOMContentLoaded', updateCartCount);