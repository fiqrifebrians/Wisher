if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const currentUser = localStorage.getItem('currentUser');
// Struktur Data: Collection -> Wishlists -> Items
let collections = JSON.parse(localStorage.getItem(`wisher_collections_${currentUser}`)) || [];

let activeCollectionId = null;
let activeWishlistId = null;
let editingCollectionId = null;
let editingWishlistId = null;
let editingItemId = null;

// Kamus Multi-Bahasa
const i18nDash = {
    en: {
        add_collection: "+ Add Collection", my_collections: "MY COLLECTIONS",
        my_account: "My Account", sign_out: "Sign Out", add_wishlist: "+ Add Wishlist", add_item: "+ Add Item",
        collection_name: "Collection Name", save_collection: "Save Collection",
        wishlist_name: "Wishlist Name", save_wishlist: "Save Wishlist",
        online_link: "Online Link (URL)", item_name: "Item Name", image_source: "Image Source",
        from_devices: "From Devices", currency: "Currency", price: "Price", save_item: "Save Item",
        username: "Username", email: "Email", edit_password: "Edit Password",
        old_password: "Old Password", new_password: "New Password", confirm_new_password: "Confirm New Password",
        cancel: "Cancel", save_changes: "Save Changes", upload_device: "Upload from Devices",
        item_info: "Paste a link to auto-generate, or fill manually.",
        pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number.",
        empty_col: "Add Collection", empty_wl: "Add Wishlist", empty_item: "Add Item"
    },
    id: {
        add_collection: "+ Tambah Koleksi", my_collections: "KOLEKSI SAYA",
        my_account: "Akun Saya", sign_out: "Keluar", add_wishlist: "+ Tambah Wishlist", add_item: "+ Tambah Item",
        collection_name: "Nama Koleksi", save_collection: "Simpan Koleksi",
        wishlist_name: "Nama Wishlist", save_wishlist: "Simpan Wishlist",
        online_link: "Tautan (URL)", item_name: "Nama Item", image_source: "Sumber Gambar",
        from_devices: "Dari Perangkat", currency: "Mata Uang", price: "Harga", save_item: "Simpan Item",
        username: "Nama Pengguna", email: "Email", edit_password: "Ubah Kata Sandi",
        old_password: "Kata Sandi Lama", new_password: "Kata Sandi Baru", confirm_new_password: "Konfirmasi Kata Sandi Baru",
        cancel: "Batal", save_changes: "Simpan Perubahan", upload_device: "Unggah dari Perangkat",
        item_info: "Masukkan tautan untuk otomatisasi, atau isi manual.",
        pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka.",
        empty_col: "Tambah Koleksi", empty_wl: "Tambah Wishlist", empty_item: "Tambah Item"
    }
};

function changeLang(lang) {
    localStorage.setItem('wisher_lang', lang);
    document.querySelectorAll('.lang-select').forEach(el => el.value = lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nDash[lang] && i18nDash[lang][key]) { el.innerHTML = i18nDash[lang][key]; }
    });
    renderSidebar();
    renderMainContent();
}

// Icons Minimalis
const ICON_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const ICON_DELETE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const ICON_ADD = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    loadProfileData();
    const savedLang = localStorage.getItem('wisher_lang') || 'en';
    changeLang(savedLang);
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
    renderSidebar();
    renderMainContent();
}

// --- COLLAPSIBLE SIDEBAR ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// --- RENDERING SIDEBAR (NESTED WISHLISTS) ---
function renderSidebar() {
    const listContainer = document.getElementById('sidebar-collections');
    listContainer.innerHTML = '';

    collections.forEach(col => {
        const li = document.createElement('li');
        li.className = 'col-item-wrapper';

        // Header Koleksi
        const header = document.createElement('div');
        header.className = `col-header ${activeCollectionId === col.id && !activeWishlistId ? 'active' : ''}`;
        header.innerHTML = `
            <span class="hide-on-collapse" style="flex:1;" onclick="toggleColDropdown('${col.id}')">${col.name}</span>
            <span class="show-on-collapse" style="display:none;" onclick="toggleColDropdown('${col.id}')" title="${col.name}">${col.name.charAt(0)}</span>
            <div class="action-icons hide-on-collapse">
                <button class="icon-btn" onclick="openWishlistModal('${col.id}')" title="Add Wishlist">${ICON_ADD}</button>
                <button class="icon-btn" onclick="openCollectionModal('${col.id}')" title="Edit">${ICON_EDIT}</button>
                <button class="icon-btn delete" onclick="deleteCollection('${col.id}')" title="Delete">${ICON_DELETE}</button>
            </div>
        `;
        li.appendChild(header);

        // List Wishlist di bawah Koleksi
        const ul = document.createElement('ul');
        ul.id = `wl-list-${col.id}`;
        ul.className = `wl-list hide-on-collapse ${activeCollectionId === col.id ? 'expanded' : ''}`;
        
        col.wishlists.forEach(wl => {
            const wlLi = document.createElement('li');
            wlLi.className = `wl-item ${activeWishlistId === wl.id ? 'active' : ''}`;
            wlLi.innerHTML = `
                <span style="flex:1;" onclick="selectWishlist('${col.id}', '${wl.id}')">${wl.name}</span>
                <div class="action-icons">
                    <button class="icon-btn" onclick="openWishlistModal('${col.id}', '${wl.id}')" title="Edit">${ICON_EDIT}</button>
                    <button class="icon-btn delete" onclick="deleteWishlist('${col.id}', '${wl.id}')" title="Delete">${ICON_DELETE}</button>
                </div>
            `;
            ul.appendChild(wlLi);
        });

        li.appendChild(ul);
        listContainer.appendChild(li);
    });
}

function toggleColDropdown(colId) {
    activeCollectionId = colId;
    activeWishlistId = null; // Reset seleksi wishlist, fokus ke koleksi
    const ul = document.getElementById(`wl-list-${colId}`);
    if (ul) ul.classList.toggle('expanded');
    renderSidebar();
    renderMainContent();
}

function selectWishlist(colId, wlId) {
    activeCollectionId = colId;
    activeWishlistId = wlId;
    
    // Pastikan dropdown koleksi terbuka
    const ul = document.getElementById(`wl-list-${colId}`);
    if (ul) ul.classList.add('expanded');
    
    renderSidebar();
    renderMainContent();
}

// --- RENDERING MAIN CONTENT ---
function renderMainContent() {
    const content = document.getElementById('board-content');
    const title = document.getElementById('current-list-title');
    const btnAddItem = document.getElementById('btnAddItem');
    const lang = localStorage.getItem('wisher_lang') || 'en';

    if (collections.length === 0) {
        title.innerText = "Welcome";
        btnAddItem.style.display = 'none';
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openCollectionModal()">${i18nDash[lang].empty_col}</div>`;
        return;
    }

    if (!activeCollectionId) {
        title.innerText = "Select a Collection";
        btnAddItem.style.display = 'none';
        content.innerHTML = '';
        return;
    }

    const col = collections.find(c => c.id === activeCollectionId);

    if (activeCollectionId && !activeWishlistId) {
        title.innerText = col.name;
        btnAddItem.style.display = 'none';
        if (col.wishlists.length === 0) {
            content.innerHTML = `<div class="empty-suggestion-50" onclick="openWishlistModal('${col.id}')">${i18nDash[lang].empty_wl}</div>`;
        } else {
            content.innerHTML = `<p style="color:var(--text-gray); padding-top:20px;">Please select a wishlist from the sidebar.</p>`;
        }
        return;
    }

    // Wishlist Terpilih
    const wl = col.wishlists.find(w => w.id === activeWishlistId);
    title.innerText = `${col.name} / ${wl.name}`;
    btnAddItem.style.display = 'inline-flex'; // Munculkan aksi Add Item

    if (wl.items.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openItemModal()">${i18nDash[lang].empty_item}</div>`;
        return;
    }

    // Render Grid Items
    let html = `<div class="items-grid">`;
    wl.items.forEach(item => {
        let currencySymbol = item.currency;
        if(item.currency==='USD'||item.currency==='AUD'||item.currency==='SGD') currencySymbol='$';
        if(item.currency==='GBP') currencySymbol='£';
        if(item.currency==='CNY'||item.currency==='JPY') currencySymbol='¥';
        if(item.currency==='IDR') currencySymbol='Rp';

        html += `
            <div class="item-card">
                <button class="edit-icon-card" onclick="openItemModal('${item.id}')" title="Edit">${ICON_EDIT}</button>
                <button class="delete-icon-card" onclick="deleteItem('${col.id}', '${wl.id}', '${item.id}')" title="Delete">${ICON_DELETE}</button>
                
                <div class="item-img" style="background-image: url('${item.imageUrl}');"></div>
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


// --- HAPUS DATA LOGIC ---
function deleteCollection(id) {
    if (confirm("Are you sure you want to delete this Collection permanently?")) {
        collections = collections.filter(c => c.id !== id);
        if (activeCollectionId === id) { activeCollectionId = null; activeWishlistId = null; }
        saveData();
    }
}
function deleteWishlist(colId, wlId) {
    if (confirm("Are you sure you want to delete this Wishlist permanently?")) {
        const col = collections.find(c => c.id === colId);
        col.wishlists = col.wishlists.filter(w => w.id !== wlId);
        if (activeWishlistId === wlId) activeWishlistId = null;
        saveData();
    }
}
function deleteItem(colId, wlId, itemId) {
    if (confirm("Delete this item?")) {
        const wl = collections.find(c => c.id === colId).wishlists.find(w => w.id === wlId);
        wl.items = wl.items.filter(i => i.id !== itemId);
        saveData();
    }
}

// --- MODALS COLLECTION & WISHLIST ---
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function openCollectionModal(id = null) {
    editingCollectionId = id;
    document.getElementById('collectionModal').classList.add('active');
    const lang = localStorage.getItem('wisher_lang') || 'en';
    
    if (id) {
        const col = collections.find(c => c.id === id);
        document.getElementById('collectionName').value = col.name;
        document.getElementById('collectionModalTitle').innerText = 'Edit Collection';
    } else {
        document.getElementById('collectionName').value = '';
        document.getElementById('collectionModalTitle').innerText = i18nDash[lang].add_collection;
    }
}

function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if(!name) return;
    
    if (editingCollectionId) {
        const col = collections.find(c => c.id === editingCollectionId);
        col.name = name;
    } else {
        collections.push({ id: 'col_' + Date.now(), name: name, wishlists: [] });
    }
    saveData();
    closeModal('collectionModal');
}

let targetColForWishlist = null;
function openWishlistModal(colId, id = null) {
    targetColForWishlist = colId;
    editingWishlistId = id;
    document.getElementById('wishlistModal').classList.add('active');
    const lang = localStorage.getItem('wisher_lang') || 'en';

    if (id) {
        const wl = collections.find(c => c.id === colId).wishlists.find(w => w.id === id);
        document.getElementById('wishlistName').value = wl.name;
        document.getElementById('wishlistModalTitle').innerText = 'Edit Wishlist';
    } else {
        document.getElementById('wishlistName').value = '';
        document.getElementById('wishlistModalTitle').innerText = i18nDash[lang].add_wishlist;
    }
}

function saveWishlist() {
    const name = document.getElementById('wishlistName').value.trim();
    if(!name) return;

    const col = collections.find(c => c.id === targetColForWishlist);
    if (editingWishlistId) {
        const wl = col.wishlists.find(w => w.id === editingWishlistId);
        wl.name = name;
    } else {
        col.wishlists.push({ id: 'wl_' + Date.now(), name: name, items: [] });
        // Expand otomatis saat baru ditambah
        activeCollectionId = targetColForWishlist;
    }
    saveData();
    closeModal('wishlistModal');
}


// --- LOGIKA FORM ITEM & SINKRONISASI KETAT ---
let itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openItemModal(id = null) {
    editingItemId = id;
    document.getElementById('itemModal').classList.add('active');
    const lang = localStorage.getItem('wisher_lang') || 'en';

    if (id) {
        const wl = collections.find(c => c.id === activeCollectionId).wishlists.find(w => w.id === activeWishlistId);
        const item = wl.items.find(i => i.id === id);
        
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
        document.getElementById('itemModalTitle').innerText = i18nDash[lang].add_item;
        itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };
    }
}

nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => { 
    itemState.isManualImage = imageInput.value.trim() !== "";
    itemState.customImageData = null; 
    document.getElementById('itemImageFile').value = ''; 
    document.getElementById('imagePreview').src = imageInput.value;
    document.getElementById('imagePreview').style.display = itemState.isManualImage ? 'block' : 'none';
});

function previewItemImage(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            itemState.isManualImage = true;
            itemState.customImageData = e.target.result;
            imageInput.value = ''; 
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

function simulateScrapeData(url) {
    let domain = "Store";
    try { domain = new URL(url).hostname.replace('www.', ''); } catch(e){}
    return {
        scrapedName: `Produk Ekstra ${domain}`,
        scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        scrapedPrice: Math.floor(Math.random() * 500) + 10, 
        scrapedCurrency: 'USD'
    };
}

urlInput.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const data = simulateScrapeData(newUrl);

        if (!itemState.isManualName) { nameInput.value = data.scrapedName; }
        if (!itemState.isManualImage) {
            imageInput.value = data.scrapedImage;
            document.getElementById('imagePreview').src = data.scrapedImage;
            document.getElementById('imagePreview').style.display = 'block';
        }

        priceInput.value = data.scrapedPrice;
        currencySelect.value = data.scrapedCurrency;
        itemState.currentUrl = newUrl;
    }
});

function saveItem() {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    if(!name || !price) { alert("Nama dan Harga wajib diisi!"); return; }
    
    const finalImageUrl = itemState.customImageData || imageInput.value || 'https://via.placeholder.com/400';
    const wl = collections.find(c => c.id === activeCollectionId).wishlists.find(w => w.id === activeWishlistId);
    
    if (editingItemId) {
        const item = wl.items.find(i => i.id === editingItemId);
        item.name = name; item.url = urlInput.value; item.imageUrl = finalImageUrl;
        item.price = Number(price); item.currency = currencySelect.value;
    } else {
        wl.items.push({
            id: 'itm_' + Date.now(), name: name, url: urlInput.value,
            imageUrl: finalImageUrl, price: Number(price), currency: currencySelect.value
        });
    }
    
    saveData();
    closeModal('itemModal');
}

// --- AKUN & PROFIL LOGIC ---
function toggleProfileMenu() { document.getElementById('profileDropdown').classList.toggle('show'); }
window.onclick = function(event) { if (!event.target.closest('.sidebar-profile')) { document.getElementById('profileDropdown').classList.remove('show'); } }

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
    if (input.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{9,}$/.test(input)) { errorText.classList.add('active'); } 
    else { errorText.classList.remove('active'); }
}
function previewAccPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { document.getElementById('accPreviewPic').src = e.target.result; }
        reader.readAsDataURL(file);
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
    
    const fileInput = document.getElementById('accProfilePhoto');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            db[userIndex].profilePic = e.target.result;
            localStorage.setItem('wisher_users', JSON.stringify(db));
            document.getElementById('profile-avatar').src = e.target.result;
            alert("Account updated successfully.");
            closeModal('accountModal');
        }
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        localStorage.setItem('wisher_users', JSON.stringify(db));
        alert("Account updated successfully.");
        closeModal('accountModal');
    }
}
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}