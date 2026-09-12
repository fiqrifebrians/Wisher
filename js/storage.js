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

    // Gambar Fallback Generik Shopping Bag Minimalis
    FALLBACK_IMAGE: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',

    // Simulasi Scraping Cerdas Berdasarkan Keyword Domain
    simulateScrapeData: (url) => {
        const lowerUrl = url.toLowerCase();
        let productName = "Produk Pilihan";
        let price = Math.floor(Math.random() * 500) + 10;
        let currency = 'USD';
        
        if (lowerUrl.includes('tokopedia') || lowerUrl.includes('tokped')) {
            productName = "Produk Tokopedia"; price = Math.floor(Math.random() * 500000) + 50000; currency = 'IDR';
        } else if (lowerUrl.includes('shopee')) {
            productName = "Barang Shopee"; price = Math.floor(Math.random() * 500000) + 50000; currency = 'IDR';
        } else if (lowerUrl.includes('amazon')) {
            productName = "Amazon Item"; price = Math.floor(Math.random() * 200) + 10; currency = 'USD';
        } else if (lowerUrl.includes('apple')) {
            productName = "Apple Device"; price = Math.floor(Math.random() * 1000) + 500; currency = 'USD';
        } else {
            try { 
                const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
                productName = `Produk dari ${domain.charAt(0).toUpperCase() + domain.slice(1)}`;
            } catch(e){}
        }

        return {
            scrapedName: productName,
            scrapedImage: Storage.FALLBACK_IMAGE, // Gunakan fallback generik sebagai default auto-generate
            scrapedPrice: price, 
            scrapedCurrency: currency
        };
    }
};