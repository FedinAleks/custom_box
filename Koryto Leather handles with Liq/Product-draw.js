fetch('/cart/add.js', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        items: [
            {
                id: 1234567890, // ID базового товару
                quantity: 1,
                properties: {
                    'Width': width,
                    'Height': height,
                    'Depth': depth,
                    'Price': totalPrice
                }
            }
        ]
    }),
}).then(response => response.json()).then(data => {
    console.log('Added to cart:', data);
});

// КОД ДЛЯ ПРОДУКТУ, ДЛЯ ДОДАВАННЯ У КОРЗИНУ