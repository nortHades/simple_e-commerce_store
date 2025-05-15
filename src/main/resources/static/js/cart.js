document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Cart.js DOM loaded");
        console.log("Auth token:", localStorage.getItem('authToken'));
        console.log("Current user:", localStorage.getItem('currentUser'));

        // First thing - update navigation
        updateNavigation();

        // Then load cart data
        loadCartData();
    } catch (error) {
        console.error("Error during cart.js initialization:", error);
    }
});

function loadCartData() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');

    // Get the cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    cartItemsDiv.innerHTML = '';

    // Check if cart is empty
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your shopping cart is empty.</p>';
        cartTotalDiv.innerHTML = ''; // No total if cart is empty
        return;
    }

    // Create table for display
    const table = document.createElement('table');
    table.innerHTML = `
    <thead>
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th> 
            </tr>
    </thead>
    <tbody> 
    </tbody>
    `;

    // Select the tbody in the table
    const tbody = table.querySelector('tbody');
    let overallTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        overallTotal += itemTotal;

        const row = document.createElement('tr');

        const imageCell = document.createElement('td');
        imageCell.innerHTML = `<img src="${item.imageUrl || 'images/placeholder.png'}" alt="${item.name}" class="cart-item-image">`;
        row.appendChild(imageCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `$${item.price.toFixed(2)}`;
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        const itemTotalCell = document.createElement('td');
        itemTotalCell.textContent = `$${itemTotal.toFixed(2)}`;
        row.appendChild(itemTotalCell);

        // Add action buttons
        const actionsCell = document.createElement('td');

        // Minus button
        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.onclick = () => updateQuantity(item.id, item.quantity - 1);
        actionsCell.appendChild(minusButton);

        // Add button
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.onclick = () => updateQuantity(item.id, item.quantity + 1);
        actionsCell.appendChild(plusButton);

        // Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            removeItem(item.id);
        });

        actionsCell.appendChild(removeButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    cartItemsDiv.appendChild(table);

    // Display the overall total
    cartTotalDiv.innerHTML = `Overall Total: $${overallTotal.toFixed(2)}`;

    // Check if user is logged in, if so get cart from server
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        // Get cart from server and merge with local
        fetch('/api/users/cart', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch cart');
                }
                return response.json();
            })
            .then(serverCart => {
                // If server has cart data and local doesn't, use server data
                const localCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

                if (serverCart.length > 0 && localCart.length === 0) {
                    localStorage.setItem('shoppingCart', JSON.stringify(serverCart));
                    location.reload(); // Refresh page to display server cart
                } else if (localCart.length > 0) {
                    // If local has data, sync to server
                    syncCartWithServer(localCart);
                }
            })
            .catch(error => {
                console.error('Error fetching cart from server:', error);
            });
    }
}

function updateNavigation() {
    try {
        console.log("Updating navigation");
        const loginLink = document.getElementById('login-link');
        if (!loginLink) {
            console.error("Login link element not found!");
            return;
        }

        const authToken = localStorage.getItem('authToken');
        let currentUser = null;

        try {
            const currentUserStr = localStorage.getItem('currentUser');
            console.log("Current user string:", currentUserStr);
            if (currentUserStr) {
                currentUser = JSON.parse(currentUserStr);
            }
        } catch (e) {
            console.error("Error parsing currentUser JSON:", e);
            localStorage.removeItem('currentUser');
        }

        console.log("Navigation update with auth:", {
            hasAuthToken: !!authToken,
            currentUser
        });

        if (authToken && currentUser) {
            console.log("User is logged in, updating UI");
            // User is logged in, show username and logout button
            loginLink.textContent = `${currentUser.username} (Logout)`;
            loginLink.classList.add('logout-button');
            loginLink.href = '#';

            // Create a new link to remove existing handlers
            const newLoginLink = loginLink.cloneNode(true);
            newLoginLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Logout clicked");
                // Clear stored authentication information
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                // Refresh the page
                window.location.reload();
            });

            // Replace the old link with the new one
            loginLink.parentNode.replaceChild(newLoginLink, loginLink);
        } else {
            console.log("User is NOT logged in, showing login link");
            // User is not logged in, show login link
            loginLink.textContent = 'Login';
            loginLink.classList.remove('logout-button');
            loginLink.href = 'login.html';

            // Make sure we don't have any click handlers
            const newLoginLink = loginLink.cloneNode(true);
            loginLink.parentNode.replaceChild(newLoginLink, loginLink);
        }
    } catch (error) {
        console.error("Error in updateNavigation:", error);
    }
}

function updateQuantity(productId, newQuantity) {
    console.log(`Attempting to update product ${productId} quantity to ${newQuantity}`);
    // If the quantity is less than 1, remove it
    if (newQuantity < 1) {
        removeItem(productId);
        return;
    }

    // Get the current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    // Get the item by id
    const itemIndex = cart.findIndex(item => item.id === productId);

    // If item found, update it
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
        // Save the cart data to localStorage
        localStorage.setItem('shoppingCart', JSON.stringify(cart));

        // If user is logged in, sync to server
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            syncCartWithServer(cart);
        }
    } else {
        console.warn(`Product with ID ${productId} not found in cart for update.`);
    }

    location.reload();
}

function removeItem(productId) {
    // Update quantity in localStorage and refresh the cart display
    console.log(`Attempting to remove product with ID: ${productId}`);
    // Get the data from local storage
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    // Filter the cart: Create a new array excluding the item to be removed
    const updatedCart = cart.filter(item => item.id !== productId);

    // Check if item was found and removed
    if (cart.length === updatedCart.length) {
        console.warn(`Product with ID ${productId} not found in cart for removal.`);
    } else {
        console.log(`Product with ID ${productId} removed.`);
    }

    // Save the new cart
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));

    // If user is logged in, sync to server
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        syncCartWithServer(updatedCart);
    }

    // Refresh the display
    location.reload();
}

// Cart synchronization function
function syncCartWithServer(cart) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        console.log("No auth token found, skipping sync");
        return;
    }

    console.log("Syncing cart with token:", authToken);

    // 使用完整URL
    fetch('/api/users/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ items: cart })
    })
        .then(response => {
            console.log("Sync response status:", response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error("Error response:", text);
                    throw new Error('Failed to sync cart');
                });
            }
            console.log('Cart synchronized with server successfully');
        })
        .catch(error => {
            console.error('Error syncing cart with server:', error);
        });
}