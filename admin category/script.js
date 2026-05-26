// ==========================
// TAB ACTIVE
// ==========================

const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(btn => btn.classList.remove("active"));
        tab.classList.add("active");

    });
});


// ==========================
// ADD CATEGORY
// ==========================

const addBtn = document.querySelector(".add-category-btn");
const categoriesContainer = document.querySelector(".categories");

addBtn.addEventListener("click", () => {

    const categoryName = prompt("Enter category name:");
    if (!categoryName) return;

    const categoryDescription = prompt("Enter short description:");
    if (!categoryDescription) return;

    const vehicles = prompt("Enter number of vehicles:");
    if (!vehicles) return;

    // CREATE CARD
    const card = document.createElement("div");
    card.classList.add("category-card");

    card.innerHTML = `
    
        <div class="category-left">

            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop" alt="">

            <div>
                <h3>${categoryName}</h3>
                <p>${categoryDescription}</p>
            </div>

        </div>

        <div class="category-middle">
            Newly added category.
        </div>

        <div class="vehicles-count">
            <h4>${vehicles}</h4>
            <span>VEHICLES</span>
        </div>

        <label class="switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
        </label>

        <div class="actions">
            <i class="fa-solid fa-pen edit-btn"></i>
            <i class="fa-regular fa-trash-can delete delete-btn"></i>
        </div>

    `;

    categoriesContainer.appendChild(card);

    addDeleteFunction();
    addEditFunction();

});


// ==========================
// DELETE CATEGORY
// ==========================

function addDeleteFunction() {

    const deleteButtons = document.querySelectorAll(".delete-btn, .delete");

    deleteButtons.forEach(button => {

        button.onclick = function () {

            const confirmDelete = confirm("Delete this category?");

            if (confirmDelete) {

                button.closest(".category-card").remove();

            }

        };

    });

}

addDeleteFunction();


// ==========================
// EDIT CATEGORY
// ==========================

function addEditFunction() {

    const editButtons = document.querySelectorAll(".edit-btn, .fa-pen");

    editButtons.forEach(button => {

        button.onclick = function () {

            const card = button.closest(".category-card");

            const title = card.querySelector("h3");
            const subtitle = card.querySelector(".category-left p");
            const vehicleCount = card.querySelector(".vehicles-count h4");

            // GET NEW VALUES
            const newTitle = prompt("Edit category name:", title.innerText);
            if (!newTitle) return;

            const newSubtitle = prompt("Edit description:", subtitle.innerText);
            if (!newSubtitle) return;

            const newVehicles = prompt("Edit vehicle count:", vehicleCount.innerText);
            if (!newVehicles) return;

            // UPDATE
            title.innerText = newTitle;
            subtitle.innerText = newSubtitle;
            vehicleCount.innerText = newVehicles;

        };

    });

}

addEditFunction();