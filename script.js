// Gunakan IIFE untuk mencegah global pollution
(() => {
    'use strict';
    
    // Konfigurasi Galeri
    const CONFIG = {
        photoPrefix: '',
        photoPath: 'wiwi/',
        photoExtension: '.webp',
        photoCount: 22,
        photoIndexNames: ['chwiwi', 'chwiwi (1)', 'chwiwi (2)', 'chwiwi (3)', 'chwiwi (4)', 
                          'chwiwi (5)', 'chwiwi (6)', 'chwiwi (7)', 'chwiwi (8)', 'chwiwi (9)', 
                          'chwiwi (10)', 'chwiwi (11)', 'chwiwi (12)', 'chwiwi (13)', 'chwiwi (14)', 
                          'chwiwi (15)', 'chwiwi (16)', 'chwiwi (17)', 'chwiwi (18)', 'chwiwi (19)', 
                          'chwiwi (20)', 'chwiwi (21)']
    };
    
    // Cache DOM
    const DOM = {
        body: document.body,
        navbar: document.querySelector('.navbar'),
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.querySelector('#themeToggle i'),
        navToggle: document.querySelector('.nav-toggle'),
        navLinks: document.querySelector('.nav-links'),
        galleryGrid: document.getElementById('galleryGrid'),
        modal: document.getElementById('imageModal'),
        modalImg: document.getElementById('modalImage'),
        closeModal: document.getElementById('closeModal'),
        musicToggle: document.getElementById('musicToggle'),
        bgMusic: document.getElementById('bgMusic')
    };
    
    // State
    const state = {
        isMusicPlaying: false,
        lastScrollY: 0,
        observer: null,
        loadedImages: 0,
        totalImages: CONFIG.photoIndexNames.length
    };
    
    // Initialization
    function init() {
        initTheme();
        initMusic();
        initNavbar();
        initGallery();
        initModal();
        initFlower();
        
        // Peningkatan performa
        window.addEventListener('load', () => {
            // Set intersection observer setelah page load untuk menghindari blocking
            initIntersectionObserver();
        });
    }
    
    // Theme functionality
    function initTheme() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            DOM.body.classList.add('light-mode');
            DOM.themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
        
        // Theme toggle
        DOM.themeToggle.addEventListener('click', () => {
            DOM.body.classList.toggle('light-mode');
            const isLight = DOM.body.classList.contains('light-mode');
            
            DOM.themeIcon.classList.replace(
                isLight ? 'fa-moon' : 'fa-sun',
                isLight ? 'fa-sun' : 'fa-moon'
            );
            
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
    
    // Music functionality
    function initMusic() {
        // Music toggle
        DOM.musicToggle.addEventListener('click', toggleMusic);
        
        // Touch support untuk perangkat mobile
        DOM.musicToggle.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Mencegah double-fire pada beberapa perangkat
            toggleMusic();
        });
        
        // Pastikan musik tidak auto-play saat buka pertama kali
        // karena kebijakan browser modern memerlukan interaksi user
        function tryPlayMusic() {
            DOM.bgMusic.volume = 0.6; // Volume 60%
            
            DOM.bgMusic.play()
                .then(() => {
                    state.isMusicPlaying = true;
                    DOM.musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    DOM.musicToggle.classList.add('playing');
                })
                .catch(error => {
                    console.warn("Autoplay dicegah, tunggu interaksi pengguna:", error);
                    DOM.musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    DOM.musicToggle.classList.remove('playing');
                    state.isMusicPlaying = false;
                });
        }
        
        // Function untuk toggle musik
        function toggleMusic() {
            if (state.isMusicPlaying) {
                DOM.bgMusic.pause();
                DOM.musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                DOM.musicToggle.classList.remove('playing');
            } else {
                DOM.bgMusic.play()
                    .then(() => {
                        DOM.musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                        DOM.musicToggle.classList.add('playing');
                    })
                    .catch(error => {
                        console.warn("Tidak dapat memainkan musik:", error);
                    });
            }
            state.isMusicPlaying = !state.isMusicPlaying;
        }
        
        // Coba mainkan musik saat user berinteraksi dengan halaman
        document.addEventListener('click', function musicStarter() {
            tryPlayMusic();
            // Hapus listener setelah digunakan
            document.removeEventListener('click', musicStarter);
        }, { once: true });
    }
    
    // Navbar functionality
    function initNavbar() {
        // Scroll effect dengan throttling untuk performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScrollNavbar();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Mobile menu toggle dengan event delegation
        DOM.navToggle.addEventListener('click', () => {
            DOM.navLinks.classList.toggle('active');
        });
        
        // Using event delegation for nav links
        DOM.navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                DOM.navLinks.classList.remove('active');
            }
        });
    }
    
    // Handle navbar scroll
    function handleScrollNavbar() {
        const currentScrollY = window.scrollY;
        
        // Tambahkan scrolled class saat scrolling
        DOM.navbar.classList.toggle('scrolled', currentScrollY > 50);
        
        // Hide/show navbar on scroll
        if (currentScrollY > state.lastScrollY && currentScrollY > 100) {
            DOM.navbar.style.transform = 'translateY(-100%)';
        } else {
            DOM.navbar.style.transform = 'translateY(0)';
        }
        
        // Posisikan musik control dengan mempertimbangkan scroll
        const musicControl = document.querySelector('.music-control');
        
        // Jika scroll banyak, pindahkan tombol musik jauh dari footer
        if (currentScrollY + window.innerHeight > document.body.scrollHeight - 100) {
            musicControl.style.bottom = '5rem';
        } else {
            musicControl.style.bottom = '';
        }
        
        state.lastScrollY = currentScrollY;
    }
    
    // Gallery initialization
    function initGallery() {
        const fragment = document.createDocumentFragment();
        
        CONFIG.photoIndexNames.forEach((photoName, index) => {
            const photoPath = `${CONFIG.photoPath}${photoName}${CONFIG.photoExtension}`;
            const galleryItem = createGalleryItem(photoPath, index);
            fragment.appendChild(galleryItem);
        });
        
        // Append all items at once (better performance)
        DOM.galleryGrid.appendChild(fragment);
    }
    
    // Create gallery item
    function createGalleryItem(photoPath, index) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.photoPath = photoPath;
        galleryItem.dataset.index = index;
        
        // Loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading...';
        galleryItem.appendChild(loadingIndicator);
        
        // Create image element but don't load it yet
        const img = document.createElement('img');
        img.className = 'gallery-img';
        img.loading = 'lazy'; // Native lazy loading
        img.decoding = 'async'; // Async decoding
        img.sizes = '(max-width: 768px) 100vw, 33vw'; // Responsive sizes
        
        // Generate WebP path
        const webpPath = photoPath.replace('.jpg', '.webp');
        
        // Create picture element for WebP support
        const picture = document.createElement('picture');
        
        // WebP source
        const sourceWebp = document.createElement('source');
        sourceWebp.type = 'image/webp';
        sourceWebp.srcset = `${webpPath} 1x`;
        picture.appendChild(sourceWebp);
        
        // Original image as fallback
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Placeholder
        img.dataset.src = photoPath;
        picture.appendChild(img);
        
        galleryItem.appendChild(picture);

        return galleryItem;
    }
    
    // Lazy loading with Intersection Observer
    function initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            state.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImage(entry.target);
                        state.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px 0px', // Preload images 100px before they enter viewport
                threshold: 0.1
            });
            
            // Observe all gallery items
            document.querySelectorAll('.gallery-item').forEach(item => {
                state.observer.observe(item);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            document.querySelectorAll('.gallery-item').forEach(item => {
                loadImage(item);
            });
        }
    }
    
    // Load image for gallery item
    function loadImage(galleryItem) {
        const picture = galleryItem.querySelector('picture');
        const img = picture.querySelector('img');
        const loadingIndicator = galleryItem.querySelector('.loading-indicator');
        const originalPath = img.dataset.src;

        // Generate paths untuk WebP dan JPG
        const webpPath = originalPath.replace(/\.(jpg|jpeg|png)$/, '.webp');
        const jpgPath = originalPath.replace(/\.(webp|png)$/, '.jpg');
        
        console.log(`Mencoba memuat gambar: ${webpPath}`); // Logging untuk debug
        
        // Fungsi untuk menangani loading error
        const handleError = () => {
            console.log(`Gagal memuat: ${img.src}`); // Logging untuk debug
            
            // Jika WebP gagal, coba load JPG
            if (img.src.endsWith('.webp')) {
                console.log(`Mencoba format JPG: ${jpgPath}`); // Logging untuk debug
                img.src = jpgPath;
                sourceWebp.srcset = ''; // Kosongkan WebP source
            } else {
                console.log('Mencoba path alternatif...'); // Logging untuk debug
                tryAlternativePaths(galleryItem, originalPath, loadingIndicator);
            }
        };

        // Fungsi untuk menangani loading success
        const handleLoad = () => {
            console.log(`Berhasil memuat: ${img.src}`); // Logging untuk debug
            loadingIndicator.style.display = 'none';
            img.style.opacity = '1';
            state.loadedImages++;
            
            // Tambahkan efek fade in
            requestAnimationFrame(() => {
                img.style.transition = 'opacity 0.3s ease-in';
                img.style.opacity = '1';
            });

            // Preload gambar berikutnya jika ada
            if (state.loadedImages < state.totalImages) {
                const nextItem = galleryItem.nextElementSibling;
                if (nextItem && !nextItem.querySelector('img').src) {
                    setTimeout(() => {
                        loadImage(nextItem);
                    }, 100);
                }
            }

            // Tambahkan event listener untuk modal setelah gambar berhasil dimuat
            galleryItem.addEventListener('click', () => {
                openModal(img.src);
            });
        };

        // Set event listeners
        img.onerror = handleError;
        img.onload = handleLoad;

        // Update source WebP
        const sourceWebp = picture.querySelector('source');
        sourceWebp.srcset = webpPath;
        
        // Mulai loading gambar dengan WebP
        img.src = webpPath;
    }
    
    // Try alternative paths for image
    function tryAlternativePaths(galleryItem, originalPath, loadingIndicator) {
        const photoName = originalPath.split('/').pop().split('.')[0];
        
        console.log(`Mencoba mencari path alternatif untuk: ${photoName}`); // Logging untuk debug
        
        const altPaths = [
            `wiwi/${photoName}.webp`,           // Path WebP langsung
            `wiwi/${photoName}.jpg`,            // Path JPG langsung
            originalPath.replace('wiwi/', ''),   // Tanpa folder
            './' + originalPath,                 // Dengan ./ di depan
            `./wiwi/${photoName}.webp`,         // Path WebP dengan ./
            `./wiwi/${photoName}.jpg`,          // Path JPG dengan ./
            photoName + '.webp',                // Hanya nama file WebP
            photoName + '.jpg'                  // Hanya nama file JPG
        ];
        
        console.log('Path alternatif yang akan dicoba:', altPaths); // Logging untuk debug
        
        let currentAltPathIndex = 0;
        
        function tryNextPath() {
            if (currentAltPathIndex >= altPaths.length) {
                console.log(`Semua path alternatif gagal untuk: ${photoName}`); // Logging untuk debug
                loadingIndicator.textContent = 'Tidak dapat memuat gambar';
                loadingIndicator.style.color = 'red';
                return;
            }
            
            const altPath = altPaths[currentAltPathIndex];
            console.log(`Mencoba path alternatif ke-${currentAltPathIndex + 1}: ${altPath}`); // Logging untuk debug
            currentAltPathIndex++;
            
            const altImg = new Image();
            
            altImg.onload = () => {
                console.log(`Berhasil memuat path alternatif: ${altPath}`); // Logging untuk debug
                loadingIndicator.style.display = 'none';
                
                const img = new Image();
                img.src = altPath;
                img.alt = `Gallery Image ${parseInt(galleryItem.dataset.index) + 1}`;
                img.className = 'gallery-img';
                galleryItem.appendChild(img);
                
                galleryItem.addEventListener('click', () => {
                    openModal(altPath);
                });
            };
            
            altImg.onerror = () => {
                console.log(`Gagal memuat path alternatif: ${altPath}`); // Logging untuk debug
                tryNextPath();
            };
            
            altImg.src = altPath;
        }
        
        tryNextPath();
    }
    
    // Modal functionality
    function initModal() {
        // Close modal on click X button
        DOM.closeModal.addEventListener('click', closeModal);
        
        // Close modal on click outside
        DOM.modal.addEventListener('click', (e) => {
            if (e.target === DOM.modal) {
                closeModal();
            }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.modal.style.display === 'block') {
                closeModal();
            }
        });
    }
    
    // Open modal
    function openModal(imageSrc) {
        DOM.modalImg.src = imageSrc;
        DOM.modal.style.display = 'block';
    }
    
    // Close modal
    function closeModal() {
        DOM.modal.style.display = 'none';
    }
    
    // Inisialisasi animasi bunga
    function initFlower() {
        const petals = document.querySelectorAll('.petal');
        petals.forEach((petal, index) => {
            const rotation = (index * 45); // 360 / 8 petals = 45 degrees each
            petal.style.setProperty('--rotation', `${rotation}deg`);
        });

        // Tambahkan efek hover pada bunga
        const flower = document.querySelector('.flower');
        flower.addEventListener('mouseover', () => {
            flower.style.animation = 'none';
            requestAnimationFrame(() => {
                flower.style.animation = 'flowerRotate 20s infinite linear';
            });
        });
    }
    
    // Start app when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();

// Tambahkan style untuk animasi
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes fall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 