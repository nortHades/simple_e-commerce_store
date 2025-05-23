document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout page loaded');

    // Check if user is logged in - frontend authentication check
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('User not logged in, redirecting to login page');
        // Save current URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
        // Redirect to login page
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    console.log('User is logged in, proceeding with checkout page initialization');

    // Update navigation bar
    updateNavigation();

    // Load cart data
    loadSelectedItems();

    // Handle checkout form submission
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
});


/**
 * Load selected items from localStorage
 */
function loadSelectedItems() {
    const orderItemsDiv = document.getElementById('order-items');
    const orderTotalDiv = document.getElementById('order-total');

    // Get the full cart from localStorage
    const fullCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Get the selected items array
    const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

    // Filter the cart to only include selected items
    const cart = fullCart.filter(item => selectedItems.includes(item.id));

    if (cart.length === 0) {
        orderItemsDiv.innerHTML = '<p>No items selected for checkout. <a href="cart.html">Return to cart</a> to select items.</p>';
        orderTotalDiv.innerHTML = 'Total: $0.00';

        // Disable checkout button
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.disabled = true;
        }
        return;
    }

    let orderItemsHTML = '';
    let overallTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        overallTotal += itemTotal;

        orderItemsHTML += `
            <div class="checkout-product">
                <img src="${item.imageUrl || 'images/placeholder.png'}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-product-details">
                    <div class="checkout-product-name">${item.name}</div>
                    <div class="checkout-product-price">$${item.price.toFixed(2)}</div>
                    <div class="checkout-product-quantity">Quantity: ${item.quantity}</div>
                    <div class="checkout-product-subtotal">Subtotal: $${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
    });

    orderItemsDiv.innerHTML = orderItemsHTML;
    orderTotalDiv.innerHTML = `Total: $${overallTotal.toFixed(2)}`;
}

/**
 * Handle the checkout form submission
 * @param {Event} event - The form submission event
 */
function handleCheckout(event) {
    event.preventDefault();

    // Ensure the user is still logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Your session has expired. Please login again.');
        sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
        return;
    }

    const checkoutMessage = document.getElementById('checkout-message');
    checkoutMessage.textContent = '';
    checkoutMessage.classList.remove('success');

    // Validate form
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('shipping-address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!fullName || !email || !phone || !address || !city || !state || !zip || !country) {
        checkoutMessage.textContent = 'Please fill out all fields.';
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        checkoutMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    // Get the full cart from localStorage
    const fullCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Get the selected items array
    const selectedItemIds = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

    // Filter the cart to only include selected items
    const selectedItems = fullCart.filter(item => selectedItemIds.includes(item.id));

    if (selectedItems.length === 0) {
        checkoutMessage.textContent = 'Your cart is empty. Cannot place an order.';
        return;
    }

    // Format shipping address
    const formattedAddress = `${fullName}\n${address}\n${city}, ${state} ${zip}\n${country}\nPhone: ${phone}\nEmail: ${email}`;

    // Prepare order data
    const orderData = {
        shippingAddress: formattedAddress,
        items: selectedItems
    };

    // Show processing message
    checkoutMessage.textContent = 'Processing your order...';

    // Send create order request with Authorization header
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(orderData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Order created successfully:', data);

            // Remove purchased items from cart
            const remainingItems = fullCart.filter(item => !selectedItemIds.includes(item.id));
            localStorage.setItem('shoppingCart', JSON.stringify(remainingItems));

            // Clear selected items
            localStorage.removeItem('selectedCartItems');

            // Store order information for confirmation page
            sessionStorage.setItem('lastOrderNumber', data.orderNumber);
            sessionStorage.setItem('lastOrderDate', data.orderDate);
            sessionStorage.setItem('lastOrderTotal', data.totalAmount);

            // Redirect to order confirmation page
            window.location.href = 'order-confirmation.html';
        })
        .catch(error => {
            console.error('Error placing order:', error);
            checkoutMessage.textContent = 'Failed to place order. Please try again.';
        });
}