// Initial Check
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Data State
let wishlists = JSON.parse(localStorage.getItem('wisher_data')) || [];
let currentWishlistId = wishlists.length > 0 ? wishlists[0].id : null;

// --- MODAL CONTROLS ---
const modal = document.getElementById('itemModal');
let itemState = { isManualName: false, isManualImage: false, currentUrl: "" };

const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

function openModal() {
    modal.classList.add('active');
    resetModalState();
}
function closeModal() {
    modal.classList.remove('active');
}
function resetModalState() {
    urlInput.value = ''; nameInput.value = ''; imageInput.value = '';
    priceInput.value = ''; currencySelect.value = 'IDR';
    imagePreview.style.display = 'none'; imagePreview.src = '';
    itemState = { isManualName: false, isManualImage: false, currentUrl: "" };
}

nameInput.addEventListener('input', () => { itemState.isManualName = nameInput.value.trim() !== ""; });
imageInput.addEventListener('input', () => {
    itemState.isManualImage = imageInput.value.trim() !== "";
    if(itemState.isManualImage) { imagePreview.src = imageInput.value; imagePreview.style.display = 'block'; }
    else { imagePreview.style.display = 'none'; }
});

function simulateScrapeData(url) {
    let domain = "Online Site";
    try { domain = new URL(url).hostname.replace('www.', ''); } catch (e) {}
    return {
        scrapedName: `Awesome Product from ${domain}`,
        scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        scrapedPrice: Math.floor(Math.random() * 5000) + 100, 
        scrapedCurrency: 'USD'
    };
}

urlInput.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const data = simulateScrapeData(newUrl);
        if (!itemState.isManualName) nameInput.value = data.scrapedName;
        if (!itemState.isManualImage) {
            imageInput.value = data.scrapedImage;
            imagePreview.src = data.scrapedImage;
            imagePreview.style.display = 'block';
        }
        priceInput.value = data.scrapedPrice;
        currencySelect.value = data.scrapedCurrency;
        itemState.currentUrl = newUrl;
    }
});

function saveItem() {
    if(!nameInput.value || !priceInput.value) {
        alert("Name and Price are required!");
        return;
    }
    alert(`Item "${nameInput.value}" saved successfully!`);
    closeModal();
    // Re-render would go here
}

// --- DASHBOARD RENDERING ---
function renderDashboard() {
    const menu = document.getElementById('wishlist-menu');
    const content = document.getElementById('board-content');
    const actions = document.getElementById('board-actions-container');
    const title = document.getElementById('current-list-title');

    menu.innerHTML = '';
    
    if (wishlists.length === 0) {
        title.innerText = "Welcome to Wisher";
        actions.style.display = "none";
        // Empty State Box (50% fill/opacity look)
        content.innerHTML = `<div class="empty-suggestion" onclick="createNewWishlist()">+ Add New Wishlist</div>`;
        return;
    }

    // Render Sidebar Menu
    wishlists.forEach(list => {
        const li = document.createElement('li');
        li.innerText = list.name;
        if(list.id === currentWishlistId) li.classList.add('active');
        li.onclick = () => { currentWishlistId = list.id; renderDashboard(); };
        menu.appendChild(li);
    });

    const currentList = wishlists.find(l => l.id === currentWishlistId);
    title.innerText = currentList.name;
    actions.style.display = "flex";
    content.innerHTML = '';

    // Render Categories & Items
    if (!currentList.categories || currentList.categories.length === 0) {
        content.innerHTML = `<p style="color:var(--text-gray); padding-top: 20px;">No items yet. Add a category or an item to begin.</p>`;
    } else {
        currentList.categories.forEach(cat => {
            let catHtml = `<div class="category-section"><h3 class="category-title">${cat.name} <span>(Category)</span></h3><div class="items-grid">`;
            cat.items.forEach(item => {
                catHtml += `
                    <div class="item-card">
                        <div class="item-img" style="background-image: url('${item.imageUrl}');"></div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="item-price">${item.currency} ${item.price.toLocaleString()}</p>
                            ${item.url ? `<a href="${item.url}" class="item-link" target="_blank">View Product &rarr;</a>` : ''}
                        </div>
                    </div>`;
            });
            catHtml += `</div></div>`;
            content.innerHTML += catHtml;
        });
    }
}

function createNewWishlist() {
    const name = prompt("Enter Wishlist Name:");
    if (name) {
        const newList = { id: Date.now(), name: name, categories: [] };
        wishlists.push(newList);
        currentWishlistId = newList.id;
        localStorage.setItem('wisher_data', JSON.stringify(wishlists));
        renderDashboard();
    }
}

function addCategory() {
    alert("Category addition UI will open here.");
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Initialize
window.onload = renderDashboard;