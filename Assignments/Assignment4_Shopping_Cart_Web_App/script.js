document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.querySelector(".cart-icon");
    const cartPanel = document.querySelector(".cart-panel");
    const closeCartBtn = document.querySelector(".close-cart");
    const productsContainer = document.getElementById("product-list");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const products = [
        { id: 1, name: "iPhone 14", category: "mobiles", price: 79999, img: "iphone14.jpg" },
        { id: 2, name: "Samsung Galaxy S23", category: "mobiles", price: 74999, img: "s23.avif" },
        { id: 3, name: "MacBook Air M2", category: "laptops", price: 99999, img: "MacBook_Air_M2.jpg" },
        { id: 4, name: "Dell XPS 13", category: "laptops", price: 87999, img: "Dell_XPS_13.jpg" },
        { id: 5, name: "HP Pavilion", category: "laptops", price: 65999, img: "HP_Pavilion.jpg" },
        { id: 6, name: "Sony Headphones", category: "accessories", price: 7999, img: "Sony_Headphones.jpg" },
        { id: 7, name: "JBL Speaker", category: "accessories", price: 5999, img: "JBL_Speaker.jpg" },
        { id: 8, name: "Smartwatch", category: "accessories", price: 11999, img: "Smartwatch.jpg" },
        { id: 9, name: "Canon Camera", category: "accessories", price: 45000, img: "Canon_Camera.jpg" },
        { id: 10, name: "Gaming Mouse", category: "accessories", price: 2999, img: "Gaming_Mouse.jpg" },
        { id: 11, name: "Wireless Keyboard", category: "accessories", price: 3499, img: "Wireless_Keyboard.jpg" },
        { id: 12, name: "Power Bank", category: "accessories", price: 1999, img: "Power_Bank.jpg" },
        { id: 13, name: "External Hard Drive", category: "accessories", price: 5999, img: "External_Hard_Drive.jpg" },
        { id: 14, name: "Router", category: "accessories", price: 2999, img: "Router.jpg" },
        { id: 15, name: "Tablet", category: "mobiles", price: 39999, img: "Tablet.jpg" }
    ];

    function renderProducts(category = "all") {
        productsContainer.innerHTML = "";
        const filteredProducts = category === "all" ? products : products.filter(p => p.category === category);

        filteredProducts.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product");
            productDiv.innerHTML = `
                <img src="Images/${product.img}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Rs. ${product.price}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            productsContainer.appendChild(productDiv);
        });

        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", (e) => {
                addToCart(parseInt(e.target.dataset.id));
            });
        });
    }

    function renderCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="Images/${item.img}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>RS. ${item.price} x ${item.quantity}</p>
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        cartTotal.textContent = total;
        cartCount.textContent = cart.length;
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function addToCart(id) {
        const product = products.find(p => p.id === id);
        const cartItem = cart.find(item => item.id === id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
    }

    window.updateQuantity = function (id, change) {
        const cartItem = cart.find(item => item.id === id);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                removeFromCart(id);
            } else {
                renderCart();
            }
        }
    };

    window.removeFromCart = function (id) {
        cart = cart.filter(item => item.id !== id);
        renderCart();
    };

    window.clearCart = function () {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    };

    window.checkout = function () {
        let modal = document.getElementById("checkoutModal");
        let modalContent = document.querySelector(".modal-content");
        let orderDetails = document.getElementById("orderDetails");
        let orderTotal = document.getElementById("orderTotal");
        let confirmButton = document.getElementById("confirmOrder");
        let closeButton = document.getElementById("closeModal");
    
        // Ensure modalContent has initial structure to avoid overriding elements
        modalContent.innerHTML = `
            <span class="close-btn" id="closeModal">&times;</span>
            <h2>Order Summary</h2>
            <div id="orderDetails"></div>
            <p><strong>Total: RS. <span id="orderTotal"></span></strong></p>
            <button id="confirmOrder">Confirm Order</button>
        `;
    
        // Reassign new elements after updating modalContent
        orderDetails = document.getElementById("orderDetails");
        orderTotal = document.getElementById("orderTotal");
        confirmButton = document.getElementById("confirmOrder");
        closeButton = document.getElementById("closeModal");
    
        // Clear previous content
        orderDetails.innerHTML = "";
        orderTotal.textContent = "";
    
        // Show modal
        modal.style.display = "flex";
    
        if (cart.length === 0) {
            // Empty Cart Handling
            modalContent.innerHTML = `
                <h2>Your Cart is Empty</h2>
                <p>Add some products before proceeding to checkout.</p>
                <button id="closeModal">Close</button>
            `;
    
            // Close Modal Event
            document.getElementById("closeModal").addEventListener("click", function () {
                modal.style.display = "none";
            });
    
            return;
        }
    
        // If cart has items, show order summary
        cart.forEach(item => {
            let itemDetail = document.createElement("p");
            itemDetail.textContent = `${item.name} x ${item.quantity} = RS. ${item.price * item.quantity}`;
            orderDetails.appendChild(itemDetail);
        });
    
        // Set Total
        orderTotal.textContent = `${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}`;
    
        // Confirm Order
        confirmButton.onclick = function () {
            modalContent.innerHTML = `
                <h2>Order Confirmed!</h2>
                <p>Thank you for shopping with us. Your order has been placed successfully.</p>
                <button id="closeModal">Close</button>
            `;
    
            clearCart(); // Function to clear cart items
    
            // Close modal after confirmation
            document.getElementById("closeModal").addEventListener("click", function () {
                modal.style.display = "none";
            });
        };
    
        // Close Modal Button Functionality
        closeButton.addEventListener("click", function () {
            modal.style.display = "none";
        });
    };
    

    window.filterCategory = function (category) {
        renderProducts(category);
    };

    window.toggleCart = function () {
        if (window.innerWidth > 768) {
            cartPanel.classList.toggle("show-right");
        } else {
            cartPanel.classList.toggle("show-bottom");
        }
    };

    closeCartBtn.addEventListener("click", () => {
        cartPanel.classList.remove("show-right", "show-bottom");
    });

    renderProducts();
    renderCart();
});
