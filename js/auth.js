// Toggle between Login and Signup
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const wrapper = input.parentElement;
    const slash = wrapper.querySelector('.slash');

    if (input.type === "password") {
        input.type = "text";
        slash.style.display = "block"; // eye with slash
    } else {
        input.type = "password";
        slash.style.display = "none"; // normal eye
    }
}

// Validation Regex: Min 9 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

function validateSignupPassword() {
    const input = document.getElementById('signup-password').value;
    const errorText = document.getElementById('signup-error');
    
    // Only show error if not empty and doesn't match criteria
    if (input.length > 0 && !passwordRegex.test(input)) {
        errorText.classList.add('active');
    } else {
        errorText.classList.remove('active');
    }
}

function validateLoginPassword() {
    const input = document.getElementById('login-password').value;
    const errorText = document.getElementById('login-error');
    
    if (input.length > 0 && !passwordRegex.test(input)) {
        errorText.classList.add('active');
    } else {
        errorText.classList.remove('active');
    }
}

// Perform Signup (First Time Setup)
function doSignup() {
    const user = document.getElementById('signup-username').value;
    const pass = document.getElementById('signup-password').value;
    
    if (!user || !passwordRegex.test(pass)) {
        alert("Please enter a valid username and password following the criteria.");
        return;
    }
    
    // Set Logged In State
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user);
    
    // FIRST TIME SIGN UP DATA: Initialize with "Work Update Setup" only
    const initialData = [
        {
            id: Date.now(),
            name: "Work Update Setup",
            categories: [
                {
                    name: "Gadgets",
                    items: [
                        {
                            name: "Monitor 4K",
                            url: "",
                            imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400",
                            price: 4500000,
                            currency: "IDR"
                        }
                    ]
                }
            ]
        }
    ];
    localStorage.setItem('wisher_data', JSON.stringify(initialData));
    
    window.location.href = 'dashboard.html';
}

// Perform Login
function doLogin() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    
    if (!user || !passwordRegex.test(pass)) {
        alert("Please enter a valid username and password.");
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    // If no data exists, it will be handled by dashboard empty state
    window.location.href = 'dashboard.html';
}