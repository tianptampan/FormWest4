// =========================================================================
// VARIABEL GLOBAL LOGIC
// (URL API sekarang diambil dari js/api_config.js)
// =========================================================================

let entryCounter = 0;
let currentRole = 'AC';

// =========================================================================
// 1. FUNGSI UTILITY (HELPER)
// =========================================================================

function toProperCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function populateDropdown(selectElement, options, placeholder, disabledValue = "") {
    selectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = disabledValue;
    defaultOption.textContent = placeholder;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectElement.appendChild(defaultOption);

    if (Array.isArray(options)) {
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            selectElement.appendChild(option);
        });
    }
}

function getUniqueOptions(key, filterKey = null, filterValue = null) {
    if (!window.APP_DATA || !window.APP_DATA.LOCATION_DATA) return [];
    
    const filteredData = filterKey && filterValue
        ? window.APP_DATA.LOCATION_DATA.filter(item => item[filterKey] === filterValue)
        : window.APP_DATA.LOCATION_DATA;
    
    const options = new Set(filteredData.map(item => item[key]));
    return Array.from(options).sort();
}

// Fungsi Pengecekan Khusus Bengkulu
function isBengkulu(entryId) {
    const region = document.getElementById(`region-${entryId}`).value;
    const province = document.getElementById(`province-${entryId}`).value;
    const branch = document.getElementById(`branch-${entryId}`).value;
    return region === "RO 16 Jambi" && province === "Bengkulu" && branch === "Branch Bengkulu Jembatan Kecil";
}

// =========================================================================
// 2. LOGIKA UTAMA (ROLE, REVENUE, DROPDOWN)
// =========================================================================

function selectRole(entryId, role) {
    currentRole = role;
    const headerTitle = document.querySelector('header h1');
    const root = document.documentElement;

    // Update buttons visual
    const entries = document.querySelectorAll('.data-entry-card');
    entries.forEach(entry => {
        const id = entry.getAttribute('data-id');
        const acBtn = document.getElementById(`ac-btn-${id}`);
        const aeBtn = document.getElementById(`ae-btn-${id}`);
        const storeBtn = document.getElementById(`store-btn-${id}`);

        if (acBtn && aeBtn && storeBtn) {
            acBtn.className = 'px-3 py-1 rounded-lg font-bold transition duration-300 text-gray-600';
            aeBtn.className = 'px-3 py-1 rounded-lg font-bold transition duration-300 text-gray-600';
            storeBtn.className = 'px-3 py-1 rounded-lg font-bold transition duration-300 text-gray-600';

            if (role === 'AC') {
                acBtn.classList.remove('text-gray-600');
                acBtn.classList.add('bg-gradient-to-r', 'from-orange-300', 'to-orange-500', 'text-white');
            } else if (role === 'AE') {
                aeBtn.classList.remove('text-gray-600');
                aeBtn.classList.add('bg-gradient-to-r', 'from-blue-300', 'to-blue-500', 'text-white');
            } else if (role === 'Store') {
                storeBtn.classList.remove('text-gray-600');
                storeBtn.classList.add('bg-gradient-to-r', 'from-pink-300', 'to-pink-500', 'text-white');
            }
        }
        updateLocationDropdowns(id, 'branch');
    });

    // Update Header & Gradient
    if (role === 'AC') {
        headerTitle.textContent = 'AREA COORDINATOR PROSPECT';
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #ffdab9 0%, #ffa500 100%)');
    } else if (role === 'AE') {
        headerTitle.textContent = 'ACCOUNT EXECUTIVE PROSPECT';
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #add8e6 0%, #87ceeb 100%)');
    } else if (role === 'Store') {
        headerTitle.textContent = 'STORE BUNDLING';
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%)');
    }

    // Refresh fields
    entries.forEach(entry => {
        const id = entry.getAttribute('data-id');
        updateAdditionalFields(id);
    });
    updateMonthlyFeeForRole();
    updateSaveButtonStatus();
}

function updateMonthlyFeeForRole() {
    const entries = document.querySelectorAll('.data-entry-card');
    entries.forEach(entry => {
        const entryId = entry.getAttribute('data-id');
        const monthlyFeeInput = document.getElementById(`monthlyFee-${entryId}`);
        if(monthlyFeeInput) {
            if (currentRole === 'AE') {
                monthlyFeeInput.disabled = true;
                monthlyFeeInput.value = '';
            } else {
                monthlyFeeInput.disabled = false;
            }
        }
    });
}

function updateAdditionalFields(entryId) {
    const additionalFields = document.getElementById(`additional-fields-${entryId}`);
    const statusSelect = document.getElementById(`status-${entryId}`);
    const selectedStatus = statusSelect ? statusSelect.value : "";
    const bengkulu = isBengkulu(entryId);
    
    // Safety check if data not loaded
    if (!window.APP_DATA) return;

    if (currentRole === 'AE') {
        let html = `
            <div class="form-group">
                <label for="segmentation-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Segmentation</label>
                <select id="segmentation-${entryId}" class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
            </div>`;

        if (selectedStatus === 'Deal') {
            html = `
                <div class="form-group">
                    <label for="service-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select id="service-${entryId}" class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>` + html;

            setTimeout(() => {
                const serviceOptions = bengkulu ? window.APP_DATA.BENGKULU_SERVICE_OPTIONS : window.APP_DATA.SERVICE_OPTIONS;
                populateDropdown(document.getElementById(`service-${entryId}`), serviceOptions, "Pilih Service...", "");
                initializeSelect2(entryId);
                $(`#service-${entryId}`).on('select2:select', () => updateRevenue(entryId));
            }, 0);
        }

        additionalFields.innerHTML = html;
        setTimeout(() => {
            populateDropdown(document.getElementById(`segmentation-${entryId}`), window.APP_DATA.SEGMENTATION_OPTIONS, "Pilih Segmentation...", "");
        }, 0);

        // Visibility Toggle for AE
        toggleFieldGroups(entryId, true);
        document.getElementById(`sales-store-label-${entryId}`).textContent = 'Sales';
        document.getElementById(`prospect-billing-label-${entryId}`).textContent = 'Prospect Name';

    } else if (currentRole === 'Store') {
        let html = `
            <div class="form-group">
                <label for="billingId-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Billing ID <span class="text-red-500">*</span></label>
                <input type="text" id="billingId-${entryId}" required maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '');" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="10 digit angka">
            </div>
            <div class="form-group">
                <label for="service-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Service <span class="text-red-500">*</span></label>
                <select id="service-${entryId}" required class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
            </div>
            <div class="form-group">
                <label for="bundling-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Bundling <span class="text-red-500">*</span></label>
                <select id="bundling-${entryId}" required class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
            </div>
            <div class="form-group">
                <label for="revenue-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                <input type="text" id="revenue-${entryId}" readonly class="w-full border-gray-300 rounded-lg p-3 bg-gray-100 touch-target">
            </div>`;

        additionalFields.innerHTML = html;

        setTimeout(() => {
            const serviceKeys = bengkulu ? Object.keys(window.APP_DATA.BENGKULU_PRODUCT_PRICES) : Object.keys(window.APP_DATA.PRODUCT_PRICES);
            populateDropdown(document.getElementById(`service-${entryId}`), serviceKeys, "Pilih Service...", "");
            populateDropdown(document.getElementById(`bundling-${entryId}`), window.APP_DATA.BUNDLING_OPTIONS, "Pilih Bundling...", "");

            document.getElementById(`service-${entryId}`).addEventListener('change', () => calculateRevenue(entryId));
            document.getElementById(`bundling-${entryId}`).addEventListener('change', () => calculateRevenue(entryId));
            
            // Listeners for save button
            document.getElementById(`billingId-${entryId}`).addEventListener('input', updateSaveButtonStatus);
            document.getElementById(`service-${entryId}`).addEventListener('change', updateSaveButtonStatus);
            document.getElementById(`bundling-${entryId}`).addEventListener('change', updateSaveButtonStatus);
        }, 0);

        // Hide unused groups for Store
        toggleFieldGroups(entryId, false);
        document.getElementById(`sales-store-label-${entryId}`).textContent = 'Sales';

    } else {
        // AC Role
        additionalFields.innerHTML = '';
        toggleFieldGroups(entryId, true);
        document.getElementById(`sales-store-label-${entryId}`).textContent = 'Sales';
        document.getElementById(`prospect-billing-label-${entryId}`).textContent = 'Prospect Name';
    }
}

function toggleFieldGroups(entryId, show) {
    const displayStyle = show ? 'block' : 'none';
    const fields = ['phone', 'address', 'subdistric', 'isp', 'monthly-fee', 'source', 'status', 'prospect-billing'];
    
    fields.forEach(field => {
        const group = document.getElementById(`${field}-group-${entryId}`);
        if (group) {
            group.style.display = displayStyle;
            const input = group.querySelector('input, select');
            if (input && field !== 'monthly-fee') input.required = show;
        }
    });
}

function calculateRevenue(entryId) {
    const serviceSelect = document.getElementById(`service-${entryId}`);
    const bundlingSelect = document.getElementById(`bundling-${entryId}`);
    const revenueInput = document.getElementById(`revenue-${entryId}`);

    if (!serviceSelect || !bundlingSelect) return;

    const selectedService = serviceSelect.value;
    const selectedBundling = bundlingSelect.value;
    const bengkulu = isBengkulu(entryId);
    const prices = bengkulu ? window.APP_DATA.BENGKULU_PRODUCT_PRICES : window.APP_DATA.PRODUCT_PRICES;

    if (selectedService && selectedBundling && prices) {
        const price = prices[selectedService];
        const [first, second] = selectedBundling.split('+').map(Number);
        let revenue;
        if (selectedService.includes('Rent')) {
            revenue = price * first + 50000 * second;
        } else {
            revenue = price * first;
        }
        revenueInput.value = revenue.toString();
    } else {
        revenueInput.value = '';
    }
}

function updateRevenue(entryId) {
    const serviceSelect = document.getElementById(`service-${entryId}`);
    const selectedService = serviceSelect.value;
    const serviceFormGroup = serviceSelect.closest('.form-group');

    // Clean up previous dynamic fields
    const existingBundling = document.getElementById(`bundling-${entryId}`);
    if (existingBundling) existingBundling.closest('.form-group').remove();
    const existingRevenue = document.getElementById(`revenue-${entryId}`);
    if (existingRevenue) existingRevenue.closest('.form-group').remove();

    if (selectedService) {
        if (currentRole === 'AE' && selectedService.startsWith('Biznet Metronet')) {
            const bundlingHtml = `
                <div class="form-group">
                    <label for="bundling-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Bundling</label>
                    <select id="bundling-${entryId}" class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>`;
            serviceFormGroup.insertAdjacentHTML('afterend', bundlingHtml);
            
            const bundlingSelect = document.getElementById(`bundling-${entryId}`);
            populateDropdown(bundlingSelect, window.APP_DATA.AE_BUNDLING_OPTIONS, "Pilih Bundling...", "");
            bundlingSelect.addEventListener('change', () => calculateRevenueAE(entryId));

            const revenueHtml = `
                <div class="form-group">
                    <label for="revenue-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                    <input type="text" id="revenue-${entryId}" readonly class="w-full border-gray-300 rounded-lg p-3 bg-gray-100 touch-target">
                </div>`;
            bundlingSelect.closest('.form-group').insertAdjacentHTML('afterend', revenueHtml);
        } else {
            const revenueHtml = `
                <div class="form-group">
                    <label for="revenue-${entryId}" class="block text-sm font-medium text-gray-700 mb-2">Revenue</label>
                    <input type="text" id="revenue-${entryId}" class="w-full border-gray-300 rounded-lg p-3 touch-target" oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                </div>`;
            serviceFormGroup.insertAdjacentHTML('afterend', revenueHtml);

            const revenueInput = document.getElementById(`revenue-${entryId}`);
            const bengkulu = isBengkulu(entryId);
            const revenueMap = bengkulu ? window.APP_DATA.BENGKULU_REVENUE_MAP : window.APP_DATA.REVENUE_MAP;

            if (selectedService.startsWith('Biznet Dedicated') || selectedService.includes('EtherPort')) {
                revenueInput.value = '';
                revenueInput.readOnly = false;
                revenueInput.placeholder = 'Masukkan Revenue';
            } else {
                revenueInput.value = revenueMap[selectedService] || '';
                revenueInput.readOnly = true;
            }
        }
    }
}

function calculateRevenueAE(entryId) {
    const serviceSelect = document.getElementById(`service-${entryId}`);
    const bundlingSelect = document.getElementById(`bundling-${entryId}`);
    const revenueInput = document.getElementById(`revenue-${entryId}`);

    const selectedService = serviceSelect.value;
    const selectedBundling = bundlingSelect.value;
    const bengkulu = isBengkulu(entryId);
    const revenueMap = bengkulu ? window.APP_DATA.BENGKULU_REVENUE_MAP : window.APP_DATA.REVENUE_MAP;

    if (selectedService && selectedBundling) {
        const baseRevenue = parseInt(revenueMap[selectedService].replace(/,/g, '')) || 0;
        if (selectedBundling === "Without Promo") {
            revenueInput.value = baseRevenue.toString();
        } else {
            const [first, second] = selectedBundling.split('+').map(Number);
            let revenue = selectedService.includes('Rent') ? (baseRevenue * first + 50000 * second) : (baseRevenue * first);
            revenueInput.value = revenue.toString();
        }
    } else {
        revenueInput.value = '';
    }
}

function initializeSelect2(entryId) {
    $(`#service-${entryId}`).select2({
        placeholder: "Pilih Service...",
        allowClear: true
    });
}

function updateLocationDropdowns(entryId, changedDropdownId) {
    if (!window.APP_DATA) return;

    const regionSelect = document.getElementById(`region-${entryId}`);
    const provinceSelect = document.getElementById(`province-${entryId}`);
    const citySelect = document.getElementById(`city-${entryId}`);
    const branchSelect = document.getElementById(`branch-${entryId}`);
    const salesSelect = document.getElementById(`sales-${entryId}`);
    
    const selectedRegion = regionSelect.value;
    const selectedProvince = provinceSelect.value;
    const selectedCity = citySelect.value;
    const selectedBranch = branchSelect.value;

    if (changedDropdownId === 'region') {
        if (selectedRegion) {
            const provinces = getUniqueOptions('province', 'region', selectedRegion);
            populateDropdown(provinceSelect, provinces, "Pilih Provinsi...", "");
            provinceSelect.disabled = false;
        } else {
            populateDropdown(provinceSelect, [], "Pilih Provinsi...", "");
            provinceSelect.disabled = true;
        }
        populateDropdown(citySelect, [], "Pilih Kota/Kabupaten...", ""); citySelect.disabled = true;
        populateDropdown(branchSelect, [], "Pilih Branch...", ""); branchSelect.disabled = true;
        populateDropdown(salesSelect, [], "Pilih Sales...", ""); salesSelect.disabled = true;
    }

    if (changedDropdownId === 'region' || changedDropdownId === 'province') {
        if (selectedProvince && selectedRegion) {
            const cities = getUniqueOptions('city', 'province', selectedProvince)
                            .filter(city => window.APP_DATA.LOCATION_DATA.some(item => 
                                item.region === selectedRegion && item.province === selectedProvince && item.city === city
                            ));
            populateDropdown(citySelect, cities, "Pilih Kota/Kabupaten...", "");
            citySelect.disabled = false;
        } else if (changedDropdownId === 'province') {
            populateDropdown(citySelect, [], "Pilih Kota/Kabupaten...", "");
            citySelect.disabled = true;
        }
        if (changedDropdownId === 'province') {
            populateDropdown(branchSelect, [], "Pilih Branch...", ""); branchSelect.disabled = true;
            populateDropdown(salesSelect, [], "Pilih Sales...", ""); salesSelect.disabled = true;
        }
    }
    
    if (changedDropdownId === 'city' || changedDropdownId === 'province' || changedDropdownId === 'region') {
        if (selectedCity && selectedProvince && selectedRegion) {
            const branches = window.APP_DATA.LOCATION_DATA
                .filter(item => item.region === selectedRegion && item.province === selectedProvince && item.city === selectedCity)
                .map(item => item.branch);
            populateDropdown(branchSelect, [...new Set(branches)].sort(), "Pilih Branch...", "");
            branchSelect.disabled = false;
        } else if (changedDropdownId === 'city') {
            populateDropdown(branchSelect, [], "Pilih Branch...", "");
            branchSelect.disabled = true;
        }
        if (changedDropdownId === 'city') {
            populateDropdown(salesSelect, [], "Pilih Sales...", ""); salesSelect.disabled = true;
        }
    }

    if (changedDropdownId === 'branch' || changedDropdownId === 'city' || changedDropdownId === 'province' || changedDropdownId === 'region') {
        if (selectedBranch) {
            const salesData = currentRole === 'Store' ? window.APP_DATA.STORE_SALES_DATA : window.APP_DATA.SALES_DATA;
            const sales = salesData[selectedBranch] || [];
            populateDropdown(salesSelect, sales.sort(), "Pilih Sales...", "");
            salesSelect.disabled = false;
        } else {
            populateDropdown(salesSelect, [], "Pilih Sales...", "");
            salesSelect.disabled = true;
        }
    }
    
    updateSaveButtonStatus();
}

// =========================================================================
// 3. RENDER FORM & EVENT LISTENERS
// =========================================================================

function createDataEntryTemplate(id) {
    return `
        <div class="data-entry-card p-4 sm:p-8 relative" id="entry-${id}" data-id="${id}">
            <div class="flex justify-between items-center mb-4 sm:mb-6 border-b pb-3">
                <h3 class="text-lg sm:text-xl font-bold text-gray-800">Prospect</h3>
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <button type="button" id="ac-btn-${id}" class="px-3 py-1 rounded-lg font-bold transition duration-300" onclick="selectRole(${id}, 'AC')">AC</button>
                        <button type="button" id="ae-btn-${id}" class="px-3 py-1 rounded-lg font-bold transition duration-300" onclick="selectRole(${id}, 'AE')">AE</button>
                        <button type="button" id="store-btn-${id}" class="px-3 py-1 rounded-lg font-bold transition duration-300" onclick="selectRole(${id}, 'Store')">STORE</button>
                    </div>
                    ${id > 0 ? `<button type="button" onclick="deleteEntry(${id})" class="py-2 px-3 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-300 touch-target">Hapus</button>` : ''}
                </div>
            </div>

            <div class="space-y-4 sm:space-y-6">
                <div class="form-group">
                    <label for="date-${id}" class="block text-sm font-medium text-gray-700 mb-2">Tanggal Input <span class="text-red-500">*</span></label>
                    <input type="date" id="date-${id}" required class="w-full border-gray-300 rounded-lg p-3 touch-target">
                </div>
                
                <div class="form-group">
                    <label for="region-${id}" class="block text-sm font-medium text-gray-700 mb-2">Region <span class="text-red-500">*</span></label>
                    <select id="region-${id}" required data-id="${id}" data-type="region" class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>
                
                <div class="form-group">
                    <label for="province-${id}" class="block text-sm font-medium text-gray-700 mb-2">Province <span class="text-red-500">*</span></label>
                    <select id="province-${id}" required data-id="${id}" data-type="province" disabled class="w-full border-gray-300 rounded-lg p-3 bg-gray-50 disabled:opacity-75 touch-target">
                        <option value="" disabled selected>Pilih Provinsi...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="city-${id}" class="block text-sm font-medium text-gray-700 mb-2">City/Regency <span class="text-red-500">*</span></label>
                    <select id="city-${id}" required data-id="${id}" data-type="city" disabled class="w-full border-gray-300 rounded-lg p-3 bg-gray-50 disabled:opacity-75 touch-target">
                        <option value="" disabled selected>Pilih Kota/Kabupaten...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="branch-${id}" class="block text-sm font-medium text-gray-700 mb-2">Branch <span class="text-red-500">*</span></label>
                    <select id="branch-${id}" required data-id="${id}" data-type="branch" disabled class="w-full border-gray-300 rounded-lg p-3 bg-gray-50 disabled:opacity-75 touch-target">
                        <option value="" disabled selected>Pilih Branch...</option>
                    </select>
                </div>
                
                <div class="form-group" id="sales-store-group-${id}">
                    <label for="sales-${id}" class="block text-sm font-medium text-gray-700 mb-2" id="sales-store-label-${id}">Sales <span class="text-red-500">*</span></label>
                    <select id="sales-${id}" required data-id="${id}" data-type="sales" disabled class="w-full border-gray-300 rounded-lg p-3 bg-gray-50 disabled:opacity-75 touch-target">
                        <option value="" disabled selected>Pilih Sales...</option>
                    </select>
                </div>

                <div class="form-group" id="prospect-billing-group-${id}">
                    <label for="prospectName-${id}" class="block text-sm font-medium text-gray-700 mb-2" id="prospect-billing-label-${id}">Prospect Name <span class="text-red-500">*</span></label>
                    <input type="text" id="prospectName-${id}" required minlength="4" oninput="this.value = toProperCase(this.value.replace(/[^a-zA-Z0-9 ]/g, ''));" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="Contoh: Piscesco Budiarta">
                </div>

                <div class="form-group" id="phone-group-${id}">
                    <label for="phone-${id}" class="block text-sm font-medium text-gray-700 mb-2">Phone <span class="text-red-500">*</span></label>
                    <input type="tel" id="phone-${id}" required minlength="4" oninput="this.value = this.value.replace(/[^0-9]/g, '');" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="Contoh: 081234567890">
                </div>

                <div class="form-group" id="address-group-${id}">
                    <label for="address-${id}" class="block text-sm font-medium text-gray-700 mb-2">Address <span class="text-red-500">*</span></label>
                    <input type="text" id="address-${id}" required minlength="4" oninput="this.value = toProperCase(this.value);" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="Contoh: Jl. Sukabangun 2 No. 123">
                </div>

                <div class="form-group" id="subdistric-group-${id}">
                    <label for="subdistric-${id}" class="block text-sm font-medium text-gray-700 mb-2">Subdistric (Kelurahan) <span class="text-red-500">*</span></label>
                    <input type="text" id="subdistric-${id}" required minlength="4" oninput="this.value = toProperCase(this.value);" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="isi kelurahan">
                </div>

                <div class="form-group" id="isp-group-${id}">
                    <label for="ispExisting-${id}" class="block text-sm font-medium text-gray-700 mb-2">ISP Existing <span class="text-red-500">*</span></label>
                    <select id="ispExisting-${id}" required class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>

                <div class="form-group" id="monthly-fee-group-${id}">
                    <label for="monthlyFee-${id}" class="block text-sm font-medium text-gray-700 mb-2">Monthly Fee Existing (opsional) </label>
                    <input type="number" id="monthlyFee-${id}" class="w-full border-gray-300 rounded-lg p-3 touch-target" placeholder="Contoh: 250000">
                </div>

                <div class="form-group" id="source-group-${id}">
                    <label for="source-${id}" class="block text-sm font-medium text-gray-700 mb-2">Source <span class="text-red-500">*</span></label>
                    <select id="source-${id}" required class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>

                <div class="form-group" id="status-group-${id}">
                    <label for="status-${id}" class="block text-sm font-medium text-gray-700 mb-2">Status <span class="text-red-500">*</span></label>
                    <select id="status-${id}" required class="w-full border-gray-300 rounded-lg p-3 touch-target"></select>
                </div>

                <div id="additional-fields-${id}"></div>
            </div>
        </div>
    `;
}

// Fungsi utama menambahkan entry (sudah dimodifikasi menunggu data)
window.addEntry = function() {
    if (!window.APP_DATA || !window.APP_DATA.LOCATION_DATA) {
        console.warn("Menunggu APP_DATA sebelum menambah entry...");
        setTimeout(window.addEntry, 500); // Retry jika data belum siap
        return;
    }

    const container = document.getElementById('dataEntriesContainer');
    const newId = entryCounter++;
    container.insertAdjacentHTML('beforeend', createDataEntryTemplate(newId));

    const newEntry = document.getElementById(`entry-${newId}`);
    
    // Inisialisasi dropdown dengan data JSON
    populateDropdown(newEntry.querySelector(`#region-${newId}`), getUniqueOptions('region'), "Pilih Region...", "");
    populateDropdown(newEntry.querySelector(`#ispExisting-${newId}`), window.APP_DATA.ISP_EXISTING, "Pilih ISP Existing...", "");
    populateDropdown(newEntry.querySelector(`#source-${newId}`), window.APP_DATA.SOURCE_OPTIONS, "Pilih Sumber Data..", "");
    populateDropdown(newEntry.querySelector(`#status-${newId}`), window.APP_DATA.STATUS_OPTIONS, "Pilih Status..", "");

    // Set tanggal default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById(`date-${newId}`).value = today;

    // Logic Copy Data dari Entry sebelumnya
    if (entryCounter > 1) {
        const lastId = entryCounter - 2;
        const lastElement = document.getElementById(`entry-${lastId}`);
        if (lastElement) { // Cek jika element belum dihapus
            document.getElementById(`date-${newId}`).value = document.getElementById(`date-${lastId}`).value;
            
            const regionSelect = newEntry.querySelector(`#region-${newId}`);
            regionSelect.value = document.getElementById(`region-${lastId}`).value;
            updateLocationDropdowns(newId, 'region');

            const provinceSelect = newEntry.querySelector(`#province-${newId}`);
            provinceSelect.value = document.getElementById(`province-${lastId}`).value;
            updateLocationDropdowns(newId, 'province');

            const citySelect = newEntry.querySelector(`#city-${newId}`);
            citySelect.value = document.getElementById(`city-${lastId}`).value;
            updateLocationDropdowns(newId, 'city');

            const branchSelect = newEntry.querySelector(`#branch-${newId}`);
            branchSelect.value = document.getElementById(`branch-${lastId}`).value;
            updateLocationDropdowns(newId, 'branch');
            
            // Set Sales
            const salesSelect = newEntry.querySelector(`#sales-${newId}`);
            salesSelect.value = document.getElementById(`sales-${lastId}`).value;
        }
    }

    // Event Listeners Registration
    ['region', 'province', 'city', 'branch'].forEach(type => {
        newEntry.querySelector(`#${type}-${newId}`).addEventListener('change', () => updateLocationDropdowns(newId, type));
    });

    const requiredFields = newEntry.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener(field.tagName === 'INPUT' ? 'input' : 'change', updateSaveButtonStatus);
    });

    newEntry.querySelector(`#status-${newId}`).addEventListener('change', () => updateAdditionalFields(newId));
    newEntry.querySelector(`#branch-${newId}`).addEventListener('change', () => updateAdditionalFields(newId));

    // Initial state check
    selectRole(newId, currentRole);
    newEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteEntry = function(id) {
    showConfirmModal(id);
}

function updateSaveButtonStatus() {
    const entries = document.querySelectorAll('.data-entry-card');
    const saveButton = document.getElementById('saveButton');
    const saveText = document.getElementById('saveText');

    if (entries.length === 0) {
        saveText.textContent = 'SIMPAN SEMUA DATA (0 Entri)';
        saveButton.disabled = true;
        return;
    }

    let allValid = true;
    entries.forEach(entry => {
        const entryId = entry.getAttribute('data-id');
        if (currentRole === 'Store') {
             const requiredIds = [`date`, `region`, `province`, `city`, `branch`, `sales`, `billingId`, `service`, `bundling`];
             requiredIds.forEach(key => {
                 const field = document.getElementById(`${key}-${entryId}`);
                 if (field && (!field.value || !field.checkValidity())) allValid = false;
             });
        } else {
            const requiredInputs = entry.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!input.checkValidity()) allValid = false;
            });
            const statusSelect = document.getElementById(`status-${entryId}`);
            if (!statusSelect || !statusSelect.value) allValid = false;
        }
    });

    //saveText.textContent = `Save`;
    saveText.textContent = `SIMPAN SEMUA DATA (${entries.length} Entri)`;
    saveButton.disabled = !allValid;
}

// =========================================================================
// 4. SUBMIT & MODAL
// =========================================================================

const messageModal = document.getElementById('messageModal');
const confirmModal = document.getElementById('confirmModal');
let entryIdToDelete = null;

function showMessageModal(title, message, isSuccess = true) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modalTitle.classList.toggle('text-green-600', isSuccess);
    modalTitle.classList.toggle('text-red-600', !isSuccess);
    messageModal.classList.remove('hidden');
}

function showConfirmModal(id) {
    entryIdToDelete = id;
    confirmModal.classList.remove('hidden');
}

// Modal Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeModalButton').addEventListener('click', () => messageModal.classList.add('hidden'));
    document.getElementById('cancelDeleteButton').addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        entryIdToDelete = null;
    });
    document.getElementById('confirmDeleteButton').addEventListener('click', () => {
        if (entryIdToDelete !== null) {
            const el = document.getElementById(`entry-${entryIdToDelete}`);
            if (el) el.remove();
            if (document.querySelectorAll('.data-entry-card').length === 0) {
                entryCounter = 0;
                addEntry();
            }
            updateSaveButtonStatus();
        }
        confirmModal.classList.add('hidden');
        entryIdToDelete = null;
    });
    
    document.getElementById('addButton').addEventListener('click', window.addEntry);
    window.addEntry();
});

function collectAllData() {
    const data = [];
    document.querySelectorAll('.data-entry-card').forEach(entry => {
        const id = entry.getAttribute('data-id');
        // --- LOGIC TIMESTAMP CUSTOM (Format: YYYY/MM/DD H:MM:SS PM) ---
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan 0-11, jadi +1
        const day = String(now.getDate()).padStart(2, '0');
        
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Jam 0 (tengah malam) menjadi 12
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Gabungkan menjadi string: "2025/07/01 1:15:11 PM"
        const timestampClean = `${year}/${month}/${day} ${hours}:${minutes}:${seconds} ${ampm}`;

        data.push({
            Timestamp: timestampClean, // <-- Hasil format manual di atas
            Role: currentRole,
            Date: document.getElementById(`date-${id}`).value,
            Region: document.getElementById(`region-${id}`).value,
            Province: document.getElementById(`province-${id}`).value,
            CityRegency: document.getElementById(`city-${id}`).value,
            Branch: document.getElementById(`branch-${id}`).value,
            Sales: document.getElementById(`sales-${id}`).value,
            billingID: document.getElementById(`billingId-${id}`)?.value || '',
            ProspectName: document.getElementById(`prospectName-${id}`)?.value || '',
            Phone: document.getElementById(`phone-${id}`)?.value || '',
            Address: document.getElementById(`address-${id}`)?.value || '',
            Subdistric: document.getElementById(`subdistric-${id}`)?.value || '',
            IspExisting: document.getElementById(`ispExisting-${id}`)?.value || '',
            MonthlyFee: document.getElementById(`monthlyFee-${id}`)?.value || '',
            Source: document.getElementById(`source-${id}`)?.value || '',
            Status: document.getElementById(`status-${id}`)?.value || '',
            Segmentation: document.getElementById(`segmentation-${id}`)?.value || '',
            Service: document.getElementById(`service-${id}`)?.value || '',
            Bundling: document.getElementById(`bundling-${id}`)?.value || '',
            Revenue: document.getElementById(`revenue-${id}`)?.value || ''
        });
    });
    return data;
}

document.getElementById('mainForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveButton = document.getElementById('saveButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const saveText = document.getElementById('saveText');

    saveButton.disabled = true;
    saveText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    const allData = collectAllData();

    // --- PERBAIKAN: Ambil URL secara eksplisit dari window ---
    const targetUrl = window.GOOGLE_SHEET_WEB_APP_URL;

    // CEK SAFETY: Apakah URL berhasil diambil?
    if (!targetUrl) {
        alert("CRITICAL ERROR: File api_config.js belum dimuat atau URL kosong!");
        console.error("Cek index.html, pastikan api_config.js dipanggil SEBELUM main_logic.js");
        throw new Error("Config URL not found");
    }

    try {
        // Gunakan 'targetUrl' di sini, BUKAN variabel lama
        await fetch(targetUrl, { 
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: allData }),
        });

        let modalTitle = "Input Sukses!";
        let modalMessage = `${allData.length} Data Tersimpan.`;

        if (currentRole === 'Store' && allData.length > 0) {
            const salesName = allData[0].Sales;
            modalTitle = `Thank you ${salesName} Cantik, Input Berhasil!`;
        }

        showMessageModal(modalTitle, modalMessage, true);
        document.getElementById('dataEntriesContainer').innerHTML = '';
        entryCounter = 0;
        addEntry();

    } catch (error) {
        console.error("Error:", error);
        showMessageModal("Gagal Menyimpan Data!", "Terjadi kesalahan jaringan.", false);
    } finally {
        saveButton.disabled = false;
        saveText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        updateSaveButtonStatus();
    }
});

// Mobile Enhancements
document.addEventListener('touchstart', function() {}, {passive: true});
function enhanceMobileSelects() {
    document.querySelectorAll('select').forEach(s => {
        s.addEventListener('focus', function() { this.style.fontSize = '16px'; });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    enhanceMobileSelects();
    new MutationObserver((mutations) => {
        mutations.forEach((m) => { if(m.addedNodes.length) enhanceMobileSelects(); });
    }).observe(document.getElementById('dataEntriesContainer'), { childList: true, subtree: true });
});