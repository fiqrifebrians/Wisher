const i18n = {
    en: {
        welcome_back: "Welcome Back",
        join_wisher: "Join Wisher",
        username: "Username",
        password: "Password",
        confirm_password: "Confirm Password",
        email: "Email",
        login_btn: "Log In",
        signup_btn: "Sign Up",
        no_account: "Don't have an account?",
        sign_up_here: "Sign Up here",
        has_account: "Already have an account?",
        log_in_here: "Log In here",
        pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number."
    },
    id: {
        welcome_back: "Selamat Datang Kembali",
        join_wisher: "Bergabung dengan Wisher",
        username: "Nama Pengguna",
        password: "Kata Sandi",
        confirm_password: "Konfirmasi Kata Sandi",
        email: "Email",
        login_btn: "Masuk",
        signup_btn: "Daftar",
        no_account: "Belum punya akun?",
        sign_up_here: "Daftar di sini",
        has_account: "Sudah punya akun?",
        log_in_here: "Masuk di sini",
        pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka."
    }
};

function changeLang(lang) {
    localStorage.setItem('wisher_lang', lang);
    document.querySelectorAll('.lang-select').forEach(el => el.value = lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = i18n[lang][key];
            } else {
                el.innerHTML = i18n[lang][key];
            }
        }
    });
}

window.onload = () => {
    const savedLang = localStorage.getItem('wisher_lang') || 'en';
    changeLang(savedLang);
};

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

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const wrapper = input.parentElement;
    const slash = wrapper.querySelector('.slash');

    if (input.type === "password") {
        input.type = "text";
        slash.style.display = "block";
    } else {
        input.type = "password";
        slash.style.display = "none";
    }
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

function validateSignupPassword() {
    const input = document.getElementById('signup-password').value;
    const errorText = document.getElementById('signup-error');
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

function getDatabase() {
    return JSON.parse(localStorage.getItem('wisher_users')) || [];
}
function saveDatabase(db) {
    localStorage.setItem('wisher_users', JSON.stringify(db));
}

function doSignup() {
    const user = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('signup-confirm-password').value;
    
    if (!user || !email || !passwordRegex.test(pass)) {
        alert(localStorage.getItem('wisher_lang') === 'id' ? "Mohon lengkapi form dan penuhi kriteria password." : "Please fill out the form and meet password criteria.");
        return;
    }
    if (pass !== confirmPass) {
        alert(localStorage.getItem('wisher_lang') === 'id' ? "Konfirmasi password tidak cocok!" : "Passwords do not match!");
        return;
    }

    const db = getDatabase();
    if (db.find(u => u.username === user)) {
        alert(localStorage.getItem('wisher_lang') === 'id' ? "Username sudah terdaftar! Gunakan yang lain." : "Username already exists! Please use another.");
        return;
    }

    db.push({ username: user, email: email, password: pass });
    saveDatabase(db);
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', user);
    
    // Initial data template
    const initialData = [{
        id: Date.now(),
        name: "Work Update Setup",
        collections: [{
            id: 'col_' + Date.now(),
            name: "Gadgets",
            items: [{
                id: 'itm_' + Date.now(),
                name: "Monitor 4K",
                url: "",
                imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400",
                price: 4500000,
                currency: "IDR"
            }]
        }]
    }];
    localStorage.setItem(`wisher_data_${user}`, JSON.stringify(initialData));
    
    window.location.href = 'dashboard.html';
}

function doLogin() {
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;
    
    const db = getDatabase();
    const foundUser = db.find(u => u.username === user);
    
    if (!foundUser) {
        alert(localStorage.getItem('wisher_lang') === 'id' ? "Username tidak ditemukan! Silakan Sign Up terlebih dahulu." : "Username not found! Please Sign Up first.");
        return;
    }
    
    if (foundUser.password !== pass) {
        alert(localStorage.getItem('wisher_lang') === 'id' ? "Password salah!" : "Incorrect password!");
        return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', user);
    window.location.href = 'dashboard.html';
}