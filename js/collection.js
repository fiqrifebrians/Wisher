if (!Storage.isLoggedIn()) { window.location.href = 'index.html'; }

const currentUser = Storage.getCurrentUser();
const urlParams = new URLSearchParams(window.location.search);
const collectionId = urlParams.get('id');

let collections = Storage.getCollections();
let currentCollection = collections.find(c => c.id === collectionId);
let editingItemId = null;

if (!currentCollection) {
    alert("Collection not found!");
    window.location.href = 'dashboard.html';
}
if (!currentCollection.items) { currentCollection.items = []; }

const i18nCol = {
    en: {
        my_collections: "My Collections", my_account: "My Account", sign_out: "Sign Out", back: "&larr; Back",
        add_item: "+ Add Item", online_link: "Online Link (URL)", item_name: "Item Name",
        image_source: "Image Source", from_devices: "From Devices", currency: "Currency",
        price: "Price", save_item: "Save Item", username: "Username", email: "Email",
        edit_password: "Edit Password", old_password: "Old Password", new_password: "New Password",
        confirm_new_password: "Confirm New Password", cancel: "Cancel", save_changes: "Save Changes",
        upload_device: "Upload from Devices", pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number.",
        item_info: "Paste a link to auto-generate, or fill manually.", empty_item: "Add Item"
    },
    id: {
        my_collections: "Koleksi Saya", my_account: "Akun Saya", sign_out: "Keluar", back: "&larr; Kembali",
        add_item: "+ Tambah Item", online_link: "Tautan (URL)", item_name: "Nama Item",
        image_source: "Sumber Gambar", from_devices: "Dari Perangkat", currency: "Mata Uang",
        price: "Harga", save_item: "Simpan Item", username: "Nama Pengguna", email: "Email",
        edit_password: "Ubah Kata Sandi", old_password: "Kata Sandi Lama", new_password: "Kata Sandi Baru",
        confirm_new_password: "Konfirmasi Kata Sandi Baru", cancel: "Batal", save_changes: "Simpan Perubahan",
        upload_device: "Unggah dari Perangkat", pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka.",
        item_info: "Masukkan tautan untuk otomatisasi, atau isi manual.", empty_item: "Tambah Item"
    }
};

const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const ICON_DELETE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const ICON_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

window.onload = () => {
    document.getElementById('current-collection-title').innerText = currentCollection.name;
    document.getElementById('display-username').innerText = currentUser;
    UI.loadProfileData();
    UI.changeLang(Storage.getLang(), i18nCol);
    renderSidebarNav();
    renderCollection();
};

function changeLang(lang) {
    UI.changeLang(lang, i18nCol);
    renderCollection();
}

function saveData() {
    Storage.saveCollections(collections);
    renderCollection();
}

function toggleSidebar() { UI.toggleSidebar(); }

// Fitur Expand Dropdown Sidebar Collection
function toggleColDropdown(colId) {
    const ul = document.getElementById(`item-list-${colId}`);
    if (ul) ul.classList.toggle('expanded');
}

// Navigasi Sidebar Penuh dengan Dropdown Chevron
function renderSidebarNav() {
    const listContainer = document.getElementById('sidebar-collections');
    listContainer.innerHTML = '';
    collections.forEach(col => {
        const li = document.createElement('li');
        li.className = 'col-item-wrapper';
        const header = document.createElement('div');
        header.className = `col-header ${col.id === collectionId ? 'active' : ''}`;
        header.innerHTML = `
            <span class="hide-on-collapse" style="flex:1;" onclick="window.location.href='collection.html?id=${col.id}'">${col.name}</span>
            <span class="show-on-collapse" style="display:none;" onclick="window.location.href='collection.html?id=${col.id}'" title="${(col.name || '').replace(/"/g, '&quot;')}">${col.name.charAt(0)}</span>
            <div class="action-icons hide-on-collapse">
                <button class="icon-btn" onclick="toggleColDropdown('${col.id}')" title="Expand">${ICON_CHEVRON}</button>
            </div>
        `;
        li.appendChild(header);

        if (col.items && col.items.length > 0) {
            const ul = document.createElement('ul');
            ul.id = `item-list-${col.id}`;
            ul.className = `wl-list hide-on-collapse ${col.id === collectionId ? 'expanded' : ''}`; // Otomatis kebuka kalau sedang di koleksi itu
            col.items.forEach(item => {
                const itemLi = document.createElement('li');
                itemLi.className = `wl-item`;
                itemLi.innerHTML = `<span style="flex:1; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(item.name || '').replace(/"/g, '&quot;')}">- ${item.name}</span>`;
                ul.appendChild(itemLi);
            });
            li.appendChild(ul);
        }
        listContainer.appendChild(li);
    });
}

// --- LOGIKA FORM ITEM & SINKRONISASI LINK CERDAS ---
let itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openItemModal(id = null) {
    editingItemId = id;
    UI.openModal('itemModal');
    const lang = Storage.getLang();

    if (id) {
        const item = currentCollection.items.find(i => i.id === id);
        urlInput.value = item.url || '';
        nameInput.value = item.name;
        
        if(item.imageUrl && item.imageUrl.startsWith('data:image')) {
            itemState.customImageData = item.imageUrl;
            imageInput.value = '';
        } else {
            imageInput.value = item.imageUrl || '';
            itemState.customImageData = null;
        }
        
        priceInput.value = item.price;
        currencySelect.value = item.currency;
        document.getElementById('imagePreview').src = item.imageUrl;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('itemModalTitle').innerText = 'Edit Item';
        
        itemState.isManualName = true;
        itemState.isManualImage = true;
        itemState.currentUrl = item.url || "";
    } else {
        urlInput.value = ''; nameInput.value = ''; imageInput.value = ''; 
        document.getElementById('itemImageFile').value = '';
        priceInput.value = ''; document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('itemModalTitle').innerText = i18nCol[lang].add_item;
        itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };
    }
}

function editItem(e, id) { e.stopPropagation(); openItemModal(id); }

function deleteItem(e, id) {
    e.stopPropagation();
    if (confirm("Delete this item?")) {
        currentCollection.items = currentCollection.items.filter(i => i.id !== id);
        saveData();
    }
}

nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => { 
    itemState.isManualImage = imageInput.value.trim() !== "";
    itemState.customImageData = null; 
    document.getElementById('itemImageFile').value = ''; 
    const preview = document.getElementById('imagePreview');
    preview.src = imageInput.value;
    preview.style.display = itemState.isManualImage ? 'block' : 'none';
});

function previewItemImage(event) {
    UI.previewImage(event, 'imagePreview', (result) => {
        itemState.isManualImage = true;
        itemState.customImageData = result;
        imageInput.value = ''; 
    });
}

// Sinkronisasi Link dengan Fallback Cerdas (Gambar Default Dihindari di Form)
urlInput.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const data = Storage.simulateScrapeData(newUrl);

        if (!itemState.isManualName) { nameInput.value = data.scrapedName; }
        if (!itemState.isManualImage && data.scrapedImage !== "") {
            imageInput.value = data.scrapedImage;
            const preview = document.getElementById('imagePreview');
            preview.src = data.scrapedImage;
            preview.style.display = 'block';
        }

        priceInput.value = data.scrapedPrice;
        currencySelect.value = data.scrapedCurrency;
        itemState.currentUrl = newUrl;
    }
});

// Realokasi Fallback Generik di Background Proses Save
function saveItem() {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    if(!name || !price) { alert("Nama dan Harga wajib diisi!"); return; }
    
    // Cek jika Gambar Kosong -> Tembak Generik di Background
    let finalImageUrl = itemState.customImageData || imageInput.value.trim();
    if (!finalImageUrl || finalImageUrl === "") {
        finalImageUrl = Storage.FALLBACK_IMAGE;
    }
    
    if (editingItemId) {
        const item = currentCollection.items.find(i => i.id === editingItemId);
        item.name = name; item.url = urlInput.value; item.imageUrl = finalImageUrl;
        item.price = Number(price); item.currency = currencySelect.value;
    } else {
        currentCollection.items.push({
            id: 'itm_' + Date.now(), name: name, url: urlInput.value,
            imageUrl: finalImageUrl, price: Number(price), currency: currencySelect.value
        });
    }
    
    saveData();
    UI.closeModal('itemModal');
}

function renderCollection() {
    const content = document.getElementById('board-content');
    const lang = Storage.getLang();
    
    if (currentCollection.items.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openItemModal()">${i18nCol[lang].empty_item}</div>`;
        return;
    }

    let html = `<div class="items-grid">`;
    currentCollection.items.forEach(item => {
        let currencySymbol = item.currency;
        if(item.currency==='USD'||item.currency==='AUD'||item.currency==='SGD') currencySymbol='$';
        if(item.currency==='GBP') currencySymbol='£';
        if(item.currency==='CNY'||item.currency==='JPY') currencySymbol='¥';
        if(item.currency==='IDR') currencySymbol='Rp';

        // Pencegahan Sintaks Bocor pada alt string interpolasi
        const safeName = item.name ? item.name.replace(/"/g, '&quot;') : 'Product';

        html += `
            <div class="item-card">
                <button class="edit-icon-card" onclick="editItem(event, '${item.id}')">${ICON_EDIT}</button>
                <button class="delete-icon-card" onclick="deleteItem(event, '${item.id}')">${ICON_DELETE}</button>
                <img class="item-img" src="${item.imageUrl}" alt="${safeName}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${currencySymbol} ${item.price.toLocaleString()}</p>
                    ${item.url ? `<a href="${item.url}" class="item-link" target="_blank">Link &rarr;</a>` : ''}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    content.innerHTML = html;
}

// AKUN LOGIC
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