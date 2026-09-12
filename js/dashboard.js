if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const currentUser = localStorage.getItem('currentUser');
let collections = JSON.parse(localStorage.getItem(`wisher_collections_${currentUser}`)) || [];
let editingCollectionId = null;

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    loadProfileData();
    renderDashboard();
};

function loadProfileData() {
    const db = JSON.parse(localStorage.getItem('wisher_users')) || [];
    const userObj = db.find(u => u.username === currentUser);
    if (userObj && userObj.profilePic) {
        document.getElementById('profile-avatar').src = userObj.profilePic;
        document.getElementById('accPreviewPic').src = userObj.profilePic;
    }
}

function saveData() {
    localStorage.setItem(`wisher_collections_${currentUser}`, JSON.stringify(collections));
    renderDashboard();
}

// --- MODALS ---
function openCollectionModal(id = null) {
    editingCollectionId = id;
    document.getElementById('collectionModal').classList.add('active');
    
    if (id) {
        const col = collections.find(c => c.id === id);
        document.getElementById('collectionName').value = col.name;
        document.getElementById('collectionModalTitle').innerText = 'Edit Collection';
    } else {
        document.getElementById('collectionName').value = '';
        document.getElementById('collectionModalTitle').innerText = 'Add Collection';
    }
}

function editCollection(e, id) {
    e.stopPropagation();
    openCollectionModal(id);
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

// Logic Simpan Koleksi (Create & Update)
function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if(!name) { alert("Please enter a collection name."); return; }
    
    if (editingCollectionId) {
        const col = collections.find(c => c.id === editingCollectionId);
        col.name = name;
    } else {
        collections.push({
            id: 'col_' + Date.now(),
            name: name,
            items: [] // Perbaikan struktur agar langsung menampung item, tanpa wishlist
        });
    }
    
    saveData();
    closeModal('collectionModal');
}

// Render Data Dashboard
function renderDashboard() {
    const content = document.getElementById('board-content');
    
    if (collections.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openCollectionModal()">Add Collection</div>`;
        return;
    }

    let html = '<div class="collections-grid">';
    collections.forEach(col => {
        const itemCount = col.items ? col.items.length : 0;
        html += `
            <div class="collection-card" onclick="window.location.href='collection.html?id=${col.id}'">
                <button class="edit-icon-btn" onclick="editCollection(event, '${col.id}')">✏️</button>
                <h3>${col.name}</h3>
                <p>${itemCount} Items</p>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

// My Account Handlers & Kustom Foto
function openMyAccount() {
    const db = JSON.parse(localStorage.getItem('wisher_users')) || [];
    const userObj = db.find(u => u.username === currentUser);
    if(userObj) {
        document.getElementById('accUsername').value = userObj.username;
        document.getElementById('accEmail').value = userObj.email;
        cancelEditPassword();
        document.getElementById('accountModal').classList.add('active');
    }
}
function toggleEditPassword() {
    document.getElementById('passwordFields').style.display = 'block';
    document.getElementById('btnEditPassword').style.display = 'none';
}
function cancelEditPassword() {
    document.getElementById('passwordFields').style.display = 'none';
    document.getElementById('btnEditPassword').style.display = 'inline-flex';
    document.getElementById('accOldPassword').value = '';
    document.getElementById('accNewPassword').value = '';
    document.getElementById('accConfirmPassword').value = '';
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
function previewAccPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('accPreviewPic').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}
function saveAccount() {
    const db = JSON.parse(localStorage.getItem('wisher_users')) || [];
    const userIndex = db.findIndex(u => u.username === currentUser);
    
    // Validate Password if active
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
    
    // Save Profile Photo if changed
    const fileInput = document.getElementById('accProfilePhoto');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            db[userIndex].profilePic = e.target.result;
            finalizeAccountSave(db, e.target.result);
        }
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeAccountSave(db);
    }
}

function finalizeAccountSave(db, newPic = null) {
    localStorage.setItem('wisher_users', JSON.stringify(db));
    if(newPic) document.getElementById('profile-avatar').src = newPic;
    alert("Account updated successfully.");
    closeModal('accountModal');
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function changeLang(lang) { /* UI Translation placeholder */ }