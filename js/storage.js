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

    // Aset Fallback Shopping Bag (JPG) sesuai instruksi
    FALLBACK_IMAGE: 'assets/shopping-bag.jpg',

    // Fungsi Pengambil Data Nyata via Link (Real Web Scraping via Open Graph Proxy)
    fetchScrapeData: async (url) => {
        const currentLang = Storage.getLang();

        try {
            // Menggunakan Proxy allorigins untuk membypass blokir CORS dari browser
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error('Network response error');
            const data = await response.json();
            const html = data.contents;

            // Memparsing dokumen HTML hasil unduhan
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 1. Ekstrak Nama/Judul Item
            let title = doc.querySelector('meta[property="og:title"]')?.content || 
                        doc.querySelector('title')?.innerText || '';

            // 2. Ekstrak Gambar Item (Open Graph atau Twitter Card)
            let image = doc.querySelector('meta[property="og:image"]')?.content || 
                        doc.querySelector('meta[name="twitter:image"]')?.content || 
                        doc.querySelector('img')?.src || '';

            // Perbaikan jika URL gambar yang tertangkap bersifat relatif
            if (image && image.startsWith('/')) {
                try {
                    const urlObj = new URL(url);
                    image = urlObj.origin + image;
                } catch(e) {}
            }

            // 3. Ekstrak Harga (Basic Heuristics & Regex Matching)
            let price = 0;
            let currency = 'IDR';
            
            const ogPrice = doc.querySelector('meta[property="product:price:amount"]')?.content;
            const ogCurrency = doc.querySelector('meta[property="product:price:currency"]')?.content;

            if (ogPrice) price = parseFloat(ogPrice);
            if (ogCurrency) currency = ogCurrency.toUpperCase();

            // Jika meta tidak ketemu, gunakan pencarian teks mendalam (Regex Scanner)
            if (!price) {
                const bodyText = doc.body.innerText || "";
                const rpMatch = bodyText.match(/Rp\s*([\d\.,]+)/i);
                if (rpMatch) {
                    price = parseFloat(rpMatch[1].replace(/\./g, '').replace(/,/g, ''));
                    currency = 'IDR';
                } else {
                    const usdMatch = bodyText.match(/\$\s*([\d\.,]+)/);
                    if (usdMatch) {
                        price = parseFloat(usdMatch[1].replace(/,/g, ''));
                        currency = 'USD';
                    }
                }
            }

            // Fallback Nama Cerdas dengan dukungan Multi-Bahasa
            let hostname = "";
            try { hostname = new URL(url).hostname; } catch(e){}
            let fallbackName = currentLang === 'id' ? `Produk dari ${hostname}` : `Product from ${hostname}`;

            return {
                scrapedName: title ? title.trim() : fallbackName,
                scrapedImage: image || "", // Kosongkan jika gagal agar fallback Shopping Bag terpakai
                scrapedPrice: price || 0,
                scrapedCurrency: currency
            };

        } catch (error) {
            console.error('Error fetching URL:', error);
            // Fallback object murni jika gagal proxy (Dukungan Multi-Bahasa)
            let domain = currentLang === 'id' ? "Situs Eksternal" : "External Site";
            try { domain = new URL(url).hostname.replace('www.', ''); } catch(e){}
            
            let fallbackErrorName = currentLang === 'id' ? `Produk Pilihan ${domain}` : `Selected Product ${domain}`;

            return {
                scrapedName: fallbackErrorName,
                scrapedImage: "",
                scrapedPrice: 0,
                scrapedCurrency: 'IDR'
            };
        }
    }
};