document.addEventListener('DOMContentLoaded', () => {
    console.log('Orders page loaded');

    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('User not logged in, redirecting to login page');
        // Save current URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', 'orders.html');
        // Redirect to login page
        window.location.href = 'login.html?redirect=orders.html';
        return;
    }

    console.log('User is logged in, proceeding with orders page initialization');

    // Update navigation bar
    updateNavigation();

    // Setup event listeners
    setupEventListeners();

    // Load user orders
    loadUserOrders();
});


/**
 * Setup event listeners for the page
 */
function setupEventListeners() {
    // Sort dropdown
    const sortSelect = document.getElementById('sort-orders');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const ordersList = document.getElementById('orders-list');
            const loadingMessage = ordersList.querySelector('.loading-message');

            if (loadingMessage) {
                // If orders are still loading, do nothing
                return;
            }

            // Get the currently displayed orders
            const orders = JSON.parse(sessionStorage.getItem('userOrders') || '[]');
            if (orders.length > 0) {
                // Sort the orders based on selected option
                sortOrders(orders, this.value);
                // Display the sorted orders
                displayOrders(orders);
            }
        });
    }

    // Back button in order detail view
    const backButton = document.getElementById('back-to-list');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Hide detail view
            document.getElementById('order-detail').classList.add('hidden');
            // Show orders list
            document.getElementById('orders-list').classList.remove('hidden');
        });
    }
}

/**
 * Load user orders from the server
 */
function loadUserOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    const authToken = localStorage.getItem('authToken');

    // Display loading message
    ordersList.innerHTML = '<p class="loading-message">Loading your orders...</p>';

    // Fetch orders from API
    fetch('/api/orders', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return response.json();
        })
        .then(orders => {
            // Store orders in session storage for sorting later
            sessionStorage.setItem('userOrders', JSON.stringify(orders));

            // Sort orders by default (newest first)
            sortOrders(orders, 'date-desc');

            // Display the orders
            displayOrders(orders);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            ordersList.innerHTML = `
            <div class="no-orders-message">
                <p>Failed to load orders. Please try again later.</p>
                <button onclick="loadUserOrders()" class="view-button">Retry</button>
            </div>
        `;
        });
}

/**
 * Sort orders based on selected option
 * @param {Array} orders - Array of order objects
 * @param {string} sortOption - Sort option (date-desc, date-asc, total-desc, total-asc)
 */
function sortOrders(orders, sortOption) {
    switch (sortOption) {
        case 'date-desc':
            orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            break;
        case 'date-asc':
            orders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
            break;
        case 'total-desc':
            orders.sort((a, b) => b.totalAmount - a.totalAmount);
            break;
        case 'total-asc':
            orders.sort((a, b) => a.totalAmount - b.totalAmount);
            break;
    }
}

/**
 * Display orders in the orders list
 * @param {Array} orders - Array of order objects
 */
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders-message">
                <p>You haven't placed any orders yet.</p>
                <a href="index.html" class="view-button">Start Shopping</a>
            </div>
        `;
        return;
    }

    let ordersHTML = '';

    orders.forEach(order => {
        // Format date
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format status class
        const statusClass = order.status.toLowerCase();

        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <h3>Order #${order.orderNumber}</h3>
                    <span class="order-date">${formattedDate}</span>
                </div>
                <div class="order-info">
                    <span class="order-status ${statusClass}">${order.status}</span>
                    <span class="order-total">$${order.totalAmount.toFixed(2)}</span>
                </div>
                <div class="order-actions">
                    <button class="view-button" onclick="viewOrderDetails('${order.orderNumber}')">View Details</button>
                </div>
            </div>
        `;
    });

    ordersList.innerHTML = ordersHTML;
}

/**
 * View details of a specific order
 * @param {string} orderNumber - The order number to view
 */
function viewOrderDetails(orderNumber) {
    const authToken = localStorage.getItem('authToken');

    // Show loading in detail view
    document.getElementById('orders-list').classList.add('hidden');
    document.getElementById('order-detail').classList.remove('hidden');
    document.getElementById('detail-order-number').textContent = `Loading Order #${orderNumber}...`;
    document.getElementById('detail-date').textContent = '';
    document.getElementById('detail-status').textContent = '';
    document.getElementById('detail-total').textContent = '';
    document.getElementById('detail-address').textContent = '';
    document.getElementById('detail-items-list').innerHTML = '<p class="loading-message">Loading items...</p>';

    // Fetch order details from API
    fetch(`/api/orders/${orderNumber}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            return response.json();
        })
        .then(order => {
            // Format date
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Format status class
            const statusClass = order.status.toLowerCase();

            // Update detail view
            document.getElementById('detail-order-number').textContent = `Order #${order.orderNumber}`;
            document.getElementById('detail-date').textContent = formattedDate;
            document.getElementById('detail-status').innerHTML = `<span class="order-status ${statusClass}">${order.status}</span>`;
            document.getElementById('detail-total').textContent = `$${order.totalAmount.toFixed(2)}`;
            document.getElementById('detail-address').innerHTML = order.shippingAddress.replace(/\n/g, '<br>');

            // Display order items
            let itemsHTML = '';

            order.items.forEach(item => {
                itemsHTML += `
                <div class="detail-item">
                    <img src="${item.productImageUrl || 'images/placeholder.png'}" alt="${item.productName}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.productName}</div>
                        <div class="item-price">$${item.productPrice.toFixed(2)}</div>
                    </div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                    <div class="item-subtotal">$${item.subtotal.toFixed(2)}</div>
                </div>
            `;
            });

            document.getElementById('detail-items-list').innerHTML = itemsHTML;
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            document.getElementById('detail-items-list').innerHTML = `
            <p class="error-message">Failed to load order details. Please try again later.</p>
            <button onclick="viewOrderDetails('${orderNumber}')" class="view-button">Retry</button>
        `;
        });
}