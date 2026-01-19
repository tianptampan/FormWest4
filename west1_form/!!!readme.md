Project Structure

west1_form/
│
├── css/
│   └── style.css            # (Semua styling, warna gradient, & responsivitas HP)
│
├── js/
│   ├── api_endpoint.js      # [PENTING] Pusat konfigurasi URL API (Master & Submit)
│   ├── data_loader.js       # [OTAK 1] Menarik data dari Google Sheet saat loading
│   └── main_logic.js        # [OTAK 2] Mengurus Form, Validasi, Role, & Kirim Data
│
└── index.html               # (Kerangka Utama + Loading Screen Overlay)


Arsitektur Apps : 
1. DB dropdown ambil dari master data (config_master_data -> api_endpoint.js -> data_loader.js)
2. load ke form ( data_loader.js -> main_logic.js)
3. save/submit data push to gsheet (index.html -> get element by id -> main_logic.js -> api_endpoint.js -> gsheet) 


config master data :
https://docs.google.com/spreadsheets/d/1gy9HOIVjMDAnGb3QPSYT-3QC4ENJ-ijG_wiZtRThWRk/edit?gid=1924292119#gid=1924292119

test_db :
https://docs.google.com/spreadsheets/d/1gXnDHFv5DwPHVCSWTps248tSNXBuIp0eOXQaLZaAwsk/edit?gid=0#gid=0

// URL untuk TARIK Master Data 
window.MASTER_DATA_URL = 'https://script.google.com/macros/s/AKfycbzHr4HXA4WgfbEevyUnOE_F8FJeqpmN2_P5q6D3SIR7gP0hffk-XR7dgI-TLB0ml9QU/exec';


// URL PRODUCTION (Sheet Asli)
// const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyzOTeT07xF8BvN19ecXnVs0ozZEcbV7sp-lW9oSYUBVGo8eZhwxQ5u_U1qfkwt7SFOIQ/exec';

// URL UNTUK TESTING .
// Storage Data Output Testing
window.GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1pWX9TBkQAsD4STiAaak54Y2_HG7rWpIc0SkqM_HKXNuopE4ekhg_c6vM0kEWM5zY/exec';
