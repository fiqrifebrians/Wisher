if (!Storage.isLoggedIn()) { window.location.href = 'index.html'; }

const currentUser = Storage.getCurrentUser();
let collections = Storage.getCollections();
let editingCollectionId = null;
let draggedColId = null; 

const i18nDash = {
    en: {
        my_collections: "My Collections", add_collection: "+ Add Collection",
        my_account: "My Account", sign_out: "Sign Out", collection_name: "Collection Name",
        save_collection: "Save Collection", username: "Username", email: "Email",
        edit_password: "Edit Password", old_password: "Old Password", new_password: "New Password",
        confirm_new_password: "Confirm New Password", cancel: "Cancel", save_changes: "Save Changes",
        upload_device: "Upload from Devices", pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number.",
        empty_col: "Add Collection"
    },
    id: {
        my_collections: "Koleksi Saya", add_collection: "+ Tambah Koleksi",
        my_account: "Akun Saya", sign_out: "Keluar", collection_name: "Nama Koleksi",
        save_collection: "Simpan Koleksi", username: "Nama Pengguna", email: "Email",
        edit_password: "Ubah Kata Sandi", old_password: "Kata Sandi Lama", new_password: "Kata Sandi Baru",
        confirm_new_password: "Konfirmasi Kata Sandi Baru", cancel: "Batal", save_changes: "Simpan Perubahan",
        upload_device: "Unggah dari Perangkat", pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka.",
        empty_col: "Tambah Koleksi"
    }
};

const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const ICON_DELETE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const ICON_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    UI.loadProfileData();
    UI.changeLang(Storage.getLang(), i18nDash);
    renderSidebar();
    renderMainContent();
};

function changeLang(lang) {
    UI.changeLang(lang, i18nDash);
    renderSidebar();
    renderMainContent();
}

function saveData() {
    Storage.saveCollections(collections);
    renderSidebar();
    renderMainContent();
}

function toggleSidebar() { UI.toggleSidebar(); }

// --- TWO-WAY DRAG AND DROP SINKRONISASI PADA KARTU DASHBOARD ---
function handleDragStartCol(e, colId) {
    draggedColId = colId;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => e.target.classList.add('dragging'), 0);
}
function handleDragOverCol(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}
function handleDragLeaveCol(e) {
    e.currentTarget.classList.remove('drag-over');
}
function handleDropCol(e, targetColId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedColId || draggedColId === targetColId) return;

    const draggedIndex = collections.findIndex(c => c.id === draggedColId);
    const targetIndex = collections.findIndex(c => c.id === targetColId);

    const [movedCol] = collections.splice(draggedIndex, 1);
    collections.splice(targetIndex, 0, movedCol);

    saveData(); 
}
function handleDragEndCol(e) {
    e.target.classList.remove('dragging');
    draggedColId = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function toggleColDropdown(colId) {
    const ul = document.getElementById(`item-list-${colId}`);
    if (ul) ul.classList.toggle('expanded');
}

function renderSidebar() {
    const listContainer = document.getElementById('sidebar-collections');
    listContainer.innerHTML = '';

    collections.forEach(col => {
        const li = document.createElement('li');
        li.className = 'col-item-wrapper';
        
        const header = document.createElement('div');
        header.className = `col-header`;
        header.innerHTML = `
            <span class="hide-on-collapse" style="flex:1;" onclick="window.location.href='collection.html?id=${col.id}'">${col.name}</span>
            <span class="show-on-collapse" style="display:none;" onclick="window.location.href='collection.html?id=${col.id}'" title="${(col.name || '').replace(/"/g, '&quot;')}">${col.name.charAt(0)}</span>
            <div class="action-icons hide-on-collapse">
                <button class="icon-btn" onclick="toggleColDropdown('${col.id}')" title="Expand">${ICON_CHEVRON}</button>
                <button class="icon-btn" onclick="openCollectionModal('${col.id}')" title="Edit">${ICON_EDIT}</button>
                <button class="icon-btn delete" onclick="deleteCollection('${col.id}')" title="Delete">${ICON_DELETE}</button>
            </div>
        `;
        li.appendChild(header);

        if (col.items && col.items.length > 0) {
            const ul = document.createElement('ul');
            ul.id = `item-list-${col.id}`;
            ul.className = `wl-list hide-on-collapse`;
            col.items.forEach(item => {
                const itemLi = document.createElement('li');
                itemLi.className = `wl-item`;
                // Menghilangkan tanda "-" di text
                itemLi.innerHTML = `<span style="flex:1; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(item.name || '').replace(/"/g, '&quot;')}">${item.name}</span>`;
                ul.appendChild(itemLi);
            });
            li.appendChild(ul);
        }

        listContainer.appendChild(li);
    });
}

function renderMainContent() {
    const content = document.getElementById('board-content');
    const lang = Storage.getLang();
    
    if (collections.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openCollectionModal()">${i18nDash[lang].empty_col}</div>`;
        return;
    }

    let html = '<div class="collections-grid">';
    collections.forEach(col => {
        const itemCount = col.items ? col.items.length : 0;
        
        let collageHtml = `<div class="collection-card-collage collage-${Math.min(itemCount, 4)}">`;
        if (itemCount === 0) {
            // Bersih tanpa atribut tag yang bocor
            collageHtml += `<img src="${Storage.FALLBACK_IMAGE}" class="collage-img" alt="Empty" style="padding: 24px; object-fit: contain;">`;
        } else {
            const displayItems = col.items.slice(0, 4);
            displayItems.forEach((item, idx) => {
                let safeImageUrl = item.imageUrl;
                if (!safeImageUrl || (safeImageUrl.includes('<svg') && safeImageUrl.includes('data:image'))) {
                    safeImageUrl = Storage.FALLBACK_IMAGE;
                }
                const safeName = item.name ? item.name.replace(/"/g, '&quot;') : 'Product';
                collageHtml += `<img src="${safeImageUrl}" class="collage-img img-${idx}" alt="${safeName}">`;
            });
        }
        collageHtml += `</div>`;

        html += `
            <div class="collection-card" draggable="true" 
                ondragstart="handleDragStartCol(event, '${col.id}')"
                ondragover="handleDragOverCol(event)"
                ondragleave="handleDragLeaveCol(event)"
                ondrop="handleDropCol(event, '${col.id}')"
                ondragend="handleDragEndCol(event)"
                onclick="window.location.href='collection.html?id=${col.id}'">
                <button class="edit-icon-card" onclick="editCollection(event, '${col.id}')">${ICON_EDIT}</button>
                <button class="delete-icon-card" onclick="deleteCollectionMain(event, '${col.id}')">${ICON_DELETE}</button>
                ${collageHtml}
                <h3>${col.name}</h3>
                <p>${itemCount} Items</p>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

// --- LOGIKA HAPUS & MODAL COLLECTION ---
function deleteCollection(id) {
    if (confirm("Delete this Collection permanently?")) {
        collections = collections.filter(c => c.id !== id);
        saveData();
    }
}
function deleteCollectionMain(e, id) { e.stopPropagation(); deleteCollection(id); }

function openCollectionModal(id = null) {
    editingCollectionId = id;
    UI.openModal('collectionModal');
    const lang = Storage.getLang();
    
    if (id) {
        const col = collections.find(c => c.id === id);
        document.getElementById('collectionName').value = col.name;
        document.getElementById('collectionModalTitle').innerText = 'Edit Collection';
    } else {
        document.getElementById('collectionName').value = '';
        document.getElementById('collectionModalTitle').innerText = i18nDash[lang].add_collection;
    }
}

function editCollection(e, id) { e.stopPropagation(); openCollectionModal(id); }

function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if(!name) return;
    
    if (editingCollectionId) {
        const col = collections.find(c => c.id === editingCollectionId);
        col.name = name;
    } else {
        collections.push({ id: 'col_' + Date.now(), name: name, items: [] });
    }
    saveData();
    UI.closeModal('collectionModal');
}

// --- AKUN LOGIC ---
function openMyAccount() {
    const db = Storage.getUsers();
    const userObj = db.find(u => u.username === currentUser);
    if(userObj) {
        document.getElementById('accUsername').value = userObj.username;
        document.getElementById('accEmail').value = userObj.email;
        cancelEditPassword();
        UI.openModal('accountModal');
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
    if (input.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/.test(input)) { errorText.classList.add('active'); } 
    else { errorText.classList.remove('active'); }
}
function saveAccount() {
    const db = Storage.getUsers();
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
    
    const fileInput = document.getElementById('accProfilePhoto');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            db[userIndex].profilePic = e.target.result;
            Storage.saveUsers(db);
            document.getElementById('profile-avatar').src = e.target.result;
            alert("Account updated successfully.");
            UI.closeModal('accountModal');
        }
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        Storage.saveUsers(db);
        alert("Account updated successfully.");
        UI.closeModal('accountModal');
    }
}
function logout() { Storage.logout(); }