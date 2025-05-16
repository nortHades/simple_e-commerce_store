document.addEventListener('DOMContentLoaded', () => {
    console.log('Order detail page loaded');

    // Check if user is logged in
    if (!checkAuthentication('orders.html')) {
        return; // Stop execution if not authenticated
    }

    // Update navigation
    updateNavigation();

    // Get order number from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber');

    if (!orderNumber) {
        // No order number provided, redirect to orders page
        console.error('No order number provided');
        window.location.href = 'orders.html';
        return;
    }

    // Load order details
    loadOrderDetails(orderNumber);

    // Set up event listeners
    setupEventListeners();
});

/**
 * Set up event listeners for the page
 */
function setupEventListeners() {
    // Cancel order button (will be added dynamically)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'cancel-order-btn') {
            // Show confirmation modal
            document.getElementById('cancel-confirmation').classList.remove('hidden');
        }
    });

    // Confirm cancel button
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', function() {
            const orderNumber = new URLSearchParams(window.location.search).get('orderNumber');
            if (orderNumber) {
                cancelOrder(orderNumber);
            }
            document.getElementById('cancel-confirmation').classList.add('hidden');
        });
    }

    // Cancel modal button
    const cancelCancelBtn = document.getElementById('cancel-cancel');
    if (cancelCancelBtn) {
        cancelCancelBtn.addEventListener('click', function() {
            document.getElementById('cancel-confirmation').classList.add('hidden');
        });
    }
}

/**
 * Load order details from the server
 * @param {string} orderNumber - The order number to load details for
 */
function loadOrderDetails(orderNumber) {
    const authToken = localStorage.getItem('authToken');

    // Update page title
    document.getElementById('order-number').textContent = `Order #${orderNumber}`;

    // Fetch order details
    fetch(`/api/orders/${orderNumber}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(order => {
            displayOrderDetails(order);
        })
        .catch(error => {
            console.error('Error loading order details:', error);
            document.getElementById('order-items').innerHTML = `
            <div class="order-status-message error">
                <p>Failed to load order details. Please try again later.</p>
                <p><a href="orders.html">Return to My Orders</a></p>
            </div>
        `;
        });
}

/**
 * Display order details on the page
 * @param {Object} order - The order object
 */
function displayOrderDetails(order) {
    // Format date
    const orderDate = formatDate(order.orderDate);

    // Update status with appropriate class
    const statusElement = document.getElementById('order-status');
    statusElement.textContent = order.status;
    statusElement.className = `order-status ${order.status.toLowerCase()}`;

    // Update basic order info
    document.getElementById('order-date').textContent = orderDate;
    document.getElementById('order-total').textContent = formatCurrency(order.totalAmount);
    document.getElementById('shipping-address').innerHTML = order.shippingAddress.replace(/\n/g, '<br>');

    // Display order items
    displayOrderItems(order.items);

    // Add cancel button if order is in cancellable state
    updateOrderActions(order);
}

/**
 * Display order items in a table
 * @param {Array} items - The order items
 */
function displayOrderItems(items) {
    const orderItemsDiv = document.getElementById('order-items');

    if (!items || items.length === 0) {
        orderItemsDiv.innerHTML = '<p>No items found in this order.</p>';
        return;
    }

    let itemsHTML = `
        <table class="item-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;

    items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>
                    <div class="item-details">
                        <img src="${item.productImageUrl || 'images/placeholder.png'}" alt="${item.productName}" class="item-image">
                        <div class="item-info">
                            <div class="item-name">${item.productName}</div>
                            <div class="item-price">${formatCurrency(item.productPrice)}</div>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.productPrice)}</td>
                <td>${item.quantity}</td>
                <td class="item-subtotal">${formatCurrency(item.subtotal)}</td>
            </tr>
        `;
    });

    itemsHTML += `
            </tbody>
        </table>
    `;

    orderItemsDiv.innerHTML = itemsHTML;
}

/**
 * Update order actions based on order status
 * @param {Object} order - The order object
 */
function updateOrderActions(order) {
    const actionsDiv = document.getElementById('order-actions');

    // Clear existing actions
    actionsDiv.innerHTML = '';

    // Add cancel button if order is cancellable
    if (order.status === 'PENDING' || order.status === 'PROCESSING') {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-order-btn';
        cancelBtn.className = 'cancel-button';
        cancelBtn.textContent = 'Cancel Order';
        actionsDiv.appendChild(cancelBtn);
    } else if (order.status === 'CANCELLED') {
        // Show cancelled message
        const message = document.createElement('div');
        message.className = 'order-status-message info';
        message.textContent = 'This order has been cancelled.';
        actionsDiv.appendChild(message);
    } else if (order.status === 'SHIPPED') {
        // Show shipped message
        const message = document.createElement('div');
        message.className = 'order-status-message info';
        message.textContent = 'This order has been shipped and cannot be cancelled.';
        actionsDiv.appendChild(message);
    } else if (order.status === 'DELIVERED') {
        // Show delivered message
        const message = document.createElement('div');
        message.className = 'order-status-message success';
        message.textContent = 'This order has been delivered.';
        actionsDiv.appendChild(message);
    }
}

/**
 * Cancel an order
 * @param {string} orderNumber - The order number to cancel
 */
function cancelOrder(orderNumber) {
    const authToken = localStorage.getItem('authToken');

    // Show processing message
    const actionsDiv = document.getElementById('order-actions');
    actionsDiv.innerHTML = '<div class="loading-message">Processing your cancellation request...</div>';

    // Send cancel request
    fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Order cancelled successfully:', data);

            // Update UI with success message
            actionsDiv.innerHTML = `
            <div class="order-status-message success">
                <p>Order cancelled successfully!</p>
            </div>
        `;

            // Update status display
            const statusElement = document.getElementById('order-status');
            statusElement.textContent = 'CANCELLED';
            statusElement.className = 'order-status cancelled';

            // Refresh the order details after a short delay
            setTimeout(() => {
                loadOrderDetails(orderNumber);
            }, 2000);
        })
        .catch(error => {
            console.error('Error cancelling order:', error);

            // Show error message
            actionsDiv.innerHTML = `
            <div class="order-status-message error">
                <p>Failed to cancel order. Please try again later.</p>
            </div>
            <button id="cancel-order-btn" class="cancel-button">Try Again</button>
        `;
        });
}