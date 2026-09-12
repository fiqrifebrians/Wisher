const UI = {
    changeLang: (lang, dictionary) => {
        Storage.setLang(lang);
        document.querySelectorAll('.lang-select').forEach(el => el.value = lang);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dictionary[lang] && dictionary[lang][key]) { el.innerHTML = dictionary[lang][key]; }
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (dictionary[lang] && dictionary[lang][key]) { el.placeholder = dictionary[lang][key]; }
        });
    },

    openModal: (id) => document.getElementById(id).classList.add('active'),
    closeModal: (id) => document.getElementById(id).classList.remove('active'),
    toggleSidebar: () => document.getElementById('sidebar').classList.toggle('collapsed'),
    toggleProfileMenu: () => document.getElementById('profileDropdown').classList.toggle('show'),
    
    // Toggle Mobile Sidebar Logic
    toggleMobileSidebar: () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    },

    togglePasswordVisibility: (inputId) => {
        const input = document.getElementById(inputId);
        const slash = input.parentElement.querySelector('.slash');
        if (input.type === "password") { input.type = "text"; slash.style.display = "block"; } 
        else { input.type = "password"; slash.style.display = "none"; }
    },

    previewImage: (event, previewId, callback) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById(previewId).src = e.target.result;
                document.getElementById(previewId).style.display = 'block';
                if(callback) callback(e.target.result);
            }
            reader.readAsDataURL(file);
        }
    },

    loadProfileData: () => {
        const users = Storage.getUsers();
        const user = users.find(u => u.username === Storage.getCurrentUser());
        if (user && user.profilePic) {
            const avatar = document.getElementById('profile-avatar');
            const preview = document.getElementById('accPreviewPic');
            if(avatar) avatar.src = user.profilePic;
            if(preview) preview.src = user.profilePic;
        }
    }
};

window.onclick = function(event) {
    if (!event.target.closest('.sidebar-profile')) {
        const dropdown = document.getElementById('profileDropdown');
        if(dropdown) dropdown.classList.remove('show');
    }
}