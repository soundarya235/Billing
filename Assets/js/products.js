document.addEventListener('DOMContentLoaded', () => {
    refreshMasterTable();

    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            refreshMasterTable(query);
        });
    }
});

function openInwardModal() {
    document.getElementById('modal-title').innerText = "📦 Purchase Inward Stock Entry";
    document.getElementById('stock-label').innerText = "Inward Qty";
    document.getElementById('submit-btn').innerText = "📥 Save Inward Stock";
    document.getElementById('edit-product-id').value = "";
    document.getElementById('add-product-form').reset();
    document.getElementById('inward-modal').classList.remove('hidden');
    hideAllErrors();
}

function closeInwardModal() {
    document.getElementById('inward-modal').classList.add('hidden');
    document.getElementById('add-product-form').reset();
}

function hideAllErrors() {
    document.getElementById('error-name').classList.add('hidden');
    document.getElementById('error-price').classList.add('hidden');
    document.getElementById('error-stock').classList.add('hidden');
}

function validateForm(name, price, stock, mfg, exp) {
    let isValid = true;
    hideAllErrors();
    if (name.length < 3) { document.getElementById('error-name').classList.remove('hidden'); isValid = false; }
    if (isNaN(price) || price <= 0) { document.getElementById('error-price').classList.remove('hidden'); isValid = false; }
    if (isNaN(stock) || stock < 0 || stock === "") { document.getElementById('error-stock').classList.remove('hidden'); isValid = false; }

    if (!mfg || !exp) {
        alert("❌ MFG Date & EXP Date need to fill!");
        return false;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const todayObj = new Date(todayStr);
    if (new Date(mfg) > todayObj) { alert("❌ MFG Date should not be a future date!"); return false; }
    if (new Date(exp) <= todayObj) { alert("❌ Cannot add an expired item!"); return false; }
    if (new Date(mfg) >= new Date(exp)) { alert("❌ MFG Date should be before EXP Date!"); return false; }
    return isValid;
}

function handleFormSubmit(event) {
    event.preventDefault();
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('p-name').value.trim();
    const price = document.getElementById('p-price').value;
    const stock = document.getElementById('p-stock').value;
    const mfg = document.getElementById('p-mfg').value;
    const exp = document.getElementById('p-exp').value;
    const gst = document.getElementById('p-gst').value;

    if (!validateForm(name, price, stock, mfg, exp)) return;

    let products = getProducts();

    if (editId !== "") {
        const productToEdit = products.find(p => p.id === editId);
        if (productToEdit) {
            productToEdit.name = name;
            productToEdit.price = parseFloat(price);
            productToEdit.stock = parseInt(stock);
            productToEdit.mfgDate = mfg;
            productToEdit.expDate = exp;
            productToEdit.gstRate = parseInt(gst);
            localStorage.setItem('products', JSON.stringify(products));
            alert(`📝 "${name}" Details Updated!`);
        }
    } else {
        const checkProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (checkProduct) {
            if(checkProduct.inwardQty) checkProduct.inwardQty += parseInt(stock);
            else checkProduct.inwardQty = checkProduct.stock + parseInt(stock);
            checkProduct.stock += parseInt(stock);
            checkProduct.price = parseFloat(price);
            localStorage.setItem('products', JSON.stringify(products));
            alert(`📦 Stock Updated for "${name}"!`);
        } else {
            addNewProduct(name, price, mfg, exp, stock, gst);
            alert(`✨ New Product Added!`);
        }
    }
    closeInwardModal();
    refreshMasterTable();
}

function editProductRow(skuId) {
    const products = getProducts();
    const product = products.find(p => p.id === skuId);
    if (!product) return;

    document.getElementById('modal-title').innerText = `📝 Edit Product: ${skuId}`;
    document.getElementById('stock-label').innerText = "Modify Current Stock";
    document.getElementById('submit-btn').innerText = "💾 Update Changes";
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-stock').value = product.stock;
    document.getElementById('p-mfg').value = product.mfgDate || "";
    document.getElementById('p-exp').value = product.expDate || "";
    document.getElementById('p-gst').value = product.gstRate;

    hideAllErrors();
    document.getElementById('inward-modal').classList.remove('hidden');
}

function deleteProductRow(skuId) {
    if (confirm(`Are you sure you want to delete (${skuId}) this?`)) {
        let products = getProducts();
        const index = products.findIndex(p => p.id === skuId);
        if (index > -1) {
            const name = products[index].name;
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            alert(`❌ "${name}" deleted!`);
            refreshMasterTable();
        }
    }
}

function refreshMasterTable(filterQuery = "") {
    const tbody = document.getElementById('master-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const products = getProducts(); 
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    products.forEach(product => {
        if (!product.inwardQty) product.inwardQty = product.stock; 

        let statusText = "Safe"; 
        let expiryHtml = "";
        
        if (product.expDate && product.expDate !== "N/A") {
            const expDateObj = new Date(product.expDate);
            const timeDiff = expDateObj - today;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            if (daysDiff <= 0) {
                statusText = "Expired";
                expiryHtml = `<div class="text-center"><span class="text-xs text-red-500 font-mono font-semibold">${product.expDate}</span><br><span class="inline-block text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Expired</span></div>`;
            } else if (daysDiff <= 30) {
                statusText = "Soon";
                expiryHtml = `<div class="text-center"><span class="text-xs text-amber-600 font-mono font-semibold">${product.expDate}</span><br><span class="inline-block text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Soon (${daysDiff}d)</span></div>`;
            } else {
                statusText = "Safe";
                expiryHtml = `<div class="text-center"><span class="text-xs text-gray-600 font-mono">${product.expDate}</span><br><span class="inline-block text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium uppercase">Safe</span></div>`;
            }
        } else {
            statusText = "N/A";
            expiryHtml = `<div class="text-center text-xs text-gray-400 font-mono">N/A</div>`;
        }

        const isLow = product.stock <= 15;
        const stockText = isLow ? "Low Stock" : "Available";
        const stockStatusColor = isLow ? "text-red-600 font-bold bg-red-50" : "text-green-600 font-medium";

        const query = filterQuery.toLowerCase();
        const matchSku = product.id.toLowerCase().includes(query);
        const matchName = product.name.toLowerCase().includes(query);
        const matchPrice = `₹${product.price}`.includes(query) || String(product.price).includes(query);
        const matchGst = `${product.gstRate}%`.includes(query) || String(product.gstRate).includes(query);
        const matchExpStatus = statusText.toLowerCase().includes(query);
        const matchStockStatus = stockText.toLowerCase().includes(query);

        if (filterQuery !== "" && !(matchSku || matchName || matchPrice || matchGst || matchExpStatus || matchStockStatus)) {
            return;
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition border-b border-gray-100';
        
        // Screenshot-il ulla id-ukku etraar pol (prod-bc-${product.id}) set seiyapadugirathu
        tr.innerHTML = `
            <td class="p-3 font-mono text-xs font-bold text-gray-600 bg-gray-50">${product.id}</td>
            <td class="p-3"><canvas id="prod-bc-${product.id}"></canvas></td>
            <td class="p-3 font-semibold text-gray-800">${product.name}</td>
            <td class="p-3 text-xs text-gray-500 font-mono">${product.mfgDate || 'N/A'}</td>
            <td class="p-3">${expiryHtml}</td>
            <td class="p-3 text-center"><span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-bold">${product.gstRate}%</span></td>
            <td class="p-3 text-center text-gray-600 font-mono">${product.inwardQty}</td>
            <td class="p-3 text-center font-bold font-mono ${isLow ? 'text-red-700 bg-red-50' : 'text-green-700'}">${product.stock}</td>
            <td class="p-3 text-center text-xs px-2 py-1 rounded ${stockStatusColor}">${isLow ? '⚠️ Low Stock' : '✅ Available'}</td>
            <td class="p-3 font-bold text-gray-900">₹${product.price.toFixed(2)}</td>
            <td class="p-3 text-center flex flex-col sm:flex-row justify-center items-center gap-1.5 whitespace-nowrap">
                <button onclick="editProductRow('${product.id}')" class="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-2 py-1 rounded text-xs font-semibold border border-blue-200 transition w-full sm:w-auto">Edit</button>
                <button onclick="deleteProductRow('${product.id}')" class="bg-red-50 hover:bg-red-600 text-red-500 hover:text-white px-2 py-1 rounded text-xs font-semibold border border-red-200 transition w-full sm:w-auto">Delete</button>
                <button onclick="downloadBarcode('${product.id}', '${product.name}')" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm transition flex items-center justify-center gap-0.5 w-full sm:w-auto">📥 Barcode</button>
            </td>
        `;
        tbody.appendChild(tr);

        try {
            JsBarcode(`#prod-bc-${product.id}`, product.barcode, {
                format: "CODE128", width: 1.2, height: 30, displayValue: true, fontSize: 10, margin: 0
            });
        } catch (e) { console.error(e); }
    });
}

// ⚡ 2. EXCEL EXPORT FUNCTION (SheetJS)
function exportToExcel() {
    const products = getProducts();
    if(products.length === 0) { alert("டேபிளில் பொருட்கள் எதுவும் இல்லை!"); return; }

    // எக்செல் கோப்பிற்கு தேவையான வடிவில் தரவை மாற்றுதல்
    const excelRows = products.map(p => ({
        "SKU ID": p.id,
        "Barcode": p.barcode,
        "Product Name": p.name,
        "MFG Date": p.mfgDate,
        "EXP Date": p.expDate,
        "GST Rate": `${p.gstRate}%`,
        "Inward Qty": p.inwardQty || p.stock,
        "Available Stock": p.stock,
        "Unit Price": `INR ${p.price.toFixed(2)}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Master");
    
    // டவுன்லோடு ஃபைல் பெயர்
    XLSX.writeFile(workbook, `DMart_Products_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ⚡ 3. PDF EXPORT FUNCTION (jsPDF + autoTable)
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // லேண்ட்ஸ்கேப் வடிவம்
    
    const products = getProducts();
    if(products.length === 0) { alert("டேபிளில் பொருட்கள் எதுவும் இல்லை!"); return; }

    doc.setFont("helvetica", "bold");
    doc.text("DMART ERP - PRODUCT MASTER REPORT", 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 22);

    const tableHeaders = [["SKU ID", "Product Name", "MFG Date", "EXP Date", "GST", "Inward Qty", "Available Stock", "Price"]];
    const tableRows = products.map(p => [
        p.id,
        p.name,
        p.mfgDate,
        p.expDate,
        `${p.gstRate}%`,
        p.inwardQty || p.stock,
        p.stock,
        `Rs.${p.price.toFixed(2)}`
    ]);

    doc.autoTable({
        head: tableHeaders,
        body: tableRows,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }, // Dark grey theme
        styles: { fontSize: 9 }
    });

    doc.save(`DMart_Products_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
// 🆕 BARCODE DOWNLOAD FUNCTION
function downloadBarcode(skuId, productName) {
    // Table-il irukum canvas element-ai edukkirom
    const canvas = document.getElementById(`prod-bc-${skuId}`);
    if (!canvas) {
        alert("❌ Barcode image not found!");
        return;
    }

    // Canvas-ai PNG Image Data-va mathugirom
    const imageData = canvas.toDataURL("image/png");

    // Oru temporary link-a create panni download pannirom
    const downloadLink = document.createElement("a");
    downloadLink.href = imageData;
    
    // File name: ਉਦਾਹਰਨ - DMART001_LuxSoap_Barcode.png
    const safeName = productName.replace(/[^a-zA-in0-9]/g, "_"); // Special characters-a remove seiya
    downloadLink.download = `${skuId}_${safeName}_Barcode.png`;
    
    // Link-a click panni download trigger seigirom
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}