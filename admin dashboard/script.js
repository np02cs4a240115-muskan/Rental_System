// ===========================
// MENU ACTIVE
// ===========================

const menuItems = document.querySelectorAll(".menu li");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(li => li.classList.remove("active"));

        item.classList.add("active");

    });

});


// ===========================
// TOGGLE BUTTONS
// ===========================

const toggleBtns = document.querySelectorAll(".toggle-buttons button");

toggleBtns.forEach(btn => {

    btn.addEventListener("click", () => {

        toggleBtns.forEach(button => {
            button.classList.remove("active-btn");
        });

        btn.classList.add("active-btn");

    });

});


// ===========================
// SEARCH
// ===========================

const searchInput = document.querySelector(".search-box input");

searchInput.addEventListener("keyup", () => {

    console.log("Searching:", searchInput.value);

});


// ===========================
// APPROVE / REVIEW / REJECT
// ===========================

const approveButtons = document.querySelectorAll(".approve");
const reviewButtons = document.querySelectorAll(".review");
const rejectButtons = document.querySelectorAll(".reject");

approveButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert("User Approved");

    });

});

reviewButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert("Review Opened");

    });

});

rejectButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        alert("User Rejected");

    });

});