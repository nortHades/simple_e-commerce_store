// Declare variable globally so it's accessible in all functions
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    // Update navigation
    updateNavigation();

    // Get product ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId === null) {
        document.getElementById('product-detail').innerHTML = '<p>Product ID not found in URL.</p>';
        return;
    }

    // Fetch data for the specific product
    loadProductDetails(productId);
});

/**
 * Load product details from API
 * @param {string|number} productId - ID of the product to load
 */
function loadProductDetails(productId) {
    const productDetailDiv = document.getElementById('product-detail');

    // Show loading indicator
    productDetailDiv.innerHTML = '<div class="loading-message">Loading product details...</div>';

    // Fetch product data
    fetch(`/api/products/${productId}`)
        .then(response => {
            if (response.status === 404) {
                return Promise.reject('Product not found');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            // Store the current product in global variable
            currentProduct = product;

            // Update page title
            document.title = `${product.name} - Simple E-commerce`;

            // Display product details
            displayProductDetails(product, productDetailDiv);
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            productDetailDiv.innerHTML = `
                <div class="error-message">
                    <p>Error loading product details: ${error}.</p>
                    <a href="index.html" class="back-button">Return to Products</a>
                </div>
            `;
        });
}

/**
 * Display product details on the page
 * @param {Object} product - The product object
 * @param {HTMLElement} container - Container to display product in
 */
function displayProductDetails(product, container) {
    // Check if product is already in cart
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartItem = cart.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    // Create product image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';

    // Create product image
    const productImage = document.createElement('img');
    productImage.className = 'product-image';
    productImage.src = product.imageUrl || 'images/placeholder.png';
    productImage.alt = product.name;
    imageContainer.appendChild(productImage);

    // Create product info container
    const infoContainer = document.createElement('div');
    infoContainer.className = 'product-info-container';

    // Product title
    const productTitle = document.createElement('h1');
    productTitle.className = 'product-title';
    productTitle.textContent = product.name;
    infoContainer.appendChild(productTitle);

    // Product meta (price and status)
    const productMeta = document.createElement('div');
    productMeta.className = 'product-meta';

    const productPrice = document.createElement('div');
    productPrice.className = 'product-price-detail';
    productPrice.textContent = formatCurrency(product.price);
    productMeta.appendChild(productPrice);

    const productStatus = document.createElement('div');
    productStatus.className = 'product-status';
    productStatus.textContent = 'In Stock';
    productMeta.appendChild(productStatus);

    infoContainer.appendChild(productMeta);

    // Product description
    const productDescription = document.createElement('div');
    productDescription.className = 'product-description';
    productDescription.textContent = product.description || 'No description available.';
    infoContainer.appendChild(productDescription);

    // Add to cart container
    const addToCartContainer = document.createElement('div');
    addToCartContainer.className = 'add-to-cart-container';

    // Quantity selection
    const quantityContainer = document.createElement('div');
    quantityContainer.className = 'product-quantity';

    const quantityLabel = document.createElement('label');
    quantityLabel.textContent = 'Quantity:';
    quantityContainer.appendChild(quantityLabel);

    const quantitySelect = document.createElement('select');
    quantitySelect.id = 'product-quantity';

    // Add quantity options (1-10)
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }

    // Set initial quantity to what's in cart (if any)
    if (quantityInCart > 0) {
        quantitySelect.value = Math.min(quantityInCart, 10); // Cap at 10 for the dropdown
    }

    quantityContainer.appendChild(quantitySelect);
    addToCartContainer.appendChild(quantityContainer);

    // Add to cart button
    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart-btn add-to-cart-btn-large';
    addToCartBtn.textContent = quantityInCart > 0 ? 'Update Cart' : 'Add to Cart';
    addToCartBtn.addEventListener('click', handleAddToCart);
    addToCartContainer.appendChild(addToCartBtn);
    // Continuing from previous product.js code...

    infoContainer.appendChild(addToCartContainer);

    // Product details section
    const detailsSection = document.createElement('div');
    detailsSection.className = 'product-details-section';

    const detailsTitle = document.createElement('h3');
    detailsTitle.textContent = 'Product Details';
    detailsSection.appendChild(detailsTitle);

    // Product features list - these would ideally come from the product data
    const featuresList = document.createElement('ul');
    featuresList.className = 'product-features';

    // Example features (replace with real product features if available)
    const features = [
        'High-quality material',
        'Comfortable fit',
        'Machine washable',
        'Available in multiple sizes',
        'Designed for everyday use'
    ];

    features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.textContent = feature;
        featuresList.appendChild(featureItem);
    });

    detailsSection.appendChild(featuresList);
    infoContainer.appendChild(detailsSection);

    // Product specifications section
    const specsSection = document.createElement('div');
    specsSection.className = 'product-details-section';

    const specsTitle = document.createElement('h3');
    specsTitle.textContent = 'Specifications';
    specsSection.appendChild(specsTitle);

    // Create specs table
    const specsTable = document.createElement('table');
    specsTable.className = 'specs-table';

    // Example specifications (replace with real product specs if available)
    const specs = [
        { name: 'Material', value: 'Cotton' },
        { name: 'Weight', value: '0.2 kg' },
        { name: 'Dimensions', value: '30 × 20 × 2 cm' },
        { name: 'Color', value: 'White' },
        { name: 'Brand', value: 'Simple E-commerce' }
    ];

    specs.forEach(spec => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('th');
        nameCell.textContent = spec.name;
        row.appendChild(nameCell);

        const valueCell = document.createElement('td');
        valueCell.textContent = spec.value;
        row.appendChild(valueCell);

        specsTable.appendChild(row);
    });

    specsSection.appendChild(specsTable);
    infoContainer.appendChild(specsSection);

    // Clear the container and add the new elements
    container.innerHTML = '';
    container.appendChild(imageContainer);
    container.appendChild(infoContainer);

    // Add event listener for quantity change
    quantitySelect.addEventListener('change', function() {
        // Update button text based on selected quantity and cart state
        if (quantityInCart > 0) {
            addToCartBtn.textContent = 'Update Cart';
        } else {
            addToCartBtn.textContent = 'Add to Cart';
        }
    });
}

/**
 * Handle add to cart button click
 */
function handleAddToCart() {
    if (!currentProduct) {
        console.error("Product details not loaded yet.");
        alert("Unable to add to cart. Product information is not available.");
        return;
    }

    // Get selected quantity
    const quantitySelect = document.getElementById('product-quantity');
    const quantity = parseInt(quantitySelect.value);

    // Add to cart with automatic selection
    addToCartAndSelect(currentProduct, quantity);

    // Update button text
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.textContent = 'Update Cart';
    }

    // Show add to cart modal
    showAddToCartModal(currentProduct, quantity);
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
 * Show toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    // Check if toast container exists, create it if not
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);

        // Add style for toast container
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Style toast
    toast.style.backgroundColor = '#333';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';

    // Add toast to container
    toastContainer.appendChild(toast);

    // Trigger reflow to enable transition
    toast.offsetHeight;

    // Show toast
    toast.style.opacity = '1';

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';

        // Remove toast after fade out
        setTimeout(() => {
            toastContainer.removeChild(toast);

            // Remove container if empty
            if (toastContainer.children.length === 0) {
                document.body.removeChild(toastContainer);
            }
        }, 300);
    }, 3000);
}
