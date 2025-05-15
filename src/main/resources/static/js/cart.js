document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Cart.js DOM loaded");

        // Update navigation first
        updateNavigation();

        // Load cart data from localStorage
        loadCartData();

        // Add event listener to checkout button
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', handleCheckout);
        }

        // Add event listener to select all checkbox
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', handleSelectAll);
        }
    } catch (error) {
        console.error("Error during cart.js initialization:", error);
    }
});

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const authToken = localStorage.getItem('authToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (authToken && currentUser) {
        // User is logged in, show username and logout button
        loginLink.textContent = `${currentUser.username} (Logout)`;
        loginLink.classList.add('logout-button');
        loginLink.href = '#';
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear stored authentication information
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            // Refresh the page
            window.location.reload();
        });
    } else {
        // User is not logged in, show login link
        loginLink.textContent = 'Login';
        loginLink.classList.remove('logout-button');
        loginLink.href = 'login.html';

        // Remove any existing click event listeners
        const newLoginLink = loginLink.cloneNode(true);
        loginLink.parentNode.replaceChild(newLoginLink, loginLink);
    }

    /**
     * Load cart data from localStorage and display it
     */
    function loadCartData() {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartTotalDiv = document.getElementById('cart-total');
        const selectedCountDiv = document.getElementById('selected-count');

        // Get the cart items from localStorage
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        // Get the selected items array (or create it if it doesn't exist)
        let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

        // If selectedItems is empty but cart has items, select all by default
        if (selectedItems.length === 0 && cart.length > 0) {
            selectedItems = cart.map(item => item.id);
            localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        }

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your shopping cart is empty.</p>';
            cartTotalDiv.innerHTML = '';
            selectedCountDiv.textContent = '0 items selected';
            return;
        }

        // Create table for display
        const table = document.createElement('table');
        table.className = 'cart-table';
        table.innerHTML = `
    <thead>
        <tr>
            <th width="5%"></th>
            <th width="45%">Product</th>
            <th width="15%">Price</th>
            <th width="15%">Quantity</th>
            <th width="15%">Total</th>
            <th width="5%"></th>
        </tr>
    </thead>
    <tbody></tbody>
    `;

        const tbody = table.querySelector('tbody');
        let overallTotal = 0;
        let selectedTotal = 0;
        let selectedCount = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            overallTotal += itemTotal;

            // Check if this item is selected
            const isSelected = selectedItems.includes(item.id);
            if (isSelected) {
                selectedTotal += itemTotal;
                selectedCount += item.quantity;
            }

            const row = document.createElement('tr');

            // Checkbox cell
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'cart-item-checkbox';
            checkbox.dataset.itemId = item.id;
            checkbox.checked = isSelected;
            checkbox.addEventListener('change', handleItemCheckboxChange);
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            // Product cell
            const productCell = document.createElement('td');
            productCell.innerHTML = `
            <div class="cart-item-details">
                <img src="${item.imageUrl || 'images/placeholder.png'}" alt="${item.name}"
                <img src="${item.imageUrl || 'images/placeholder.png'}" alt="${item.name}" class="cart-item-image">
               <div class="cart-item-info">
                   <div>${item.name}</div>
               </div>
           </div>
       `;
            row.appendChild(productCell);

            // Price cell
            const priceCell = document.createElement('td');
            priceCell.textContent = `$${item.price.toFixed(2)}`;
            row.appendChild(priceCell);

            // Quantity cell
            const quantityCell = document.createElement('td');
            const quantityContainer = document.createElement('div');
            quantityContainer.className = 'quantity-controls';

            const minusButton = document.createElement('button');
            minusButton.textContent = '-';
            minusButton.className = 'quantity-button';
            minusButton.onclick = () => updateQuantity(item.id, item.quantity - 1);

            const quantityDisplay = document.createElement('span');
            quantityDisplay.className = 'quantity-display';
            quantityDisplay.textContent = item.quantity;

            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.className = 'quantity-button';
            plusButton.onclick = () => updateQuantity(item.id, item.quantity + 1);

            quantityContainer.appendChild(minusButton);
            quantityContainer.appendChild(quantityDisplay);
            quantityContainer.appendChild(plusButton);

            quantityCell.appendChild(quantityContainer);
            row.appendChild(quantityCell);

            // Total cell
            const itemTotalCell = document.createElement('td');
            itemTotalCell.textContent = `$${itemTotal.toFixed(2)}`;
            itemTotalCell.className = 'item-total';
            row.appendChild(itemTotalCell);

            // Action cell
            const actionsCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.textContent = '×';
            removeButton.className = 'remove-button';
            removeButton.addEventListener('click', () => {
                removeItem(item.id);
            });
            actionsCell.appendChild(removeButton);
            row.appendChild(actionsCell);

            tbody.appendChild(row);
        });

        cartItemsDiv.innerHTML = '';
        cartItemsDiv.appendChild(table);

        // Display the overall total
        cartTotalDiv.innerHTML = `Total: $${selectedTotal.toFixed(2)} of $${overallTotal.toFixed(2)}`;

        // Update selected count
        selectedCountDiv.textContent = `${selectedCount} items selected`;

        // Update "Select All" checkbox state
        updateSelectAllCheckbox();
    }

    /**
     * Handle individual item checkbox change
     * @param {Event} event - The change event
     */
    function handleItemCheckboxChange(event) {
        const checkbox = event.target;
        const itemId = parseInt(checkbox.dataset.itemId);

        // Get current selected items
        let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

        if (checkbox.checked) {
            // Add item to selected items if not already there
            if (!selectedItems.includes(itemId)) {
                selectedItems.push(itemId);
            }
        } else {
            // Remove item from selected items
            selectedItems = selectedItems.filter(id => id !== itemId);
        }

        // Save updated selected items
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));

        // Update the cart display
        loadCartData();
    }

    /**
     * Handle "Select All" checkbox change
     * @param {Event} event - The change event
     */
    function handleSelectAll(event) {
        const selectAll = event.target.checked;
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        // Get all item IDs
        const allItemIds = cart.map(item => item.id);

        // Update selected items based on Select All checkbox
        if (selectAll) {
            localStorage.setItem('selectedCartItems', JSON.stringify(allItemIds));
        } else {
            localStorage.setItem('selectedCartItems', JSON.stringify([]));
        }

        // Update the cart display
        loadCartData();
    }

    /**
     * Update the "Select All" checkbox state based on individual selections
     */
    function updateSelectAllCheckbox() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
        const selectAllCheckbox = document.getElementById('select-all');

        if (selectAllCheckbox) {
            // Check if all items are selected
            selectAllCheckbox.checked = cart.length > 0 && selectedItems.length === cart.length;

            // Make it indeterminate if some but not all items are selected
            selectAllCheckbox.indeterminate = selectedItems.length > 0 && selectedItems.length < cart.length;
        }
    }

    /**
     * Update item quantity
     * @param {number} productId - The product ID to update
     * @param {number} newQuantity - The new quantity
     */
    function updateQuantity(productId, newQuantity) {
        // If the quantity is less than 1, remove it
        if (newQuantity < 1) {
            removeItem(productId);
            return;
        }

        // Get the current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        // Find the item by id
        const itemIndex = cart.findIndex(item => item.id === productId);

        // If item found, update it
        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;

            // Save the cart data to localStorage
            localStorage.setItem('shoppingCart', JSON.stringify(cart));

            // Reload the cart display
            loadCartData();
        }
    }

    /**
     * Remove item from cart
     * @param {number} productId - The product ID to remove
     */
    function removeItem(productId) {
        // Get the data from local storage
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        // Filter the cart to exclude the item to be removed
        const updatedCart = cart.filter(item => item.id !== productId);

        // Save the new cart to localStorage
        localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));

        // Also remove from selected items
        let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
        selectedItems = selectedItems.filter(id => id !== productId);
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));

        // Reload the cart display
        loadCartData();
    }

    /**
     * Handle checkout button click
     */
    function handleCheckout() {
        // Check if user is logged in
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            // Save current URL to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
            // Redirect to login page
            window.location.href = 'login.html';
            return;
        }

        // Get selected items
        const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

        // Check if any items are selected
        if (selectedItems.length === 0) {
            alert('Please select at least one item to checkout.');
            return;
        }

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
}