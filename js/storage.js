const Storage = {
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getCurrentUser: () => localStorage.getItem('currentUser'),
    getLang: () => localStorage.getItem('wisher_lang') || 'en',
    setLang: (lang) => localStorage.setItem('wisher_lang', lang),
    
    getUsers: () => JSON.parse(localStorage.getItem('wisher_users')) || [],
    saveUsers: (db) => localStorage.setItem('wisher_users', JSON.stringify(db)),
    
    getCollections: () => JSON.parse(localStorage.getItem(`wisher_collections_${Storage.getCurrentUser()}`)) || [],
    saveCollections: (cols) => localStorage.setItem(`wisher_collections_${Storage.getCurrentUser()}`, JSON.stringify(cols)),
    
    logout: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // PERBAIKAN: Menggunakan aset shopping bag vector lokal yang aman dan bebas dari bug kutip (quotes leak)
    FALLBACK_IMAGE: 'assets/bag.png',

    // Penanganan Cerdas Simulasi Scraping Link Produk
    simulateScrapeData: (url) => {
        const lowerUrl = url.toLowerCase();
        let productName = "Produk Terpilih";
        let price = Math.floor(Math.random() * 500) + 10;
        let currency = 'USD';
        
        // Ekstraksi Logika Sederhana berdasarkan Kata Kunci
        if (lowerUrl.includes('tokopedia') || lowerUrl.includes('tokped')) {
            productName = "Produk Tokopedia"; price = Math.floor(Math.random() * 500000) + 50000; currency = 'IDR';
        } else if (lowerUrl.includes('shopee')) {
            productName = "Barang Shopee"; price = Math.floor(Math.random() * 500000) + 50000; currency = 'IDR';
        } else if (lowerUrl.includes('amazon')) {
            productName = "Amazon Item"; price = Math.floor(Math.random() * 200) + 10; currency = 'USD';
        } else if (lowerUrl.includes('apple')) {
            productName = "Apple Device"; price = Math.floor(Math.random() * 1000) + 500; currency = 'USD';
        } else if (lowerUrl.includes('ikea')) {
            productName = "Furniture IKEA"; price = Math.floor(Math.random() * 200) + 30; currency = 'USD';
        } else {
            try { 
                const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
                productName = `Produk dari ${domain.charAt(0).toUpperCase() + domain.slice(1)}`;
            } catch(e){}
        }

        return {
            scrapedName: productName,
            scrapedImage: "", // Tetap Kosong di Form agar Fallback diproses murni di background saveItem()
            scrapedPrice: price, 
            scrapedCurrency: currency
        };
    }
};