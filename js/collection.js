if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const currentUser = localStorage.getItem('currentUser');
const urlParams = new URLSearchParams(window.location.search);
const collectionId = urlParams.get('id');

let collections = JSON.parse(localStorage.getItem(`wisher_collections_${currentUser}`)) || [];
let currentCollection = collections.find(c => c.id === collectionId);
let editingItemId = null; // Menyimpan ID item jika dalam mode Edit

if (!currentCollection) {
    alert("Collection not found!");
    window.location.href = 'dashboard.html';
}
if (!currentCollection.items) {
    currentCollection.items = []; // Safety check
}

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    document.getElementById('current-collection-title').innerText = currentCollection.name;
    loadProfileData();
    renderCollection();
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
    renderCollection();
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Profile Dropdown (SINKRON DENGAN DASHBOARD)
function toggleProfileMenu() { document.getElementById('profileDropdown').classList.toggle('show'); }
window.onclick = function(event) {
    if (!event.target.closest('.sidebar-profile')) {
        document.getElementById('profileDropdown').classList.remove('show');
    }
}

// --- LOGIKA FORM ITEM (CRUD & SYNC LINK) ---
let itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openItemModal(id = null) {
    editingItemId = id;
    document.getElementById('itemModal').classList.add('active');
    
    if (id) {
        // Mode Edit
        const item = currentCollection.items.find(i => i.id === id);
        urlInput.value = item.url || '';
        nameInput.value = item.name;
        
        // Memeriksa apakah gambar dari File Base64 atau URL
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
        
        // Mengunci perubahan agar tidak ter-override sembarangan saat link berubah
        itemState.isManualName = true;
        itemState.isManualImage = true;
        itemState.currentUrl = item.url || "";
        
    } else {
        // Mode Tambah Baru
        urlInput.value = ''; nameInput.value = ''; imageInput.value = ''; 
        document.getElementById('itemImageFile').value = '';
        priceInput.value = ''; document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('itemModalTitle').innerText = 'Add Item';
        itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };
    }
}

function editItem(e, id) {
    e.stopPropagation();
    openItemModal(id);
}

// Interupsi Aktivitas Manual Gambar & Nama
nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => { 
    itemState.isManualImage = imageInput.value.trim() !== "";
    itemState.customImageData = null; // Menghapus memori file upload jika user kembali pakai URL
    document.getElementById('itemImageFile').value = ''; 
    document.getElementById('imagePreview').src = imageInput.value;
    document.getElementById('imagePreview').style.display = itemState.isManualImage ? 'block' : 'none';
});

// Preview Gambar dari Upload Perangkat (File Base64)
function previewItemImage(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            itemState.isManualImage = true;
            itemState.customImageData = e.target.result;
            imageInput.value = ''; // Clear input url
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Simulasi Auto-Generate
function simulateScrapeData(url) {
    let domain = "Store";
    try { domain = new URL(url).hostname.replace('www.', ''); } catch(e){}
    return {
        scrapedName: `Koleksi Produk ${domain}`,
        scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        scrapedPrice: Math.floor(Math.random() * 500) + 10, 
        scrapedCurrency: 'USD'
    };
}

// EKSEKUSI KONDISIONAL SINKRONISASI MANUAL-KE-LINK
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

        // Aturan Sinkronisasi: Harga selalu terupdate mengikuti Data Link
        priceInput.value = data.scrapedPrice;
        currencySelect.value = data.scrapedCurrency;
        itemState.currentUrl = newUrl;
    }
});

function saveItem() {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    if(!name || !price) { alert("Nama dan Harga wajib diisi!"); return; }
    
    // Prioritas custom file, lalu url input, lalu default fallback
    const finalImageUrl = itemState.customImageData || imageInput.value || 'https://via.placeholder.com/400';
    
    if (editingItemId) {
        const item = currentCollection.items.find(i => i.id === editingItemId);
        item.name = name;
        item.url = urlInput.value;
        item.imageUrl = finalImageUrl;
        item.price = Number(price);
        item.currency = currencySelect.value;
    } else {
        currentCollection.items.push({
            id: 'itm_' + Date.now(),
            name: name,
            url: urlInput.value,
            imageUrl: finalImageUrl,
            price: Number(price),
            currency: currencySelect.value
        });
    }
    
    saveData();
    closeModal('itemModal');
}

// Render Data Item pada UI Koleksi
function renderCollection() {
    const content = document.getElementById('board-content');
    
    // VISUAL KONDISIONAL STATE KOSONG 50% OPACITY
    if (currentCollection.items.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openItemModal()">Add Item</div>`;
        return;
    }

    let html = `<div class="items-grid">`;
    currentCollection.items.forEach(item => {
        let currencySymbol = item.currency;
        if(item.currency==='USD'||item.currency==='AUD'||item.currency==='SGD') currencySymbol='$';
        if(item.currency==='GBP') currencySymbol='£';
        if(item.currency==='CNY'||item.currency==='JPY') currencySymbol='¥';
        if(item.currency==='IDR') currencySymbol='Rp';

        html += `
            <div class="item-card">
                <button class="edit-icon-btn" onclick="editItem(event, '${item.id}')">✏️</button>
                <div class="item-img" style="background-image: url('${item.imageUrl}');"></div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${currencySymbol} ${item.price.toLocaleString()}</p>
                    ${item.url ? `<a href="${item.url}" class="item-link" target="_blank">Lihat Tautan &rarr;</a>` : ''}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    content.innerHTML = html;
}

// --- AKUN & PROFIL LOGIC SINKRON DENGAN DASHBOARD ---
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