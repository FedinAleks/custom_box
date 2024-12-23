document.addEventListener("DOMContentLoaded", function() {
    // Отримуємо дані про кошик
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Шукаємо конкретний товар у кошику (наприклад, за id)
        const productId = 'ID_ТОВАРУ';
        let productQuantity = 0;
        
        cart.items.forEach(item => {
          if (item.id == productId) {
            productQuantity = item.quantity;
          }
        });
  
        // Якщо кількість товарів більше або дорівнює 10
        if (productQuantity >= 10) {
          showDiscountMessage(productQuantity);
        }
      });
  });
  
  // Функція для виведення повідомлення з акцією
  function showDiscountMessage(quantity) {
    const message = `При покупці ${quantity} одиниць товару ви отримуєте знижку!`;
    const messageElement = document.createElement('div');
    messageElement.classList.add('discount-message');
    messageElement.textContent = message;
  
    document.querySelector('.cart').appendChild(messageElement);
  }
  