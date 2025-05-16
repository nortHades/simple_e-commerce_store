document.addEventListener('DOMContentLoaded', () => {
    // Update navigation bar
    updateNavigation();

    // Load products with pagination
    loadProducts();
});

/**
 * Load products from the backend API with pagination
 */
function loadProducts() {
    // Get the container where products will be displayed
    const productListDiv = document.getElementById('product-list');

    // Get URL parameters for pagination
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    const itemsPerPage = 6; // Set how many products per page

    // Show loading indicator
    productListDiv.innerHTML = '<div class="loading-message">Loading products...</div>';

    // Call the products API
    fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            // Clear the product list
            productListDiv.innerHTML = '';

            if (products.length === 0) {
                productListDiv.innerHTML = '<p>No products found.</p>';
                return;
            }

            // Calculate pagination values
            const totalProducts = products.length;
            const totalPages = Math.ceil(totalProducts / itemsPerPage);

            // Ensure current page is within valid range
            const currentPage = Math.max(1, Math.min(page, totalPages));

            // Get products for current page
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
            const currentPageProducts = products.slice(startIndex, endIndex);

            // Display products for current page
            displayProducts(currentPageProducts, productListDiv);

            // Create pagination controls
            createPagination(currentPage, totalPages);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productListDiv.innerHTML = '<p>Error loading products. Please try again later.</p>';
        });
}

/**
 * Display the products in the product list
 * @param {Array} products - Array of product objects
 * @param {HTMLElement} container - Container element to display products in
 */
function displayProducts(products, container) {
    // Get the shopping cart to check if products are already in it
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Create product link (without the "Add to Cart" button area)
        const productLink = document.createElement('a');
        productLink.href = `product.html?id=${product.id}`;
        productLink.style.textDecoration = 'none';
        productLink.style.color = 'inherit';

        // Create product image
        const productImage = document.createElement('img');
        productImage.src = product.imageUrl || 'images/placeholder.png';
        productImage.alt = product.name;
        productLink.appendChild(productImage);

        // Create product info container
        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';

        // Create product name
        const productName = document.createElement('h3');
        productName.className = 'product-name';
        productName.textContent = product.name;
        productInfo.appendChild(productName);

        // Create product price
        const productPrice = document.createElement('p');
        productPrice.className = 'product-price';
        productPrice.textContent = formatCurrency(product.price);
        productInfo.appendChild(productPrice);

        // Add product info to link
        productLink.appendChild(productInfo);
        productCard.appendChild(productLink);

        // Create card footer (for add to cart button or quantity controls)
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        // Check if product is already in cart
        const cartItem = cart.find(item => item.id === product.id);

        if (cartItem) {
            // If product is in cart, display quantity controls
            cardFooter.appendChild(createQuantityControl(product, cartItem.quantity));
        } else {
            // If product is not in cart, display "Add to Cart" button
            const addButton = document.createElement('button');
            addButton.className = 'add-to-cart-btn';
            addButton.textContent = 'Add to Cart';
            addButton.onclick = (e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event bubbling
                addToCart(product, 1, cardFooter);
            };
            cardFooter.appendChild(addButton);
        }

        productCard.appendChild(cardFooter);
        container.appendChild(productCard);
    });
}

/**
 * Create quantity control element
 * @param {Object} product - Product to create control for
 * @param {number} quantity - Current quantity
 * @returns {HTMLElement} Quantity control element
 */
function createQuantityControl(product, quantity) {
    const quantityControl = document.createElement('div');
    quantityControl.className = 'quantity-control';

    // Create minus button
    const minusBtn = document.createElement('button');
    minusBtn.className = 'quantity-btn';
    minusBtn.textContent = '-';
    minusBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCartItemQuantity(product, quantity - 1, quantityControl.parentElement);
    };

    // Create quantity display
    const quantityDisplay = document.createElement('div');
    quantityDisplay.className = 'quantity-display';
    quantityDisplay.textContent = quantity;

    // Create plus button
    const plusBtn = document.createElement('button');
    plusBtn.className = 'quantity-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCartItemQuantity(product, quantity + 1, quantityControl.parentElement);
    };

    // Add elements to quantity control
    quantityControl.appendChild(minusBtn);
    quantityControl.appendChild(quantityDisplay);
    quantityControl.appendChild(plusBtn);

    return quantityControl;
}

/**
 * Add product to cart from main page
 * @param {Object} product - Product to add
 * @param {number} quantity - Quantity to add
 * @param {HTMLElement} cardFooter - Card footer element to update
 */
function addToCart(product, quantity, cardFooter) {
    // Add to cart and automatically select it
    const cartItem = addToCartAndSelect(product, quantity);

    // Update UI with quantity control
    cardFooter.innerHTML = '';
    cardFooter.appendChild(createQuantityControl(product, cartItem.quantity));

    // Show simple toast notification
    showToast(`${product.name} added to cart`, 'success', 2000);

    // Update cart count in navigation
    updateCartCount();
}

/**
 * Update cart item quantity
 * @param {Object} product - Product to update
 * @param {number} newQuantity - New quantity
 * @param {HTMLElement} cardFooter - Card footer element to update
 */
function updateCartItemQuantity(product, newQuantity, cardFooter) {
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    if (newQuantity <= 0) {
        // Remove item from cart if quantity is 0 or less
        cart = cart.filter(item => item.id !== product.id);

        // Replace quantity control with "Add to Cart" button
        cardFooter.innerHTML = '';
        const addButton = document.createElement('button');
        addButton.className = 'add-to-cart-btn';
        addButton.textContent = 'Add to Cart';
        addButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product, 1, cardFooter);
        };
        cardFooter.appendChild(addButton);
    } else {
        // Update quantity
        const itemIndex = cart.findIndex(item => item.id === product.id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;

            // Update quantity display
            cardFooter.innerHTML = '';
            cardFooter.appendChild(createQuantityControl(product, newQuantity));
        }
    }

    // Save updated cart
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

/**
 * Create pagination controls
 * @param {number} currentPage - Current active page
 * @param {number} totalPages - Total number of pages
 */
function createPagination(currentPage, totalPages) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;

    // Clear previous pagination
    paginationDiv.innerHTML = '';

    // Don't show pagination if only one page
    if (totalPages <= 1) return;

    // Function to create page button
    const createPageButton = (page, text, isActive = false, isDisabled = false) => {
        const button = document.createElement('a');
        button.textContent = text;
        button.className = `pagination-button${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`;

        if (!isDisabled && !isActive) {
            button.href = `index.html?page=${page}`;
        }

        return button;
    };

    // Add "Previous" button
    paginationDiv.appendChild(createPageButton(
        currentPage - 1,
        '«',
        false,
        currentPage === 1
    ));

    // Logic for which page buttons to show
    const pagesToShow = [];

    // Always show first page
    pagesToShow.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    // Ensure we show at least 3 pages in the middle if possible
    if (rangeEnd - rangeStart < 2) {
        if (rangeStart === 2) {
            rangeEnd = Math.min(totalPages - 1, rangeStart + 2);
        } else if (rangeEnd === totalPages - 1) {
            rangeStart = Math.max(2, rangeEnd - 2);
        }
    }

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        paginationDiv.appendChild(ellipsis);
    } else if (rangeStart === 2) {
        pagesToShow.push(2);
    }

    // Add pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
        if (!pagesToShow.includes(i)) {
            pagesToShow.push(i);
        }
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        paginationDiv.appendChild(ellipsis);
    } else if (rangeEnd === totalPages - 1) {
        if (!pagesToShow.includes(totalPages - 1)) {
            pagesToShow.push(totalPages - 1);
        }
    }

    // Always show last page
    if (!pagesToShow.includes(totalPages)) {
        pagesToShow.push(totalPages);
    }

    // Add page buttons
    pagesToShow.sort((a, b) => a - b).forEach(page => {
        paginationDiv.appendChild(createPageButton(page, page, page === currentPage));
    });

    // Add "Next" button
    paginationDiv.appendChild(createPageButton(
        currentPage + 1,
        '»',
        false,
        currentPage === totalPages
    ));
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
