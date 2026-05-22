// ==========================================
// 1. HTML எலிமெண்ட்டுகளை செலக்ட் செய்தல்
// ==========================================
const filterInput = document.getElementById("filter-input");
const searchDropdown = document.getElementById("search-dropdown");
const billItemsBody = document.getElementById("bill-items-body");

// பிரைசிங் கால்குலேட்டர் எலிமெண்ட்டுகள்
const summarySubtotal = document.getElementById("summary-subtotal");
const discountInput = document.getElementById("discount-input"); // ஆட்டோமேட்டிக் டிஸ்கவுண்ட் பாக்ஸ்
const summaryDiscountVal = document.getElementById("summary-discount-val");
const summaryTaxable = document.getElementById("summary-taxable");
const summaryCgst = document.getElementById("summary-cgst");
const summarySgst = document.getElementById("summary-sgst");
const summaryTotal = document.getElementById("summary-total");

const btnClear = document.getElementById("btn-clear");
const btnCheckout = document.getElementById("btn-checkout");
const billIdDisplay = document.getElementById("bill-id-display");

let html5QrCodeScanner = null;
let currentBillItems = []; 

if (billIdDisplay) {
    billIdDisplay.innerText = `Bill No: #${Math.floor(100000 + Math.random() * 900000)}`;
}

// ==========================================
// 2. 🔍 ப்ராடக்ட் தேடும் மற்றும் ஆட் செய்யும் ஃபங்க்ஷன்கள்
// ==========================================
function findProduct(value) {
    // storage.js-ல் இருக்கும் அசல் ப்ராடக்ட் லிஸ்டை எடுக்கிறது
    const allProducts = getProducts(); 
    const searchVal = String(value).trim().toLowerCase();
    
    return allProducts.find(p => 
        String(p.barcode).trim() === searchVal || 
        String(p.id).trim().toLowerCase() === searchVal || 
        p.name.toLowerCase() === searchVal
    );
}

function addProductToBill(productValue) {
    const product = findProduct(productValue);

    if (!product) {
        alert("❌ Product Not Found! இந்த பொருள் டேட்டாபேஸில் இல்லை.");
        return;
    }

    if (product.stock <= 0) {
        alert(`⚠️ Out of Stock! ${product.name}-ல் இருப்பு இல்லை.`);
        return;
    }

    const existingItem = currentBillItems.find(item => item.id === product.id);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            alert(`⚠️ ஸ்டாக்கில் ${product.stock} பொருட்கள் மட்டுமே உள்ளன.`);
            return;
        }
    } else {
        // உங்க ப்ராடக்ட் லிஸ்டில் இருக்கும் துல்லியமான GST % மற்றும் டிஸ்கவுண்ட்டை எடுக்கிறது
        currentBillItems.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            gstRate: product.gstPercent !== undefined ? parseFloat(product.gstPercent) : (parseFloat(product.gstRate) || 0), 
            itemDiscount: parseFloat(product.discount) || 0, 
            quantity: 1
        });
    }

    if (searchDropdown) searchDropdown.classList.add("hidden");
    if (filterInput) filterInput.value = "";

    updateBillUI();
}

// ==========================================
// 3. 🔄 மெйн கால்குலேஷன் (Automatic Discount & GST Amount Table)
// ==========================================
function updateBillUI() {
    if (!billItemsBody) return;
    billItemsBody.innerHTML = "";
    
    let totalItemsSubtotal = 0;
    let totalTaxableValue = 0;
    let totalCgstAmount = 0;
    let totalSgstAmount = 0;

    currentBillItems.forEach((item, index) => {
        const itemSubtotal = item.price * item.quantity;
        totalItemsSubtotal += itemSubtotal;

        const itemTotalDiscount = item.itemDiscount * item.quantity;
        const itemTaxable = Math.max(0, itemSubtotal - itemTotalDiscount);
        totalTaxableValue += itemTaxable;

        // 🧮 2. தனிநபர் பொருளின் GST தொகை கணக்கீடு (டேபிளில் காட்ட)
        const itemGstAmount = itemTaxable * (item.gstRate / 100);

        const halfGstRate = item.gstRate / 2;
        const itemCgst = itemTaxable * (halfGstRate / 100);
        const itemSgst = itemTaxable * (halfGstRate / 100);

        totalCgstAmount += itemCgst;
        totalSgstAmount += itemSgst;

        const itemFinalPrice = itemTaxable + itemGstAmount;

        const row = `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4 text-center font-medium text-gray-500">${index + 1}</td>
                <td class="p-4">
                    <span class="font-semibold text-gray-800 block">${item.name}</span>
                    <span class="text-xs text-gray-400">ID: ${item.id}</span>
                </td>
                <td class="p-4 text-center">
                    <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">${item.gstRate}%</span>
                </td>
                <td class="p-4 text-center font-medium text-gray-700">₹${itemGstAmount.toFixed(2)}</td>
                <td class="p-4 text-center">₹${item.price.toFixed(2)}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="changeQty(${index}, -1)" class="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded font-bold text-xs">-</button>
                        <span class="w-6 font-bold text-gray-800">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded font-bold text-xs">+</button>
                    </div>
                </td>
                <td class="p-4 text-right font-bold text-gray-900">₹${itemFinalPrice.toFixed(2)}</td>
                <td class="p-4 text-center">
                    <button onclick="deleteItem(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </td>
            </tr>
        `;
        billItemsBody.insertAdjacentHTML("beforeend", row);
    });

    // ==========================================
    // 🆕 3. AUTOMATIC BILL DISCOUNT LOGIC
    // ==========================================
    const totalBeforeDiscount = totalTaxableValue + totalCgstAmount + totalSgstAmount;
    let autoDiscountPercent = 0;

    if (totalBeforeDiscount >= 10000) {
        autoDiscountPercent = 20; // 10,000 மேல் 20%
    } else if (totalBeforeDiscount >= 5000) {
        autoDiscountPercent = 5;  // 5,000 மேல் 5%
    } else if (totalBeforeDiscount >= 1000) {
        autoDiscountPercent = 1;  // 1,000 மேல் 1%
    }

    // இன்புட் பாக்ஸில் ஆட்டோமேட்டிக்கா பர்சென்டேஜை காட்டுகிறோம்
    if (discountInput) {
        discountInput.value = autoDiscountPercent;
    }

    // மொத்த தொகையிலிருந்து தள்ளுபடி தொகையைக் கணக்கிடுதல்
    const billDiscountAmount = totalBeforeDiscount * (autoDiscountPercent / 100);
    const grandTotal = Math.max(0, totalBeforeDiscount - billDiscountAmount);

    // Pricing Calculator-ல் அப்டேட் செய்தல்
    if (summarySubtotal) summarySubtotal.innerText = `₹${totalItemsSubtotal.toFixed(2)}`;
    if (summaryDiscountVal) summaryDiscountVal.innerText = `-₹${billDiscountAmount.toFixed(2)}`;
    if (summaryTaxable) summaryTaxable.innerText = `₹${totalTaxableValue.toFixed(2)}`;
    if (summaryCgst) summaryCgst.innerText = `₹${totalCgstAmount.toFixed(2)}`;
    if (summarySgst) summarySgst.innerText = `₹${totalSgstAmount.toFixed(2)}`;
    if (summaryTotal) summaryTotal.innerText = `₹${grandTotal.toFixed(2)}`;
}

// Qty & Remove ஃபங்க்ஷன்கள்
window.changeQty = function(index, change) {
    const item = currentBillItems[index];
    const originalProduct = findProduct(item.id);
    item.quantity += change;
    if (item.quantity <= 0) {
        currentBillItems.splice(index, 1);
    } else if (item.quantity > originalProduct.stock) {
        alert(`⚠️ ஸ்டாக்கில் ${originalProduct.stock} பொருட்கள் மட்டுமே உள்ளன.`);
        item.quantity = originalProduct.stock;
    }
    updateBillUI();
};

window.deleteItem = function(index) {
    currentBillItems.splice(index, 1);
    updateBillUI();
};

if (btnClear) {
    btnClear.addEventListener("click", () => {
        if (confirm("பில் கார்ட்டை கா利 செய்யலாமா?")) {
            currentBillItems = [];
            updateBillUI();
        }
    });
}

// ==========================================
// 4. 🔍 மேனுவல் சர்ச் ஃபில்டர்
// ==========================================
if (filterInput && searchDropdown) {
    filterInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const allProducts = getProducts();

        if (searchTerm === "") {
            searchDropdown.classList.add("hidden");
            return;
        }

        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            String(p.id).toLowerCase().includes(searchTerm) || 
            String(p.barcode).includes(searchTerm)
        );

        if (filtered.length === 0) {
            searchDropdown.innerHTML = `<div class="p-3 text-sm text-gray-500 text-center">No products found</div>`;
        } else {
            searchDropdown.innerHTML = filtered.map(p => `
                <div class="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center" onclick="addProductToBill('${p.id}')">
                    <div>
                        <span class="font-medium text-sm text-gray-800 block">${p.name}</span>
                        <span class="text-xs text-gray-400">ID: ${p.id} | Barcode: ${p.barcode}</span>
                    </div>
                    <span class="text-sm font-bold text-green-700">₹${parseFloat(p.price).toFixed(2)}</span>
                </div>
            `).join('');
        }
        searchDropdown.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!filterInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.add("hidden");
        }
    });
}

// ==========================================
// 5. 📷 புதிய இன்-பில்ட் UI ஸ்கேனர் செட்டப் (Alternate Solution)
// ==========================================
function onScanSuccess(decodedText, decodedResult) {
    console.log(`🎯 Scanned Successfully: ${decodedText}`);
    if (navigator.vibrate) navigator.vibrate(100); 
    
    // ஸ்கேன் ஆன வேல்யூவை பில் கார்ட்டில் சேர்க்கிறது
    addProductToBill(decodedText);
}

// பிரௌசர் லோடானதும் இன்-பில்ட் UI ஸ்கேனரை உருவாக்குகிறது
if (document.getElementById("interactive-reader")) {
    html5QrCodeScanner = new Html5QrcodeScanner(
        "interactive-reader", 
        { 
            fps: 15, 
            qrbox: { width: 320, height: 140 }, // பார்-கோடுக்கு ஏத்த கச்சிதமான நீள அகலம்
            rememberLastUsedCamera: true
        },
        /* verbose= */ false
    );
    html5QrCodeScanner.render(onScanSuccess);
}
// ==========================================
// 6. 💾 🛠️ FIXED: SAVE BILL, STOCK REDUCTION & CUSTOMER LOGIC
// ==========================================
if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
        if (currentBillItems.length === 0) {
            alert("⚠️ பில் கார்ட் காலியாக உள்ளது! பொருட்களை ஆட் செய்யவும்.");
            return;
        }

        if (!confirm("இந்த பில்லை முடித்து சேமிக்கலாமா?")) return;

        // 1. அசல் இன்வென்டரி லிஸ்டை எடுக்கிறோம்
        let allProducts = [];
        if (typeof getProducts === "function") {
            allProducts = getProducts(); 
        } else {
            allProducts = JSON.parse(localStorage.getItem("products")) || [];
        }

        // 2. 📉 இன்வென்டரி ஸ்டாக்கை குறைக்கும் லாஜிக்
        currentBillItems.forEach(billItem => {
            let productInStock = allProducts.find(p => String(p.id).trim().toLowerCase() === String(billItem.id).trim().toLowerCase());
            if (productInStock) {
                let currentStock = parseInt(productInStock.stock) || 0;
                productInStock.stock = Math.max(0, currentStock - billItem.quantity);
            }
        });

        // 3. குறைக்கப்பட்ட புதிய ஸ்டாக்கை லோக்கல் ஸ்டோரேஜில் சேமிக்கிறோம்
        if (typeof saveProducts === "function") {
            saveProducts(allProducts); 
        } else {
            localStorage.setItem("products", JSON.stringify(allProducts));
        }

        // 4. 📝 கஸ்டமர் பெயர் இன்புட் பாக்ஸ் மதிப்பை எடுக்கிறோம்
        // (ஒருவேளை பெயர் டைப் செய்யவில்லை என்றால் ஆட்டோமேட்டிக்காக "Walk-in Customer" என்று எடுத்துக்கொள்ளும்)
        const customerInputEl = document.getElementById("customer-name-input");
        const finalCustomerName = customerInputEl ? customerInputEl.value.trim() || "Walk-in Customer" : "Walk-in Customer";

        // 5. 📄 இன்வாய்ஸ் பக்கத்திற்குத் தேவையான டேட்டாவை தயார் செய்கிறோம்
        const generatedBillNo = Math.floor(100000 + Math.random() * 900000);
        
        const invoiceData = {
            billNo: generatedBillNo,
            date: new Date().toLocaleString(),
            items: currentBillItems,
            subtotal: summarySubtotal ? summarySubtotal.innerText : "₹0.00",
            taxable: summaryTaxable ? summaryTaxable.innerText : "₹0.00",
            cgst: summaryCgst ? summaryCgst.innerText : "₹0.00",
            sgst: summarySgst ? summarySgst.innerText : "₹0.00",
            discountPercent: discountInput ? discountInput.value : 0,
            discountAmount: summaryDiscountVal ? summaryDiscountVal.innerText : "-₹0.00",
            grandTotal: summaryTotal ? summaryTotal.innerText : "₹0.00",
            paymentMode: document.getElementById("payment-mode") ? document.getElementById("payment-mode").value : "Cash",
            customerName: finalCustomerName // இங்கே தான் கஸ்டமர் பெயர் இணைகிறது!
        };

        // 6. 🚨 SAFE SAVING: sessionStorage-க்கு பதிலாக நிரந்தரமான 'localStorage'-ல் சேமிக்கிறோம்!
        let allInvoices = JSON.parse(localStorage.getItem("all_invoices")) || [];
        allInvoices.unshift(invoiceData); // புதிய பில்லை ஹிஸ்டரி லிஸ்டின் முதலில் சேர்க்கிறோம்
        localStorage.setItem("all_invoices", JSON.stringify(allInvoices));

        // இப்போது போட்ட பில்லை மட்டும் தானாக ஓபன் செய்ய அதன் நம்பரை சேமிக்கிறோம்
        localStorage.setItem("latestInvoiceNo", generatedBillNo);

        alert("🎉 பில் வெற்றிகரமாக சேமிக்கப்பட்டது! ஸ்டாக் குறைக்கப்பட்டது.");
        
        // 7. 🚀 இன்வாய்ஸ் பக்கத்திற்கு ரீடைரெக்ட் செய்கிறோம்
        window.location.href = "invoice.html"; 
    });
}