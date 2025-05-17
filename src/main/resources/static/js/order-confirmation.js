document.addEventListener('DOMContentLoaded', () => {
    console.log('Order confirmation page loaded');

    // Check if user is logged in - frontend authentication check
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log('User not logged in, redirecting to login page');
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }

    // Update navigation
    updateNavigation();

    // Display order confirmation
    displayOrderConfirmation();
});

/**
 * Display order confirmation details from sessionStorage
 */
function displayOrderConfirmation() {
    const orderNumber = sessionStorage.getItem('lastOrderNumber');
    const orderDate = sessionStorage.getItem('lastOrderDate');
    const orderTotal = sessionStorage.getItem('lastOrderTotal');

    const orderNumberDiv = document.getElementById('order-number');

    if (orderNumber) {
        // Format the date if available
        let formattedDate = '';
        if (orderDate) {
            try {
                const date = new Date(orderDate);
                formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            } catch (e) {
                console.error('Error formatting date:', e);
                formattedDate = orderDate;
            }
        }

        // Format the total if available
        let formattedTotal = '';
        if (orderTotal) {
            formattedTotal = `$${parseFloat(orderTotal).toFixed(2)}`;
        }

        // Display order details
        orderNumberDiv.innerHTML = `
            <strong>Order #: ${orderNumber}</strong><br>
            <span>Date: ${formattedDate}</span><br>
            <span>Total: ${formattedTotal}</span>
        `;
    } else {
        // If no order number is found, show a generic message or redirect
        orderNumberDiv.textContent = 'Order processed successfully.';

        // Alternatively, redirect if there's no order data
        // window.location.href = 'orders.html';
    }

    // Clear the session storage after displaying
    sessionStorage.removeItem('lastOrderNumber');
    sessionStorage.removeItem('lastOrderDate');
    sessionStorage.removeItem('lastOrderTotal');
}