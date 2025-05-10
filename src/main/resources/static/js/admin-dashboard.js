// File: src/main/resources/static/js/admin-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const productListBody = document.getElementById('admin-product-list-body');
    const productFormContainer = document.getElementById('product-form-container');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const showCreateFormBtn = document.getElementById('show-create-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productIdField = document.getElementById('productId');
    const productNameField = document.getElementById('productName');
    const productDescriptionField = document.getElementById('productDescription');
    const productPriceField = document.getElementById('productPrice');
    const productImageUrlField = document.getElementById('productImageUrl'); // For manually setting URL
    const imageFileField = document.getElementById('imageFile');
    const currentImagePreviewContainer = document.getElementById('current-image-preview-container');
    const currentImagePreview = document.getElementById('current-image-preview');

    const API_BASE_URL = '/admin/products'; // Your admin API endpoint

    // --- UTILITY FUNCTIONS ---
    function clearForm() {
        productForm.reset();
        productIdField.value = '';
        formTitle.textContent = 'Add New Product';
        cancelEditBtn.style.display = 'none';
        currentImagePreviewContainer.style.display = 'none';
        currentImagePreview.src = '#';
    }

    function showForm(isEdit = false, product = null) {
        clearForm();
        if (isEdit && product) {
            formTitle.textContent = `Edit Product (ID: ${product.id})`;
            productIdField.value = product.id;
            productNameField.value = product.name;
            productDescriptionField.value = product.description || '';
            productPriceField.value = product.price;
            productImageUrlField.value = product.imageUrl || ''; // Show current URL if any
            if (product.imageUrl) {
                currentImagePreview.src = product.imageUrl;
                currentImagePreviewContainer.style.display = 'block';
            }
            cancelEditBtn.style.display = 'inline-block';
        } else {
            formTitle.textContent = 'Add New Product';
        }
        productFormContainer.style.display = 'block';
        showCreateFormBtn.style.display = 'none';
    }

    function hideForm() {
        clearForm();
        productFormContainer.style.display = 'none';
        showCreateFormBtn.style.display = 'inline-block';
    }

    // --- API CALLS ---
    async function fetchProducts() {
        try {
            const response = await fetch(API_BASE_URL); // GETs all products for admin
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productListBody.innerHTML = '<tr><td colspan="5">Error loading products.</td></tr>';
        }
    }

    async function saveProduct(event) {
        event.preventDefault();
        const isEdit = !!productIdField.value;
        const url = isEdit ? `${API_BASE_URL}/${productIdField.value}` : API_BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        const formData = new FormData();

        // Product JSON part
        const productData = {
            name: productNameField.value,
            description: productDescriptionField.value,
            price: parseFloat(productPriceField.value),
            // If imageUrlField is filled and no new imageFile, this URL will be used.
            // If imageFile is also provided, the backend should prioritize imageFile.
            imageUrl: productImageUrlField.value
        };
        // For PUT requests, include the ID if your backend expects it in the body (often not needed if in URL)
        // if (isEdit) productData.id = parseInt(productIdField.value);


        // IMPORTANT: For @RequestPart("product") Product product,
        // Spring expects the "product" part to be a JSON string that it can convert.
        // So, we need to stringify productData.
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        // Image file part (if selected)
        if (imageFileField.files.length > 0) {
            formData.append('imageFile', imageFileField.files[0]);
        } else if (!isEdit && !productImageUrlField.value) {
            // For create, if no file and no manual URL, backend will handle (e.g., null or default)
        }


        try {
            const response = await fetch(url, {
                method: method,
                body: formData, // FormData automatically sets Content-Type to multipart/form-data
                // No need to set Content-Type header manually when using FormData with fetch
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Product saved:', result);
            hideForm();
            fetchProducts(); // Refresh the list
            alert(`Product ${isEdit ? 'updated' : 'created'} successfully!`);

        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.message}`);
        }
    }

    async function deleteProduct(productId) {
        if (!confirm(`Are you sure you want to delete product ID ${productId}?`)) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) { // 204 No Content is also OK for DELETE
                if (response.status === 204) {
                    // Handle 204 No Content as success
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
                }
            }
            console.log('Product deleted:', productId);
            fetchProducts(); // Refresh the list
            alert(`Product ID ${productId} deleted successfully!`);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(`Error deleting product: ${error.message}`);
        }
    }

    // --- UI RENDERING ---
    function renderProducts(products) {
        productListBody.innerHTML = ''; // Clear existing rows
        if (products.length === 0) {
            productListBody.innerHTML = '<tr><td colspan="5">No products found.</td></tr>';
            return;
        }
        products.forEach(product => {
            const row = productListBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.imageUrl || '/images/placeholder.png'}" alt="${product.name}" class="admin-product-thumbnail"></td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="admin-button edit-button" data-id="${product.id}">Edit</button>
                    <button class="admin-button delete-button" data-id="${product.id}">Delete</button>
                </td>
            `;
            // Add event listeners for edit and delete buttons
            row.querySelector('.edit-button').addEventListener('click', () => showForm(true, product));
            row.querySelector('.delete-button').addEventListener('click', () => deleteProduct(product.id));
        });
    }

    // --- EVENT LISTENERS ---
    showCreateFormBtn.addEventListener('click', () => showForm(false));
    cancelEditBtn.addEventListener('click', hideForm);
    productForm.addEventListener('submit', saveProduct);

    // --- INITIAL LOAD ---
    fetchProducts();
});