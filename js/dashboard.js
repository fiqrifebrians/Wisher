// --- MODAL CONTROLS ---
const modal = document.getElementById('itemModal');
function openModal() {
    modal.classList.add('active');
    resetModalState();
}
function closeModal() {
    modal.classList.remove('active');
}

// --- STATE MANAGEMENT UNTUK LOGIKA INPUT ITEM (POIN 4) ---
let itemState = {
    isManualName: false,
    isManualImage: false,
    currentUrl: ""
};

// Referensi DOM Element Modal
const urlInput = document.getElementById('itemUrl');
const nameInput = document.getElementById('itemName');
const imageInput = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const priceInput = document.getElementById('itemPrice');
const currencySelect = document.getElementById('itemCurrency');

// Reset state saat modal baru dibuka
function resetModalState() {
    urlInput.value = '';
    nameInput.value = '';
    imageInput.value = '';
    priceInput.value = '';
    currencySelect.value = 'IDR';
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    
    itemState = {
        isManualName: false,
        isManualImage: false,
        currentUrl: ""
    };
}

// Deteksi input manual oleh pengguna
nameInput.addEventListener('input', () => {
    if (nameInput.value.trim() !== "") {
        itemState.isManualName = true;
    } else {
        itemState.isManualName = false;
    }
});

imageInput.addEventListener('input', () => {
    if (imageInput.value.trim() !== "") {
        itemState.isManualImage = true;
        imagePreview.src = imageInput.value;
        imagePreview.style.display = 'block';
    } else {
        itemState.isManualImage = false;
        imagePreview.style.display = 'none';
    }
});

// Simulasi Auto-Generate dari URL (Mock Scraping)
function simulateScrapeData(url) {
    let domain = "Situs Online";
    try {
        domain = new URL(url).hostname.replace('www.', '');
    } catch (e) {
        domain = "Toko Online";
    }

    return {
        scrapedName: `Produk Keren dari ${domain}`,
        scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
        scrapedPrice: Math.floor(Math.random() * 5000) + 100, 
        scrapedCurrency: 'USD'
    };
}

// LOGIKA SINKRONISASI MANUAL-KE-LINK
urlInput.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    
    if (newUrl && newUrl !== itemState.currentUrl && newUrl.startsWith('http')) {
        const data = simulateScrapeData(newUrl);

        if (!itemState.isManualName) {
            nameInput.value = data.scrapedName;
        }

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

// Simulasi fungsi Simpan Data
function saveItem() {
    if(!nameInput.value || !priceInput.value) {
        alert("Nama dan Harga wajib diisi!");
        return;
    }
    
    alert(`Item "${nameInput.value}" berhasil disimpan!
Cek konsol untuk data JSON.`);
    
    const finalData = {
        name: nameInput.value,
        url: urlInput.value,
        imageUrl: imageInput.value,
        price: priceInput.value,
        currency: currencySelect.value,
        category: document.getElementById('itemCategory').value,
        wasManuallyEdited: (itemState.isManualName || itemState.isManualImage)
    };
    
    console.log("Data Item Tersimpan:", finalData);
    closeModal();
}
