// script.js

// ===========================
// SLIDER BUTTONS
// ===========================

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const container = document.getElementById("carsContainer");

nextBtn.addEventListener("click", () => {
  container.scrollBy({
    left: 350,
    behavior: "smooth"
  });
});

prevBtn.addEventListener("click", () => {
  container.scrollBy({
    left: -350,
    behavior: "smooth"
  });
});


// ===========================
// FIND YOUR RIDE BUTTON
// ===========================

const findRideBtn = document.querySelector(".search-box button");
const locationInput = document.querySelector(
  '.search-item input[type="text"]'
);

const dateInput = document.querySelector(
  '.search-item input[type="date"]'
);

findRideBtn.addEventListener("click", () => {

  const location = locationInput.value.trim();
  const date = dateInput.value;

  // Check location
  if (location === "") {
    alert("Please enter pickup location.");
    return;
  }

  // Check date
  if (date === "") {
    alert("Please select booking date.");
    return;
  }

  // Success message
  alert(
    `Booking Confirmed!\n\nLocation: ${location}\nDate: ${date}`
  );
});


// ===========================
// RENT NOW BUTTONS
// ===========================

const rentButtons = document.querySelectorAll(".price-row button");

rentButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const carName =
      button.closest(".car-card")
      .querySelector("h3").innerText;

    if (dateInput.value === "") {

      alert(`Please select booking date for ${carName}.`);

      return;
    }

    alert(
      `${carName} booked successfully for ${dateInput.value}`
    );

  });

});


// ===========================
// CTA BUTTONS
// ===========================

const exploreBtn = document.querySelector(".primary-btn");
const contactBtn = document.querySelector(".secondary-btn");

exploreBtn.addEventListener("click", () => {
  alert("Explore our premium vehicle collection.");
});

contactBtn.addEventListener("click", () => {
  alert("Customer support contacted successfully.");
});


// ===========================
// NAVIGATION BUTTONS
// ===========================

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach((link) => {

  link.addEventListener("click", (e) => {

    e.preventDefault();

    alert(`${link.innerText} page coming soon!`);

  });

});


// ===========================
// ACCOUNT BUTTON
// ===========================

const accountBtn = document.querySelector(".nav-btn");

accountBtn.addEventListener("click", () => {

  alert("Login / Signup feature coming soon!");

});