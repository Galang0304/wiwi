document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        if (body.classList.contains('light-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when scrolling
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    const galleryGrid = document.querySelector('.gallery-grid');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeButton = document.querySelector('.close-button');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    let isMusicPlaying = false;

    // Music Control
    function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        isMusicPlaying = !isMusicPlaying;
    }

    // Play music automatically when page loads
    function playMusic() {
        bgMusic.volume = 0.5; // Set volume to 50%
        bgMusic.play()
            .then(() => {
                isMusicPlaying = true;
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            })
            .catch(error => {
                console.log("Autoplay prevented:", error);
                // Jika autoplay diblokir, tampilkan pesan ke pengguna
                musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            });
    }

    // Event listener untuk tombol musik
    musicToggle.addEventListener('click', toggleMusic);

    // Coba mainkan musik saat halaman dimuat
    playMusic();

    // Array foto-foto
    const photos = [
        'wiwi/chwiwi.png',
        'wiwi/chwiwi (1).png',
        'wiwi/chwiwi (2).png',
        'wiwi/chwiwi (3).png',
        'wiwi/chwiwi (4).png',
        'wiwi/chwiwi (5).png',
        'wiwi/chwiwi (6).png',
        'wiwi/chwiwi (7).png',
        'wiwi/chwiwi (8).png',
        'wiwi/chwiwi (9).png',
        'wiwi/chwiwi (10).png',
        'wiwi/chwiwi (11).png',
        'wiwi/chwiwi (12).png',
        'wiwi/chwiwi (13).png',
        'wiwi/chwiwi (14).png',
        'wiwi/chwiwi (15).png',
        'wiwi/chwiwi (16).png',
        'wiwi/chwiwi (17).png',
        'wiwi/chwiwi (18).png',
        'wiwi/chwiwi (19).png',
        'wiwi/chwiwi (20).png',
        'wiwi/chwiwi (21).png',
        'wiwi/chwiwi (25).png'
    ];

    // Fungsi untuk membuat galeri
    function createGallery() {
        photos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = photo;
            img.alt = 'Gallery Image';
            img.loading = 'lazy';
            
            // Tambahkan loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.textContent = 'Loading...';
            galleryItem.appendChild(loadingIndicator);
            
            // Handle image load
            img.onload = () => {
                loadingIndicator.style.display = 'none';
                galleryItem.appendChild(img);
            };
            
            // Handle image error
            img.onerror = () => {
                loadingIndicator.textContent = 'Error loading image';
                loadingIndicator.style.color = 'red';
            };
            
            galleryGrid.appendChild(galleryItem);
            
            // Event listener untuk membuka modal
            galleryItem.addEventListener('click', () => {
                modal.style.display = 'block';
                modalImg.src = photo;
            });
        });
    }

    // Event listener untuk menutup modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Event listener untuk menutup modal saat mengklik di luar gambar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Event listener untuk menutup modal dengan tombol Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // Handle window resize untuk responsivitas
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reset grid layout
            galleryGrid.style.display = 'none';
            galleryGrid.offsetHeight; // Force reflow
            galleryGrid.style.display = 'grid';
        }, 250);
    });

    // Inisialisasi galeri
    createGallery();
});

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