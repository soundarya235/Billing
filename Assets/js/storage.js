// ⚡ 20 Real-Time Supermarket Products Database
const initialProducts = [
    { id: "DM-1001", barcode: "8901234567890", name: "Aashirvaad Atta 5kg", mfgDate: "2026-01-10", expDate: "2026-12-10", gstRate: 0, stock: 50, inwardQty: 50, price: 210.00 },
    { id: "DM-1002", barcode: "8902345678901", name: "Amul Butter 100g", mfgDate: "2026-04-15", expDate: "2026-06-15", gstRate: 12, stock: 12, inwardQty: 30, price: 54.00 }, // ⚠️ Low Stock & Soon
    { id: "DM-1003", barcode: "8903456789012", name: "Brittania Marie Gold 250g", mfgDate: "2026-03-01", expDate: "2026-11-01", gstRate: 18, stock: 85, inwardQty: 100, price: 35.00 },
    { id: "DM-1004", barcode: "8901491101836", name: "Surf Excel Easy Wash 1kg", mfgDate: "2026-01-20", expDate: "2028-01-20", gstRate: 18, stock: 40, inwardQty: 40, price: 140.00 },
    { id: "DM-1005", barcode: "8901030753441", name: "Red Label Tea Powder 500g", mfgDate: "2026-02-10", expDate: "2027-02-10", gstRate: 5, stock: 65, inwardQty: 70, price: 230.00 },
    { id: "DM-1006", barcode: "8901058002477", name: "Saffola Gold Oil 1L", mfgDate: "2026-03-15", expDate: "2026-12-15", gstRate: 5, stock: 10, inwardQty: 50, price: 175.00 }, // ⚠️ Low Stock
    { id: "DM-1007", barcode: "8901725181221", name: "Tata Salt Crystal 1kg", mfgDate: "2026-01-05", expDate: "2029-01-05", gstRate: 0, stock: 120, inwardQty: 150, price: 25.00 },
    { id: "DM-1008", barcode: "8901063142342", name: "Colgate MaxFresh Paste 150g", mfgDate: "2026-02-25", expDate: "2027-08-25", gstRate: 18, stock: 55, inwardQty: 60, price: 115.00 },
    { id: "DM-1009", barcode: "8901021111120", name: "Dettol Liquid Handwash 200ml", mfgDate: "2026-01-12", expDate: "2027-07-12", gstRate: 18, stock: 35, inwardQty: 50, price: 99.00 },
    { id: "DM-1010", barcode: "8901101561234", name: "Maggi 2-Min Noodles 560g", mfgDate: "2026-04-01", expDate: "2026-11-01", gstRate: 18, stock: 14, inwardQty: 40, price: 168.00 }, // ⚠️ Low Stock
    { id: "DM-1011", barcode: "8902519001254", name: "Parle-G Biscuits 800g", mfgDate: "2026-03-20", expDate: "2026-09-20", gstRate: 18, stock: 90, inwardQty: 100, price: 80.00 },
    { id: "DM-1012", barcode: "8901248254212", name: "Cadbury Dairy Milk Silk 150g", mfgDate: "2026-05-01", expDate: "2026-06-18", gstRate: 18, stock: 25, inwardQty: 30, price: 175.00 }, // ⏳ Expiring Soon (<30 days)
    { id: "DM-1013", barcode: "8906002123412", name: "Good Knight Gold Flash Refill", mfgDate: "2026-02-14", expDate: "2028-02-14", gstRate: 18, stock: 45, inwardQty: 45, price: 85.00 },
    { id: "DM-1014", barcode: "8901030654212", name: "Lux International Soap 125g", mfgDate: "2026-01-30", expDate: "2028-01-30", gstRate: 18, stock: 70, inwardQty: 80, price: 62.00 },
    { id: "DM-1015", barcode: "8901548100124", name: "Whisper Choice Ultra 20s", mfgDate: "2026-02-18", expDate: "2029-02-18", gstRate: 12, stock: 38, inwardQty: 40, price: 150.00 },
    { id: "DM-1016", barcode: "8904000901235", name: "Vim Dishwash Gel 500ml", mfgDate: "2026-03-10", expDate: "2027-09-10", gstRate: 18, stock: 8, inwardQty: 30, price: 120.00 }, // ⚠️ Low Stock
    { id: "DM-1017", barcode: "8901058852317", name: "Fortune Basmati Rice 5kg", mfgDate: "2026-01-15", expDate: "2027-07-15", gstRate: 0, stock: 60, inwardQty: 60, price: 650.00 },
    { id: "DM-1018", barcode: "8906017254812", name: "Catch Turmeric Powder 200g", mfgDate: "2026-02-01", expDate: "2027-02-01", gstRate: 5, stock: 42, inwardQty: 50, price: 58.00 },
    { id: "DM-1019", barcode: "8901030874125", name: "Kissan Tomato Ketchup 1kg", mfgDate: "2026-03-05", expDate: "2026-12-05", gstRate: 12, stock: 19, inwardQty: 25, price: 145.00 },
    { id: "DM-1020", barcode: "8901221102541", name: "Horlicks Chocolate 500g", mfgDate: "2026-04-10", expDate: "2026-06-10", gstRate: 18, stock: 30, inwardQty: 30, price: 265.00 } // ⏳ Expiring Soon (<30 days)
];

// LocalStorage-ல் இருந்து தயாரிப்புகளை எடுக்கும் ஃபங்க்ஷன்
function getProducts() {
    let localData = localStorage.getItem('products');
    
    // லோக்கல் ஸ்டோரேஜ் காலியாக இருந்தால் மட்டுமே இன்-பில்ட் டேட்டாவை லோடு செய்யும்
    if (!localData) {
        localStorage.setItem('products', JSON.stringify(initialProducts));
        return initialProducts;
    }
    
    return JSON.parse(localData);
}

// புதிய தயாரிப்பைச் சேர்க்கும் ஃபங்க்ஷன்
function addNewProduct(name, price, mfg, exp, stock, gst) {
    const products = getProducts();
    
    // SKU ID தானாக உருவாக்குதல் (DM-1021, DM-1022...)
    const lastId = products.length > 0 ? products[products.length - 1].id : "DM-1000";
    const nextNum = parseInt(lastId.split('-')[1]) + 1;
    const newId = `DM-${nextNum}`;
    
    // 13 எண்கள் கொண்ட ரேண்டம் பார்-கோடு டெக்ஸ்ட் உருவாக்குதல்
    const randomBarcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

    const newProduct = {
        id: newId,
        barcode: randomBarcode,
        name: name,
        mfgDate: mfg,
        expDate: exp,
        gstRate: parseInt(gst),
        stock: parseInt(stock),
        inwardQty: parseInt(stock),
        price: parseFloat(price)
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products)); // சேமிக்கிறது
    return newProduct;
}
// Products save function
function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}