// =========================================================================
// DATA LOADER MODULE
// Bertugas menarik data mentah dari Google Sheet Master via API
// =========================================================================

// Inisialisasi variabel global untuk menampung data
window.APP_DATA = null;

async function loadMasterData() {
    console.log("🔄 Memulai proses download Master Data...");
    
    // 1. Ambil elemen Loading Screen dari HTML
    const loader = document.getElementById('master-loader');
    const loaderText = document.getElementById('loader-text');
    
    // Cek apakah URL sudah diset di api_endpoint.js
    if (!window.MASTER_DATA_URL) {
        console.error("CRITICAL: window.MASTER_DATA_URL belum didefinisikan di api_endpoint.js");
        if (loaderText) loaderText.innerText = "Error: URL Config Hilang! Cek api_endpoint.js";
        alert("Konfigurasi Error: URL Master Data hilang!");
        return;
    }

    try {
        const response = await fetch(window.MASTER_DATA_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        
        // Validasi struktur data (Pastikan kunci-kunci penting ada)
        if (!jsonData.LOCATION_DATA || !jsonData.SALES_DATA) {
            throw new Error("Format Data JSON tidak sesuai harapan.");
        }

        // Simpan ke Global Variable agar bisa dibaca main_logic.js
        window.APP_DATA = jsonData;
        
        console.log("✅ Master Data Berhasil Dimuat:", window.APP_DATA);
        
        // --- LOGIC MENGHILANGKAN LOADING SCREEN ---
        if (loader) {
            // Beri sedikit delay (800ms) agar user sempat lihat animasi (UX)
            setTimeout(() => {
                loader.classList.add('opacity-0'); // Efek fade out (Tailwind)
                
                // Tunggu transisi selesai (500ms) baru hilangkan elemen
                setTimeout(() => {
                    loader.style.display = 'none'; 
                }, 500); 
            }, 800); 
        }

        // (Opsional) Kirim event custom untuk memberitahu bahwa data siap
        document.dispatchEvent(new Event('masterDataReady'));

    } catch (error) {
        console.error("❌ Gagal memuat Master Data:", error);
        
        // Ubah teks loading menjadi pesan error merah
        if (loaderText) {
            loaderText.innerText = "Gagal memuat data! Cek koneksi internet lalu Refresh.";
            loaderText.classList.add('text-red-600', 'font-bold');
        }
        
        alert("Gagal memuat Database Sales & Harga. Cek koneksi internet Anda.");
    }
}

// Eksekusi langsung saat file ini dimuat
loadMasterData();