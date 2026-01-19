window.APP_DATA = {};

async function initializeAppData() {
    try {
        const response = await fetch('./js/master_data.json');
        window.APP_DATA = await response.json();
        console.log("Master Data Loaded Successfully");
        
        // Trigger penambahan entri pertama setelah data siap
        if (typeof addEntry === "function") addEntry(); 
    } catch (error) {
        console.error("Gagal memuat master_data.json:", error);
    }
}

// Jalankan inisialisasi
document.addEventListener('DOMContentLoaded', initializeAppData);