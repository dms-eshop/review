// Function to update the main product image when a thumbnail is clicked
function updateMainImage(thumbnailElement) {
    const mainImage = document.getElementById('main-product-showcase');
    // Assuming main image names are derived from thumbnail names
    // e.g., thumb-1.png -> product-main.png (or just a different path)
    // For this example, let's just use the thumbnail's src directly, assuming they are large enough
    mainImage.src = thumbnailElement.src;

    // Update active state for thumbnails
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active-thumb');
    });
    thumbnailElement.classList.add('active-thumb');
}

document.addEventListener('DOMContentLoaded', () => {
    const quantityValue = document.getElementById('product-quantity-value');
    const minusButton = document.getElementById('btn-quantity-minus');
    const plusButton = document.getElementById('btn-quantity-plus');
    const confirmOrderButton = document.getElementById('confirm-order-action-btn');

    let currentQuantity = 1;

    // Decrease quantity
    minusButton.addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityValue.textContent = currentQuantity;
        }
    });

    // Increase quantity
    plusButton.addEventListener('click', () => {
        currentQuantity++;
        quantityValue.textContent = currentQuantity;
    });

    // Handle confirm order button click
    confirmOrderButton.addEventListener('click', () => {
        const orderDetails = {
            productName: document.querySelector('.product-main-title').textContent,
            price: document.querySelector('.current-price').textContent,
            originalPrice: document.querySelector('.original-price').textContent,
            image: document.getElementById('main-product-showcase').src,
            quantity: currentQuantity
        };

        // Store data in localStorage to pass to the checkout page
        localStorage.setItem('sneakerOrderDetails', JSON.stringify(orderDetails));

        // Redirect to checkout page
        window.location.href = 'checkouts.html';
    });
});