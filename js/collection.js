if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

const currentUser = localStorage.getItem('currentUser');
const urlParams = new URLSearchParams(window.location.search);
const collectionId = urlParams.get('id');

let collections = JSON.parse(localStorage.getItem(`wisher_collections_${currentUser}`)) || [];
let currentCollection = collections.find(c => c.id === collectionId);

if (!currentCollection) {
    alert("Collection not found!");
    window.location.href = 'dashboard.html';
}

window.onload = () => {
    document.getElementById('display-username').innerText = currentUser;
    document.getElementById('current-collection-title').innerText = currentCollection.name;
    renderCollection();
};

function saveData() {
    localStorage.setItem(`wisher_collections_${currentUser}`, JSON.stringify(collections));
    renderCollection();
}

function openWishlistModal() {
    document.getElementById('wishlistModal').classList.add('active');
    document.getElementById('wishlistName').value = '';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function saveWishlist() {
    const name = document.getElementById('wishlistName').value.trim();
    if(!name) { alert("Name required!"); return; }
    
    currentCollection.wishlists.push({
        id: 'wl_' + Date.now(),
        name: name,
        items: []
    });
    saveData();
    closeModal('wishlistModal');
}

// --- LOGIKA INPUT ITEM & SINKRONISASI MANUAL-KE-LINK ---
let itemState = { isManualName: false, isManualImage: false, currentUrl: "" };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openItemModal() {
    if (currentCollection.wishlists.length === 0) {
        alert("Harap buat Wishlist terlebih dahulu sebelum menambahkan item.");
        openWishlistModal();
        return;
    }
    document.getElementById('itemModal').classList.add('active');
    
    // Reset Form & State
    urlInput.value = ''; nameInput.value = ''; imageInput.value = ''; 
    priceInput.value = ''; document.getElementById('imagePreview').style.display = 'none';
    itemState = { isManualName: false, isManualImage: false, currentUrl: "" };
    
    // Populate Dropdown Wishlist
    const wlSelect = document.getElementById('itemWishlist');
    wlSelect.innerHTML = '';
    currentCollection.wishlists.forEach(wl => {
        wlSelect.innerHTML += `<option value="${wl.id}">${wl.name}</option>`;
    });
}

// Deteksi aktivitas manual oleh pengguna
nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => { 
    itemState.isManualImage = imageInput.value.trim() !== ""; 
    document.getElementById('imagePreview').src = imageInput.value;
    document.getElementById('imagePreview').style.display = itemState.isManualImage ? 'block' : 'none';
});

// Simulasi Scraping API
function simulateScrapeData(url) {
    let domain = "Online Shop";
    try { domain = new URL(url).hostname.replace('www.', ''); } catch(e){}
    return {
        scrapedName: `Produk Menarik dari ${domain}`,
        scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        scrapedPrice: Math.floor(Math.random() * 900000) + 50000, 
        scrapedCurrency: 'IDR'
    };
}

// EKSEKUSI KONDISIONAL LINK
urlInput.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const data = simulateScrapeData(newUrl);

        // Jika input NAMA masih kosong/belum pernah diketik manual, isi secara auto.
        // Jika sudah diinput manual, NAMA TIDAK BOLEH BERUBAH.
        if (!itemState.isManualName) {
            nameInput.value = data.scrapedName;
        }

        // Jika input GAMBAR masih kosong/belum diisi manual, isi secara auto.
        // Jika sudah diinput manual, GAMBAR TIDAK BOLEH BERUBAH.
        if (!itemState.isManualImage) {
            imageInput.value = data.scrapedImage;
            document.getElementById('imagePreview').src = data.scrapedImage;
            document.getElementById('imagePreview').style.display = 'block';
        }

        // HARGA HARUS OTOMATIS TER-UPDATE SELALU mengikuti data link (Sync Price Override)
        priceInput.value = data.scrapedPrice;
        currencySelect.value = data.scrapedCurrency;

        itemState.currentUrl = newUrl;
    }
});

function saveItem() {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    const wlId = document.getElementById('itemWishlist').value;
    
    if(!name || !price) { alert("Nama dan Harga wajib diisi!"); return; }
    
    const newItem = {
        id: 'itm_' + Date.now(),
        name: name,
        url: urlInput.value,
        imageUrl: imageInput.value || 'https://via.placeholder.com/400',
        price: Number(price),
        currency: currencySelect.value
    };
    
    const targetWishlist = currentCollection.wishlists.find(w => w.id === wlId);
    targetWishlist.items.push(newItem);
    
    saveData();
    closeModal('itemModal');
}

// Render Data Wishlists dan Item
function renderCollection() {
    const content = document.getElementById('board-content');
    
    // VISUAL KONDISIONAL STATE KOSONG 50% OPACITY PADA WISHLIST
    if (currentCollection.wishlists.length === 0) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openWishlistModal()">Add Wishlist</div>`;
        return;
    }

    let html = '';
    currentCollection.wishlists.forEach(wl => {
        html += `
            <div class="category-section">
                <h3 class="collection-title">${wl.name}</h3>
                <div class="items-grid">
        `;
        
        if(wl.items.length === 0) {
            html += `<p style="color:var(--text-gray); font-size: 14px;">Empty items.</p>`;
        }

        wl.items.forEach(item => {
            html += `
                <div class="item-card">
                    <div class="item-img" style="background-image: url('${item.imageUrl}');"></div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">${item.currency} ${item.price.toLocaleString()}</p>
                        ${item.url ? `<a href="${item.url}" class="item-link" target="_blank">Lihat Link &rarr;</a>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    });
    content.innerHTML = html;
}