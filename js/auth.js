const i18nAuth = {
    en: {
        welcome_back: "Welcome Back", join_wisher: "Join Wisher", username: "Username",
        password: "Password", confirm_password: "Confirm Password", email: "Email",
        login_btn: "Log In", signup_btn: "Sign Up", no_account: "Don't have an account?",
        sign_up_here: "Sign Up here", has_account: "Already have an account?",
        log_in_here: "Log In here", pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number."
    },
    id: {
        welcome_back: "Selamat Datang Kembali", join_wisher: "Bergabung dengan Wisher", username: "Nama Pengguna",
        password: "Kata Sandi", confirm_password: "Konfirmasi Kata Sandi", email: "Email",
        login_btn: "Masuk", signup_btn: "Daftar", no_account: "Belum punya akun?",
        sign_up_here: "Daftar di sini", has_account: "Sudah punya akun?",
        log_in_here: "Masuk di sini", pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka."
    }
};

window.onload = () => { UI.changeLang(Storage.getLang(), i18nAuth); };
function changeLang(lang) { UI.changeLang(lang, i18nAuth); }

function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active'); signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active'); loginForm.classList.add('active');
    }
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/;

function validateSignupPassword() {
    const input = document.getElementById('signup-password').value;
    const errorText = document.getElementById('signup-error');
    if (input.length > 0 && !passwordRegex.test(input)) { errorText.classList.add('active'); } 
    else { errorText.classList.remove('active'); }
}

function validateLoginPassword() {
    const input = document.getElementById('login-password').value;
    const errorText = document.getElementById('login-error');
    if (input.length > 0 && !passwordRegex.test(input)) { errorText.classList.add('active'); } 
    else { errorText.classList.remove('active'); }
}

function doSignup() {
    const user = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('signup-confirm-password').value;
    
    if (!user || !email || !passwordRegex.test(pass)) { alert(Storage.getLang() === 'id' ? "Mohon lengkapi form dan penuhi kriteria password." : "Please fill out the form and meet password criteria."); return; }
    if (pass !== confirmPass) { alert(Storage.getLang() === 'id' ? "Konfirmasi password tidak cocok!" : "Passwords do not match!"); return; }

    const db = Storage.getUsers();
    if (db.find(u => u.username === user)) { alert(Storage.getLang() === 'id' ? "Username sudah terdaftar!" : "Username already exists!"); return; }

    db.push({ username: user, email: email, password: pass });
    Storage.saveUsers(db);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', user);
    
    // Inisialisasi Koleksi (Struktur 1 Lapis tanpa Wishlist Hierarchy)
    const initialData = [{ id: 'col_' + Date.now(), name: "Work Setup", items: [] }];
    Storage.saveCollections(initialData);
    window.location.href = 'dashboard.html';
}

function doLogin() {
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;
    
    const db = Storage.getUsers();
    const foundUser = db.find(u => u.username === user);
    
    if (!foundUser) { alert(Storage.getLang() === 'id' ? "Username tidak ditemukan!" : "Username not found!"); return; }
    if (foundUser.password !== pass) { alert(Storage.getLang() === 'id' ? "Password salah!" : "Incorrect password!"); return; }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', user);
    window.location.href = 'dashboard.html';
}