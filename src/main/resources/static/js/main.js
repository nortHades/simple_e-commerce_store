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
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Create product link
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

        // Add info to link
        productLink.appendChild(productInfo);

        // Add link to card
        productCard.appendChild(productLink);

        // Add card to container
        container.appendChild(productCard);
    });
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