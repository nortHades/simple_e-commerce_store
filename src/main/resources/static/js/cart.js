document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');

    //get the cart item from the localstorage
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    cartItemsDiv.innerHTML = '';

    //check the quantity of cart
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your shopping cart is empty.</p>';
        cartTotalDiv.innerHTML = ''; // No total if cart is empty
        return;
    }

    //create table for display
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

    //select the tbody in the table
    const tbody = table.querySelector('tbody');
    let overallTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        overallTotal += itemTotal;

        const row = document.createElement('tr');

        const imageCell = document.createElement('td');
        imageCell.innerHTML = `<img src="${item.imageUrl || '../images/placeholder.png'}" alt="${item.name}" class="cart-item-image">`;
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

        //add action buttion
        const actionsCell = document.createElement('td');

        //minus button
        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.onclick = () => updateQuantity(item.id, item.quantity - 1);
        actionsCell.appendChild(minusButton);

        //add buttton
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.onclick = () => updateQuantity(item.id, item.quantity + 1);
        actionsCell.appendChild(plusButton);

        //remove
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeItem(item.id);
        });

        actionsCell.appendChild(removeButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    cartItemsDiv.appendChild(table);

    //display the overall
    cartTotalDiv.innerHTML = `Overall Total: $${overallTotal.toFixed(2)}`;


    function updateQuantity(productId, newQuantity) {
        console.log(`Attempting to update product ${productId} quantity to ${newQuantity}`);
        //if the quantity less than 1, remove it
        if (newQuantity < 1) {
            removeItem(productId);
            return;
        }

        //get the current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        //get the item by id
        const itemIndex = cart.findIndex(item => item.id === productId);

        // if find the item, update
        if (itemIndex > -1)
        {
            cart[itemIndex].quantity = newQuantity;
            console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
            //save the cart data to localstorage
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
        }else{
            console.warn(`Product with ID ${productId} not found in cart for update.`);
        }

        location.reload();
    }


    function removeItem(productId) {
        //update quantity in localStorage and refresh the cart display
        console.log(`Attempting to remove product with ID: ${productId}`);
        //get the data from local storage
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        //Filter the cart: Create a new array excluding the item to be removed
        const updatedCart = cart.filter(item => item.id !== productId);

        //check the number change
        if (cart.length === updatedCart.length) {
            console.warn(`Product with ID ${productId} not found in cart for removal.`);
        } else {
            console.log(`Product with ID ${productId} removed.`);
        }

        //save the new cart
        localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));

        //refresh the display
        location.reload();
    }












})