// Declare variable globally so it's accessible in all functions
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const productDetailDiv = document.getElementById('product-detail');

    // Get product ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId === null) {
        productDetailDiv.innerHTML = '<p>Product ID not found in URL.</p>';
        return;
    }

    // Update navigation bar
    updateNavigation();

    // Fetch data for the specific product
    fetch(`api/products/${productId}`)
        .then(response => {
            if (response.status === 404) {
                return Promise.reject('Product not found');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse JSON response
            return response.json();
        })
        .then(product => {
            // Store the current product in global variable
            currentProduct = product;
            console.log("Product loaded:", product.name);

            productDetailDiv.innerHTML = '';

            // Create and append product image
            const productImage = document.createElement('img');
            productImage.src = product.imageUrl || 'images/placeholder.png';
            productImage.alt = product.name;
            productDetailDiv.appendChild(productImage);

            // Product name
            const productName = document.createElement('h2');
            productName.textContent = product.name;
            productDetailDiv.appendChild(productName);

            // Product description
            const productDescription = document.createElement('p');
            productDescription.textContent = product.description || 'No description available.';
            productDetailDiv.appendChild(productDescription);

            // Product price
            const productPrice = document.createElement('p');
            productPrice.style.fontWeight = 'bold';
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            productDetailDiv.appendChild(productPrice);

            // Add to cart button
            const addToCartButton = document.createElement('button');
            addToCartButton.id = 'add-to-cart-btn';
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.addEventListener('click', handleAddToCart);
            productDetailDiv.appendChild(addToCartButton);
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            productDetailDiv.innerHTML = `<p>Error loading product details: ${error}.</p>`;
        });
});

// 在handleAddToCart函数中添加
function handleAddToCart() {
    if (!currentProduct) {
        console.error("Product details not loaded yet.");
        alert("Unable to add to cart. Product information is not available.");
        return;
    }

    console.log("Adding to cart:", currentProduct.name);
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === currentProduct.id);

    if (existingProductIndex > -1) {
        // Product exists, increment quantity
        cart[existingProductIndex].quantity += 1;
        console.log("Increased quantity for:", currentProduct.name);
    } else {
        // Product not in cart, add it
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            imageUrl: currentProduct.imageUrl,
            quantity: 1
        });
        console.log("Added new item:", currentProduct.name);

        // Also add to selected items
        let selectedItems = JSON.parse(localStorage.getItem('selectedCartItems')) || [];
        if (!selectedItems.includes(currentProduct.id)) {
            selectedItems.push(currentProduct.id);
            localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        }
    }

    // Save to localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(cart));

    // If user is logged in, sync cart to server
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        syncCartWithServer(cart);
    }

    alert(`${currentProduct.name} added to cart!`);
}


// Cart synchronization function
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