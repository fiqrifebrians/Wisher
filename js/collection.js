if (!Storage.isLoggedIn()) { window.location.href = 'index.html'; }

const currentUser = Storage.getCurrentUser();
const urlParams = new URLSearchParams(window.location.search);
const collectionId = urlParams.get('id');

let collections = Storage.getCollections();
let currentCollection = collections.find(c => c.id === collectionId);

if (!currentCollection) {
    alert("Collection not found!");
    window.location.href = 'dashboard.html';
}

if (!currentCollection.items) currentCollection.items = [];
if (!currentCollection.categories) currentCollection.categories = [];

let activeCategoryId = null; 
let editingItemId = null;
let editingCategoryId = null;
let draggedColId = null; 

const i18nCol = {
    en: {
        my_collections: "My Collections", my_account: "My Account", sign_out: "Sign Out", back: "&larr; Back",
        add_item: "+ Add Item", add_category: "+ Add Category", category_name: "Category Name", save_category: "Save Category",
        online_link: "Online Link (URL)", item_name: "Item Name", select_category: "Select Category", uncategorized: "Uncategorized",
        image_source: "Image Source", from_devices: "From Devices", currency: "Currency",
        price: "Price", save_item: "Save Item", username: "Username", email: "Email",
        edit_password: "Edit Password", old_password: "Old Password", new_password: "New Password",
        confirm_new_password: "Confirm New Password", cancel: "Cancel", save_changes: "Save Changes",
        upload_device: "Upload from Devices", pass_criteria: "Password requires min 9 chars, 1 uppercase, 1 lowercase, 1 number.",
        item_info: "Paste a link to auto-generate, or fill manually.",
        empty_item: "Add Item", add_collection: "+ Add Collection", collection_name: "Collection Name", save_collection: "Save Collection"
    },
    id: {
        my_collections: "Koleksi Saya", my_account: "Akun Saya", sign_out: "Keluar", back: "&larr; Kembali",
        add_item: "+ Tambah Item", add_category: "+ Tambah Kategori", category_name: "Nama Kategori", save_category: "Simpan Kategori",
        online_link: "Tautan (URL)", item_name: "Nama Item", select_category: "Pilih Kategori", uncategorized: "Tanpa Kategori",
        image_source: "Sumber Gambar", from_devices: "Dari Perangkat", currency: "Mata Uang",
        price: "Harga", save_item: "Simpan Item", username: "Nama Pengguna", email: "Email",
        edit_password: "Ubah Kata Sandi", old_password: "Kata Sandi Lama", new_password: "Kata Sandi Baru",
        confirm_new_password: "Konfirmasi Kata Sandi Baru", cancel: "Batal", save_changes: "Simpan Perubahan",
        upload_device: "Unggah dari Perangkat", pass_criteria: "Minimal 9 karakter, 1 huruf besar, 1 huruf kecil, 1 angka.",
        item_info: "Masukkan tautan untuk otomatisasi, atau isi manual.",
        empty_item: "Tambah Item", add_collection: "+ Tambah Koleksi", collection_name: "Nama Koleksi", save_collection: "Simpan Koleksi"
    }
};

const ICON_EDIT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const ICON_DELETE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
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
    renderSidebarNav();
    renderCollection();
}

function saveData() {
    Storage.saveCollections(collections);
    renderSidebarNav();
    renderCollection();
}

function toggleProfileMenu() { UI.toggleProfileMenu(); }
function toggleSidebar() { UI.toggleSidebar(); }

// --- TWO-WAY DRAG AND DROP SINKRONISASI ---
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

function toggleCatDropdown(catId) {
    const ul = document.getElementById(`cat-items-${catId}`);
    if (ul) ul.classList.toggle('expanded');
}

// Navigasi Sidebar Penuh & Identik Dengan Dashboard
function renderSidebarNav() {
    const listContainer = document.getElementById('sidebar-collections');
    listContainer.innerHTML = '';
    
    const activeColId = typeof collectionId !== 'undefined' ? collectionId : null;

    collections.forEach(col => {
        const li = document.createElement('li');
        li.className = 'col-item-wrapper';
        li.setAttribute('draggable', 'true');
        li.ondragstart = (e) => handleDragStartCol(e, col.id);
        li.ondragover = handleDragOverCol;
        li.ondragleave = handleDragLeaveCol;
        li.ondrop = (e) => handleDropCol(e, col.id);
        li.ondragend = handleDragEndCol;
        
        const header = document.createElement('div');
        header.className = `col-header ${col.id === activeColId ? 'active' : ''}`;
        header.innerHTML = `
            <span class="hide-on-collapse" style="flex:1;" onclick="window.location.href='collection.html?id=${col.id}'">${col.name}</span>
            <span class="show-on-collapse" style="display:none;" onclick="window.location.href='collection.html?id=${col.id}'" title="${(col.name || '').replace(/"/g, '&quot;')}">${col.name.charAt(0)}</span>
            <div class="action-icons hide-on-collapse">
                <button class="icon-btn" onclick="toggleColDropdown('${col.id}')" title="Expand">${ICON_CHEVRON}</button>
                <button class="icon-btn" onclick="openCollectionModal('${col.id}')" title="Edit">${ICON_EDIT}</button>
                <button class="icon-btn delete" onclick="deleteCollectionSidebar('${col.id}')" title="Delete">${ICON_DELETE}</button>
            </div>
        `;
        li.appendChild(header);

        let hasContents = (col.items && col.items.length > 0) || (col.categories && col.categories.length > 0);
        if (hasContents) {
            const ulCol = document.createElement('ul');
            ulCol.id = `item-list-${col.id}`;
            ulCol.className = `wl-list hide-on-collapse ${col.id === activeColId ? 'expanded' : ''}`; 
            
            if (col.categories && col.categories.length > 0) {
                col.categories.forEach(cat => {
                    const catLi = document.createElement('li');
                    catLi.className = `wl-item`;
                    catLi.style.flexDirection = 'column';
                    catLi.style.alignItems = 'flex-start';
                    catLi.style.padding = '0';
                    catLi.style.marginBottom = '4px';

                    const catHeader = document.createElement('div');
                    catHeader.style.display = 'flex';
                    catHeader.style.justifyContent = 'space-between';
                    catHeader.style.alignItems = 'center';
                    catHeader.style.width = '100%';
                    catHeader.style.padding = '6px 12px';
                    catHeader.style.cursor = 'pointer';
                    catHeader.innerHTML = `
                        <span style="flex:1; font-weight:600; color:var(--primary-red);" onclick="toggleCatDropdown('${cat.id}')">${cat.name}</span>
                        <button class="icon-btn" onclick="toggleCatDropdown('${cat.id}')" title="Expand" style="padding:2px;">${ICON_CHEVRON}</button>
                    `;
                    catLi.appendChild(catHeader);

                    if (cat.items && cat.items.length > 0) {
                        const ulCat = document.createElement('ul');
                        ulCat.id = `cat-items-${cat.id}`;
                        ulCat.className = `wl-list`;
                        ulCat.style.paddingLeft = '16px';
                        ulCat.style.marginTop = '0';
                        
                        cat.items.forEach(item => {
                            const itemLi = document.createElement('li');
                            itemLi.className = `wl-item`;
                            itemLi.style.padding = '6px 12px';
                            // Tanda hubung '-' dihapus dari sini
                            itemLi.innerHTML = `<span style="flex:1; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(item.name || '').replace(/"/g, '&quot;')}">${item.name}</span>`;
                            ulCat.appendChild(itemLi);
                        });
                        catLi.appendChild(ulCat);
                    }
                    ulCol.appendChild(catLi);
                });
            }
            
            if (col.items && col.items.length > 0) {
                col.items.forEach(item => {
                    const itemLi = document.createElement('li');
                    itemLi.className = `wl-item`;
                    itemLi.style.padding = '6px 12px';
                    // Tanda hubung '-' dihapus dari sini
                    itemLi.innerHTML = `<span style="flex:1; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${(item.name || '').replace(/"/g, '&quot;')}">${item.name}</span>`;
                    ulCol.appendChild(itemLi);
                });
            }
            li.appendChild(ulCol);
        }

        listContainer.appendChild(li);
    });
}

function deleteCollectionSidebar(id) {
    if (confirm("Delete this Collection permanently?")) {
        collections = collections.filter(c => c.id !== id);
        saveData();
        if (typeof collectionId !== 'undefined' && id === collectionId) {
            window.location.href = 'dashboard.html';
        }
    }
}

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
        document.getElementById('collectionModalTitle').innerText = i18nCol[lang].add_collection;
    }
}

function saveCollection() {
    const name = document.getElementById('collectionName').value.trim();
    if(!name) return;
    
    if (editingCollectionId) {
        const col = collections.find(c => c.id === editingCollectionId);
        col.name = name;
        if (editingCollectionId === collectionId) {
            document.getElementById('current-collection-title').innerText = name;
            currentCollection.name = name;
        }
    } else {
        collections.push({ id: 'col_' + Date.now(), name: name, items: [], categories: [] });
    }
    saveData();
    UI.closeModal('collectionModal');
}

// --- LOGIKA CATEGORY ---
function openCategoryModal(id = null) {
    editingCategoryId = id;
    UI.openModal('categoryModal');
    const lang = Storage.getLang();
    
    if (id) {
        const cat = currentCollection.categories.find(c => c.id === id);
        document.getElementById('categoryName').value = cat.name;
        document.getElementById('categoryModalTitle').innerText = 'Edit Category';
    } else {
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryModalTitle').innerText = i18nCol[lang].add_category;
    }
}

function editCategory(e, id) { e.stopPropagation(); openCategoryModal(id); }

function saveCategory() {
    const name = document.getElementById('categoryName').value.trim();
    if(!name) return;
    
    if (editingCategoryId) {
        const cat = currentCollection.categories.find(c => c.id === editingCategoryId);
        cat.name = name;
    } else {
        currentCollection.categories.push({ id: 'cat_' + Date.now(), name: name, items: [] });
    }
    saveData();
    UI.closeModal('categoryModal');
}

function deleteCategory(e, id) {
    e.stopPropagation();
    if (confirm("Delete this Category and all its items permanently?")) {
        currentCollection.categories = currentCollection.categories.filter(c => c.id !== id);
        if (activeCategoryId === id) activeCategoryId = null;
        saveData();
    }
}

function enterCategory(id) {
    activeCategoryId = id;
    renderCollection();
}

function goToCollectionRoot() {
    activeCategoryId = null;
    renderCollection();
}


// --- LOGIKA FORM ITEM ---
let itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openItemModal(id = null) {
    editingItemId = id;
    const lang = Storage.getLang();
    
    const catSelect = document.getElementById('itemCategory');
    catSelect.innerHTML = `<option value="uncategorized">${i18nCol[lang].uncategorized}</option>`;
    currentCollection.categories.forEach(c => {
        catSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

    if (id) {
        let item = null;
        let itemCatId = 'uncategorized';
        
        const rootItem = currentCollection.items.find(i => i.id === id);
        if (rootItem) {
            item = rootItem;
        } else {
            for (let c of currentCollection.categories) {
                const catItem = c.items.find(i => i.id === id);
                if (catItem) { item = catItem; itemCatId = c.id; break; }
            }
        }
        
        catSelect.value = itemCatId;

        urlInput.value = item.url || '';
        nameInput.value = item.name;
        
        if (item.imageUrl && item.imageUrl.includes('<svg')) {
            imageInput.value = ''; itemState.customImageData = null;
        } else if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
            itemState.customImageData = item.imageUrl; imageInput.value = '';
        } else {
            imageInput.value = item.imageUrl || ''; itemState.customImageData = null;
        }
        
        priceInput.value = item.price;
        currencySelect.value = item.currency;
        
        let safePreviewUrl = item.imageUrl;
        if (!safePreviewUrl || safePreviewUrl.includes('<svg')) safePreviewUrl = Storage.FALLBACK_IMAGE;
        
        document.getElementById('imagePreview').src = safePreviewUrl;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('itemModalTitle').innerText = 'Edit Item';
        
        itemState.isManualName = true; itemState.isManualImage = true; itemState.currentUrl = item.url || "";
    } else {
        urlInput.value = ''; nameInput.value = ''; imageInput.value = ''; 
        document.getElementById('itemImageFile').value = '';
        priceInput.value = ''; document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('itemModalTitle').innerText = i18nCol[lang].add_item;
        catSelect.value = activeCategoryId ? activeCategoryId : 'uncategorized';
        itemState = { isManualName: false, isManualImage: false, currentUrl: "", customImageData: null };
    }
    UI.openModal('itemModal');
}

function editItem(e, id) { e.stopPropagation(); openItemModal(id); }

function deleteItem(e, id) {
    e.stopPropagation();
    if (confirm("Delete this item?")) {
        let deleted = false;
        const rootIdx = currentCollection.items.findIndex(i => i.id === id);
        if(rootIdx > -1) {
            currentCollection.items.splice(rootIdx, 1);
            deleted = true;
        } else {
            for(let c of currentCollection.categories) {
                const catIdx = c.items.findIndex(i => i.id === id);
                if(catIdx > -1) {
                    c.items.splice(catIdx, 1);
                    deleted = true; break;
                }
            }
        }
        if (deleted) saveData();
    }
}

nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => { 
    itemState.isManualImage = imageInput.value.trim() !== "";
    itemState.customImageData = null; document.getElementById('itemImageFile').value = ''; 
    const preview = document.getElementById('imagePreview');
    preview.src = imageInput.value; preview.style.display = itemState.isManualImage ? 'block' : 'none';
});

function previewItemImage(event) {
    UI.previewImage(event, 'imagePreview', (result) => {
        itemState.isManualImage = true;
        itemState.customImageData = result;
        imageInput.value = ''; 
    });
}

urlInput.addEventListener('change', async (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const originalNamePh = nameInput.placeholder;
        const currentLang = Storage.getLang();
        nameInput.placeholder = currentLang === 'id' ? "Mengambil data otomatis..." : "Fetching data automatically...";
        
        const data = await Storage.fetchScrapeData(newUrl);

        if (!itemState.isManualName && data.scrapedName) { nameInput.value = data.scrapedName; }
        if (!itemState.isManualImage && data.scrapedImage && data.scrapedImage !== "") {
            imageInput.value = data.scrapedImage;
            document.getElementById('imagePreview').src = data.scrapedImage;
            document.getElementById('imagePreview').style.display = 'block';
        }

        if(data.scrapedPrice > 0) { priceInput.value = data.scrapedPrice; }
        
        const opts = Array.from(currencySelect.options).map(o => o.value);
        if (opts.includes(data.scrapedCurrency)) { currencySelect.value = data.scrapedCurrency; }

        itemState.currentUrl = newUrl;
        nameInput.placeholder = originalNamePh;
    }
});

function saveItem() {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    const catId = document.getElementById('itemCategory').value;

    if(!name || !price) { alert("Nama dan Harga wajib diisi!"); return; }
    
    let finalImageUrl = itemState.customImageData || imageInput.value.trim();
    if (!finalImageUrl || finalImageUrl === "") { finalImageUrl = Storage.FALLBACK_IMAGE; }
    
    const newItemData = {
        id: editingItemId ? editingItemId : 'itm_' + Date.now(),
        name: name, url: urlInput.value, imageUrl: finalImageUrl,
        price: Number(price), currency: currencySelect.value
    };

    if (editingItemId) {
        let found = false;
        const rootIdx = currentCollection.items.findIndex(i => i.id === editingItemId);
        if(rootIdx > -1) { currentCollection.items.splice(rootIdx, 1); found = true; }
        else {
            for(let c of currentCollection.categories) {
                const catIdx = c.items.findIndex(i => i.id === editingItemId);
                if(catIdx > -1) { c.items.splice(catIdx, 1); found = true; break; }
            }
        }
        if (catId === 'uncategorized') currentCollection.items.push(newItemData);
        else {
            const targetCat = currentCollection.categories.find(c => c.id === catId);
            if(targetCat) targetCat.items.push(newItemData); else currentCollection.items.push(newItemData);
        }
    } else {
        if (catId === 'uncategorized') currentCollection.items.push(newItemData);
        else {
            const targetCat = currentCollection.categories.find(c => c.id === catId);
            if(targetCat) targetCat.items.push(newItemData);
        }
    }
    
    saveData();
    UI.closeModal('itemModal');
}

function renderItemsGridHtml(itemsArray) {
    if (!itemsArray || itemsArray.length === 0) return '';
    let html = `<div class="items-grid">`;
    itemsArray.forEach(item => {
        let currencySymbol = item.currency;
        if(item.currency==='USD'||item.currency==='AUD'||item.currency==='SGD') currencySymbol='$';
        if(item.currency==='GBP') currencySymbol='£';
        if(item.currency==='CNY'||item.currency==='JPY') currencySymbol='¥';
        if(item.currency==='IDR') currencySymbol='Rp';

        let safeImageUrl = item.imageUrl;
        if (!safeImageUrl || (safeImageUrl.includes('<svg') && safeImageUrl.includes('data:image'))) {
            safeImageUrl = Storage.FALLBACK_IMAGE;
        }

        const safeName = item.name ? item.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'Product';

        html += `
            <div class="item-card">
                <img class="item-img" src="${safeImageUrl}" alt="${safeName}">
                <div class="item-details">
                    <div style="flex-grow: 1;">
                        <h4>${item.name}</h4>
                        <p class="item-price">${currencySymbol} ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="item-footer-inline">
                        ${item.url ? `<a href="${item.url}" class="item-link" target="_blank">Link &rarr;</a>` : '<div></div>'}
                        <div class="card-actions-inline">
                            <button class="card-action-btn" onclick="editItem(event, '${item.id}')" title="Edit">${ICON_EDIT}</button>
                            <button class="card-action-btn delete-btn" onclick="deleteItem(event, '${item.id}')" title="Delete">${ICON_DELETE}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    return html;
}

function renderCollection() {
    const content = document.getElementById('board-content');
    const titleEl = document.getElementById('current-collection-title');
    const lang = Storage.getLang();
    
    if (activeCategoryId) {
        const cat = currentCollection.categories.find(c => c.id === activeCategoryId);
        titleEl.innerHTML = `<span class="breadcrumb-link" onclick="goToCollectionRoot()">${currentCollection.name}</span> <span style="color:var(--text-gray); margin:0 8px;">/</span> ${cat.name}`;
        
        if (cat.items.length === 0) {
            content.innerHTML = `<div class="empty-suggestion-50" onclick="openItemModal()">${i18nCol[lang].empty_item}</div>`;
        } else {
            content.innerHTML = renderItemsGridHtml(cat.items);
        }
        return;
    }

    titleEl.innerText = currentCollection.name;
    
    let html = '';
    const hasCategories = currentCollection.categories && currentCollection.categories.length > 0;
    const hasItems = currentCollection.items && currentCollection.items.length > 0;

    if (!hasCategories && !hasItems) {
        content.innerHTML = `<div class="empty-suggestion-50" onclick="openItemModal()">${i18nCol[lang].empty_item}</div>`;
        return;
    }

    if (hasCategories) {
        html += `<h3 style="margin-bottom: 16px; color: var(--text-dark); font-size: 18px;">Categories</h3>`;
        html += `<div class="collections-grid" style="margin-bottom: 40px;">`;
        currentCollection.categories.forEach(cat => {
            html += `
                <div class="collection-card" onclick="enterCategory('${cat.id}')">
                    <div class="card-footer-inline" style="margin-top: 0;">
                        <div class="card-text-info">
                            <h3>${cat.name}</h3>
                            <p>${cat.items.length} Items</p>
                        </div>
                        <div class="card-actions-inline" onclick="event.stopPropagation()">
                            <button class="card-action-btn" onclick="editCategory(event, '${cat.id}')" title="Edit">${ICON_EDIT}</button>
                            <button class="card-action-btn delete-btn" onclick="deleteCategory(event, '${cat.id}')" title="Delete">${ICON_DELETE}</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (hasItems) {
        html += `<h3 style="margin-bottom: 16px; color: var(--text-dark); font-size: 18px;">Uncategorized Items</h3>`;
        html += renderItemsGridHtml(currentCollection.items);
    }

    content.innerHTML = html;
}

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