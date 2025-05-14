document.addEventListener('DOMContentLoaded', () => {
    const productDetailDiv = document.getElementById('product-detail');

    //get Id
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    let currentProduct = null;// hold the product

    if (productId === null) {
        productDetailDiv.innerHTML = '<p>Product ID not found in URL.</p>';
        return;
    }

    //get data for specific product
    fetch(`api/products/${productId}`)
        .then(response => {
            if (response.status === 404) {
                return Promise.reject('Product not found');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            //parse the json
            return response.json();
        })
        .then(product => {
            //store the current product
            currentProduct = product;

            productDetailDiv.innerHTML = '';

            //create the element and append img
            const productImage = document.createElement('img');
            productImage.src = product.imageUrl || 'images/placeholder.png';
            productImage.alt = product.name;
            productDetailDiv.appendChild(productImage);

            //Name
            const productName = document.createElement('h2');
            productName.textContent = product.name;
            productDetailDiv.appendChild(productName);

            //description
            const productDescription = document.createElement('p');
            productDescription.textContent = product.description || 'No description available.';
            productDetailDiv.appendChild(productDescription);

            const productPrice = document.createElement('p');
            productPrice.style.fontWeight = 'bold';
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            productDetailDiv.appendChild(productPrice);

            //add the button
            const addToCartButton = document.createElement('button');
            addToCartButton.id = 'add-to-cart-btn'; // Use the ID from HTML if button already exists there, otherwise set it here
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.addEventListener('click', handleAddToCart); // Add event listener
            productDetailDiv.appendChild(addToCartButton);

        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            productDetailDiv.innerHTML = `<p>Error loading product details: ${error}.</p>`;
        });
    // Update navigation bar
    updateNavigation();



});

function handleAddToCart() {
    if (!currentProduct) {
        console.error("Product details not loaded yet.");
        return;
    }

    console.log("Adding to cart:", currentProduct.name);
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Check if already in cart
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

//update navigation function
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
}

// Add cart synchronization function
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