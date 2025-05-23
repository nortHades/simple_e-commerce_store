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
 * Load cart data from localStorage and display it
 */
function loadCartData() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const selectedCountDiv = document.getElementById('selected-count');

    if (!cartItemsDiv || !cartTotalDiv || !selectedCountDiv) {
        console.error("Required DOM elements not found");
        return;
    }

    // Get the cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Get the selected items array (or create it if it doesn't exist)
    let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your shopping cart is empty.</p>';
        cartTotalDiv.innerHTML = '';
        selectedCountDiv.textContent = '0 items selected';
        return;
    }

    // Make sure all cart items are in selectedItems by default (if they aren't manually unselected)
    let selectedItemsUpdated = false;
    cart.forEach(item => {
        if (!selectedItems.includes(item.id)) {
            selectedItems.push(item.id);
            selectedItemsUpdated = true;
        }
    });

    // Save updated selectedItems back to localStorage if changed
    if (selectedItemsUpdated) {
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
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
        checkbox.addEventListener('change', (e) => handleItemCheckboxChange(e, item.id));
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // Product cell
        const productCell = document.createElement('td');
        productCell.innerHTML = `
            <div class="cart-item-details">
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
    cartTotalDiv.innerHTML = `Total: $${selectedTotal.toFixed(2)}`;

    // Update selected count
    selectedCountDiv.textContent = `${selectedCount} items selected`;

    // Update "Select All" checkbox state
    updateSelectAllCheckbox();
}

/**
 * Handle individual item checkbox change
 * @param {Event} event - The change event
 * @param {number} itemId - The item ID
 */
function handleItemCheckboxChange(event, itemId) {
    // stopPropagation
    event.stopPropagation();

    const checkbox = event.target;

    // log
    console.log(`Item checkbox ${itemId} changed to ${checkbox.checked}`);

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

    // Update Select All checkbox state without triggering its change event
    updateSelectAllCheckbox();

    // Update the cart totals without reloading entire cart
    updateCartTotals();
}

/**
 * Handle "Select All" checkbox change
 * @param {Event} event - The change event
 */
function handleSelectAll(event) {
    // stopPropagation
    event.stopPropagation();

    const selectAll = event.target.checked;
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // log
    console.log("Select All checkbox change:", selectAll);

    // Get all item IDs
    const allItemIds = cart.map(item => item.id);

    // Update selected items based on Select All checkbox
    if (selectAll) {
        localStorage.setItem('selectedCartItems', JSON.stringify(allItemIds));
    } else {
        // null
        localStorage.setItem('selectedCartItems', JSON.stringify([]));
    }

    // set checkbox
    const itemCheckboxes = document.querySelectorAll('.cart-item-checkbox');
    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });

    // Update the cart totals
    updateCartTotals();
}

/**
 * Update cart totals without reloading the entire cart
 */
function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
    const cartTotalDiv = document.getElementById('cart-total');
    const selectedCountDiv = document.getElementById('selected-count');

    let overallTotal = 0;
    let selectedTotal = 0;
    let selectedCount = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        overallTotal += itemTotal;

        if (selectedItems.includes(item.id)) {
            selectedTotal += itemTotal;
            selectedCount += item.quantity;
        }
    });

    // Update displayed totals
    if (cartTotalDiv) {
        cartTotalDiv.innerHTML = `Total: $${selectedTotal.toFixed(2)}`;
    }

    if (selectedCountDiv) {
        selectedCountDiv.textContent = `${selectedCount} items selected`;
    }
}

/**
 * Update the "Select All" checkbox state based on individual selections
 * without triggering its change event
 */
function updateSelectAllCheckbox() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
    const selectAllCheckbox = document.getElementById('select-all');

    if (selectAllCheckbox) {
        // remove eventhandler
        const oldSelectAllCheckbox = selectAllCheckbox;
        const newSelectAllCheckbox = oldSelectAllCheckbox.cloneNode(true);

        // update status
        newSelectAllCheckbox.checked = cart.length > 0 && selectedItems.length === cart.length;
        newSelectAllCheckbox.indeterminate = selectedItems.length > 0 && selectedItems.length < cart.length;

        // add
        newSelectAllCheckbox.addEventListener('change', handleSelectAll);

        // replace
        oldSelectAllCheckbox.parentNode.replaceChild(newSelectAllCheckbox, oldSelectAllCheckbox);
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
    console.log('Checkout button clicked');

    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!authToken);

    if (!authToken) {
        console.log('User not logged in, redirecting to login page');
        // Save current URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', 'checkout.html');
        // Redirect to login page
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    console.log('User is logged in, proceeding to checkout');

    // Get selected items
    const selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
    console.log('Selected items:', selectedItems.length);

    // Check if any items are selected
    if (selectedItems.length === 0) {
        alert('Please select at least one item to checkout.');
        return;
    }

    // Redirect to checkout page
    console.log('Redirecting to checkout.html');
    window.location.href = 'checkout.html';
}