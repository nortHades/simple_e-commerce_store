document.addEventListener('DOMContentLoaded', () => {
    // Get references to the DOM elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginFormElement = document.getElementById('login-form-element');
    const registerFormElement = document.getElementById('register-form-element');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Tab switching functionality
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginMessage.textContent = '';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        registerMessage.textContent = '';
    });

    // Login form submission
    loginFormElement.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Validate inputs
        if (!username || !password) {
            loginMessage.textContent = 'Please enter both username and password.';
            return;
        }

        // Show loading indicator
        loginMessage.textContent = 'Logging in...';

        // Create request payload
        const credentials = { username, password };

        // Send login request to server
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful, received token:', data);

                // Store authentication token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify({
                    username: data.username,
                    id: data.id
                }));

                // Sync shopping cart with server
                syncCartWithServer();

                // Check if there's a redirect URL saved
                let redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                console.log('Redirect URL from sessionStorage:', redirectUrl);

                // Also check URL parameters for redirect
                const urlParams = new URLSearchParams(window.location.search);
                const redirectParam = urlParams.get('redirect');
                if (redirectParam && !redirectUrl) {
                    redirectUrl = redirectParam;
                    console.log('Redirect URL from URL parameter:', redirectUrl);
                }

                if (redirectUrl) {
                    // Remove redirect info to prevent loops
                    sessionStorage.removeItem('redirectAfterLogin');
                    console.log('Redirecting to:', redirectUrl);

                    // 简化重定向逻辑，直接使用相对路径
                    window.location.href = redirectUrl;
                } else {
                    // Default redirect to home page
                    console.log('No redirect URL found, going to index.html');
                    window.location.href = 'index.html';
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                loginMessage.textContent = 'Invalid username or password. Please try again.';
            });
    });


    // Register form submission
    registerFormElement.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validate inputs
        if (!username || !password || !confirmPassword) {
            registerMessage.textContent = 'Please fill in all fields.';
            return;
        }

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Passwords do not match.';
            return;
        }

        if (password.length < 6) {
            registerMessage.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        // Show loading indicator
        registerMessage.textContent = 'Creating account...';

        // Create request payload
        const userData = { username, password };

        // Send registration request to server
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 409) {
                        throw new Error('Username already exists');
                    }
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                registerMessage.textContent = 'Registration successful! You can now log in.';
                registerMessage.classList.add('success');

                // Clear the form
                registerFormElement.reset();

                // Switch to login tab after successful registration
                setTimeout(() => {
                    loginTab.click();
                }, 2000);
            })
            .catch(error => {
                console.error('Registration error:', error);
                registerMessage.textContent = error.message === 'Username already exists' ?
                    'This username is already taken. Please choose another one.' :
                    'Registration failed. Please try again.';
                registerMessage.classList.remove('success');
            });
    });

    // Function to sync shopping cart with server
    function syncCartWithServer() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        if (cart.length > 0) {
            fetch('/api/users/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
    }

    // Check URL parameters for redirect
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    if (redirectParam) {
        sessionStorage.setItem('redirectAfterLogin', redirectParam);
        console.log('Redirect parameter detected and saved:', redirectParam);
    }
});