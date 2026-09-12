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

    // Fungsi Scraping Dinamis Data Link
    simulateScrapeData: (url) => {
        let domain = "Store";
        try { domain = new URL(url).hostname.replace('www.', ''); } catch(e){}
        return {
            scrapedName: `Produk Pilihan ${domain}`,
            scrapedImage: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80`,
            scrapedPrice: Math.floor(Math.random() * 500) + 10, 
            scrapedCurrency: 'USD'
        };
    }
};