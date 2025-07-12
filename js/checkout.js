document.addEventListener('DOMContentLoaded', () => {
    let productPrice = 0;
    let advanceAmount = 0;

    const placeOrderBtn = document.getElementById('place-final-order-btn');

    // Retrieve and display order details from localStorage
    const orderDetails = JSON.parse(localStorage.getItem('sneakerOrderDetails'));
    if (orderDetails) {
        document.getElementById('final-product-image').src = orderDetails.image;
        document.getElementById('final-product-name').textContent = orderDetails.productName;
        document.getElementById('final-product-quantity').textContent = orderDetails.quantity;
        document.getElementById('final-product-price').textContent = orderDetails.price;

        // Calculate total and advance price
        productPrice = parseFloat(orderDetails.price.replace('৳', '')) * parseInt(orderDetails.quantity);
        advanceAmount = productPrice * 0.10;

        document.getElementById('total-price-display').textContent = `৳${productPrice.toFixed(2)}`;
        document.getElementById('advance-amount-display').textContent = `৳${advanceAmount.toFixed(2)}`;
        document.querySelectorAll('.advance-amount-text').forEach(el => el.textContent = `৳${advanceAmount.toFixed(2)}`);
    }

    // Handle Payment Method Selection
    const paymentMethodSelect = document.getElementById('payment-method');
    paymentMethodSelect.addEventListener('change', (event) => {
        const selectedMethod = event.target.value;
        const allInstructions = document.querySelectorAll('.payment-method-details');
        allInstructions.forEach(inst => inst.style.display = 'none');

        // Show selected instruction panel
        if (selectedMethod) {
            const selectedInstructions = document.getElementById(`${selectedMethod}-instructions`);
            if (selectedInstructions) {
                selectedInstructions.style.display = 'block';
            }
        }
        
        // Disable main "Place Order" button for WhatsApp
        if (selectedMethod === 'WhatsApp') {
            placeOrderBtn.disabled = true;
            placeOrderBtn.style.cursor = 'not-allowed';
            placeOrderBtn.style.opacity = '0.6';
        } else {
            placeOrderBtn.disabled = false;
            placeOrderBtn.style.cursor = 'pointer';
            placeOrderBtn.style.opacity = '1';
        }
    });

    // Handle "Place Order" form submission
    const billingForm = document.getElementById('customer-billing-form');
    billingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // This function will only be called for non-WhatsApp methods
        createAndDownloadReceipt();
    });

    // Handle WhatsApp Order Button
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    whatsappBtn.addEventListener('click', () => {
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;

        if (!customerName || !customerPhone || !customerAddress) {
            alert('Please fill in your Name, Phone, and Address before ordering on WhatsApp.');
            return;
        }

        const message = `Hello, I'd like to place an order.\n\n` +
                        `*Product:* ${orderDetails.productName}\n` +
                        `*Quantity:* ${orderDetails.quantity}\n` +
                        `*Total Price:* ৳${productPrice.toFixed(2)}\n\n` +
                        `*My Details:*\n` +
                        `*Name:* ${customerName}\n` +
                        `*Phone:* ${customerPhone}\n` +
                        `*Address:* ${customerAddress}\n\n` +
                        `Thank you!`;

        const whatsappNumber = '8801XXXXXXXXX'; // আপনার WhatsApp নম্বর এখানে দিন
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    });
});

function createAndDownloadReceipt() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const form = document.getElementById('customer-billing-form');
    const formData = new FormData(form);
    const billingData = Object.fromEntries(formData.entries());
    const orderDetails = JSON.parse(localStorage.getItem('sneakerOrderDetails'));

    // --- PDF Design (same as before) ---
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor("#1d2026");
    pdf.text("Order Receipt", 40, 60);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor("#68707d");
    pdf.text(`Order #${Math.floor(Math.random() * 100000)}`, 40, 80);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 40, 95);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor("#1d2026");
    pdf.text("Billed To:", 40, 140);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor("#1d2026");
    pdf.text(billingData.name || '', 40, 160);
    pdf.setTextColor("#68707d");
    pdf.text(billingData.address || '', 40, 175);
    pdf.text(`${billingData.city || ''}, ${billingData.postcode || ''}`, 40, 190);
    pdf.text(billingData.country || '', 40, 205);
    const tableColumn = ["Item", "Quantity", "Price"];
    const tableRows = [];
    const totalPrice = parseFloat(orderDetails.price.replace('৳', '')) * parseInt(orderDetails.quantity);
    const productRow = [orderDetails.productName, orderDetails.quantity, `৳${totalPrice.toFixed(2)}`];
    tableRows.push(productRow);
    pdf.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 240,
        theme: 'grid',
        headStyles: { fillColor: [29, 32, 38] },
        styles: { font: "helvetica", fontSize: 11 },
    });
    let finalY = pdf.autoTable.previous.finalY + 30;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Total:", 400, finalY);
    pdf.text(`৳${totalPrice.toFixed(2)}`, 500, finalY, { align: 'right' });
    finalY += 30;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Details", 40, finalY);
    finalY += 20;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Payment Method: ${billingData.paymentMethod}`, 40, finalY);
    if (billingData.paymentMethod === 'CashOnDelivery') {
        finalY += 15;
        let advanceAmount = totalPrice * 0.10;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#ff7d1a");
        pdf.text(`Advance Paid (10%): ৳${advanceAmount.toFixed(2)}`, 40, finalY);
        pdf.setTextColor("#68707d");
        pdf.text(`(TrxID: ${billingData.codTrxId || 'N/A'})`, 40, finalY + 15);
    } else if (billingData.bkashTrxId || billingData.nagadTrxId) {
        finalY += 15;
        pdf.text(`Transaction ID: ${billingData.bkashTrxId || billingData.nagadTrxId}`, 40, finalY);
    }

    pdf.save('order-receipt.pdf');

    setTimeout(() => {
        window.location.href = 'live.html';
    }, 1000);
}