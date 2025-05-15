document.addEventListener('DOMContentLoaded', () => {
    // Get the container the products will be displayed
    const productListDiv = document.getElementById('product-list');

    // get products from the backend API
    // Calls GET http://localhost:8080/api/products
    fetch('/api/products').
    then(response =>{
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response body
    }).then(products =>{
        //clear the previous message
        productListDiv.innerHTML = '';
        if (products.length === 0) {
            productListDiv.innerHTML = '<p>No products found.</p>';
            return;
        }

        // Loop each product and create HTML to display it
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            //create a link here for interaction with product html
            const productLink = document.createElement('a');
            // Pass the product ID as a URL query parameter
            productLink.href = `product.html?id=${product.id}`;
            productLink.style.textDecoration = 'none';
            productLink.style.color = 'inherit';

            const productImage = document.createElement('img');
            productImage.src = product.imageUrl || 'images/placeholder.png'; // Use a placeholder if no image URL
            productImage.alt = product.name;
            productLink.appendChild(productImage);// append the child node img

            const productName = document.createElement('h3');
            productName.textContent = product.name;
            productLink.appendChild(productName);// append the child node h3

            const productPrice = document.createElement('p');
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            productLink.appendChild(productPrice);// append the child node p


            productCard.appendChild(productLink);//append the link to the card

            productListDiv.appendChild(productCard); // append the card to the list

        });
    }).catch(error => {
            console.log('Error getting products: ', error)
            productListDiv.innerHTML = '<p>Error with loading products. Please try again later.</p>';
        });

    // Update navigation bar
    updateNavigation();


});

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