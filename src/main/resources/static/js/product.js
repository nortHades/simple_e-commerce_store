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

    function handleAddToCart() {
        if (!currentProduct) {
            console.error("Product details not loaded yet.");
            return;
        }

        console.log("Adding to cart:", currentProduct.name);
        //get the current cart from localStorage
        //convert the local string to JSON
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        //check if the item if the current product is existing in the cart now
        const existingProductIndex = cart.findIndex(item => item.id === currentProduct.id);

        if (existingProductIndex > -1) {
            // Product exists, increment quantity
            cart[existingProductIndex].quantity += 1;
            console.log("Increased quantity for:", currentProduct.name);
        } else {
            // Product not in cart, add it with quantity 1
            cart.push({
                id: currentProduct.id,
                name: currentProduct.name,
                price: currentProduct.price,
                imageUrl: currentProduct.imageUrl, // Store image too
                quantity: 1
            });
        }

        console.log("Added new item:", currentProduct.name);

        //turn the JSON back to String
        localStorage.setItem('shoppingCart', JSON.stringify(cart));

        alert(`${currentProduct.name} added to cart!`);
    }

});