if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const currentUser = localStorage.getItem('currentUser');
// Memastikan struktur Array yang bersih
let collections = JSON.parse(localStorage.getItem(`wisher_collections_${currentUser}`)) || [];

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    renderDashboard();
};

function saveData() {
    localStorage.setItem(`wisher_collections_${currentUser}`, JSON.stringify(collections));
    renderDashboard();
}

// --- MODALS ---
function openCollectionModal() {
    document.getElementById('collectionModal').classList.add('active');
    document.getElementById('collectionName').value = '';
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Profile Dropdown
function toggleProfileMenu() {
    document.getElementById('profileDropdown').classList.toggle('show');
}
window.onclick = function(event) {
    if (!event.target.closest('.sidebar-profile')) {
        document.getElementById('profileDropdown').classList.remove('show');
    }
}

// Logic Simpan Koleksi Baru
function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if(!name) { alert("Please enter a collection name."); return; }
    
    collections.push({
        id: 'col_' + Date.now(),
        name: name,
        wishlists: [] // Inisialisasi array wishlists kosong di dalam koleksi
    });
    
    saveData();
    closeModal('collectionModal');
}

// Render Data Dashboard
function renderDashboard() {
    const content = document.getElementById('board-content');
    
    // VISUAL KONDISIONAL STATE KOSONG 50% OPACITY
    if (collections.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openCollectionModal()">Add New Collection</div>`;
        return;
    }

    let html = '<div class="collections-grid">';
    collections.forEach(col => {
        // Redirection ke file baru collection.html jika diklik
        html += `
            <div class="collection-card" onclick="window.location.href='collection.html?id=${col.id}'">
                <h3>${col.name}</h3>
                <p>${col.wishlists.length} Wishlists</p>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

// My Account Handlers (Sama)
function openMyAccount() {
    const db = JSON.parse(localStorage.getItem('wisher_users')) || [];
    const userObj = db.find(u => u.username === currentUser);
    if(userObj) {
        document.getElementById('accUsername').value = userObj.username;
        document.getElementById('accEmail').value = userObj.email;
        document.getElementById('passwordFields').style.display = 'none';
        document.getElementById('btnEditPassword').style.display = 'inline-flex';
        document.getElementById('accOldPassword').value = '';
        document.getElementById('accNewPassword').value = '';
        document.getElementById('accConfirmPassword').value = '';
        document.getElementById('accountModal').classList.add('active');
    }
}
function toggleEditPassword() {
    document.getElementById('passwordFields').style.display = 'block';
    document.getElementById('btnEditPassword').style.display = 'none';
}
function validateAccPassword() {
    const input = document.getElementById('accNewPassword').value;
    const errorText = document.getElementById('acc-error');
    if (input.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/.test(input)) {
        errorText.classList.add('active');
    } else {
        errorText.classList.remove('active');
    }
}
function saveAccount() {
    const db = JSON.parse(localStorage.getItem('wisher_users')) || [];
    const userIndex = db.findIndex(u => u.username === currentUser);
    
    if (document.getElementById('passwordFields').style.display === 'block') {
        const oldPass = document.getElementById('accOldPassword').value;
        const newPass = document.getElementById('accNewPassword').value;
        const confPass = document.getElementById('accConfirmPassword').value;
        
        if (oldPass !== db[userIndex].password) { alert("Old password incorrect!"); return; }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/.test(newPass)) { alert("New password format invalid."); return; }
        if (newPass !== confPass) { alert("Passwords do not match."); return; }
        db[userIndex].password = newPass;
    }
    
    db[userIndex].email = document.getElementById('accEmail').value;
    localStorage.setItem('wisher_users', JSON.stringify(db));
    alert("Account updated successfully.");
    closeModal('accountModal');
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function changeLang(lang) { /* Implementasi UI terjemahan serupa jika diperlukan */ }