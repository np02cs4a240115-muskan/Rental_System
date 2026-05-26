// ===============================
// EMAILJS INIT
// ===============================

emailjs.init("hYHq9nBMHWRnK18nV");


// ===============================
// VARIABLES
// ===============================

const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyBtn = document.getElementById("verifyBtn");
const resendBtn = document.getElementById("resendBtn");

const emailInput = document.getElementById("email");

const otpInputs = document.querySelectorAll(".otp-input");

const timerText = document.getElementById("timerText");

let generatedOTP = "";
let countdown = 60;
let timer;


// ===============================
// GENERATE OTP
// ===============================

function generateOTP() {

    return Math.floor(100000 + Math.random() * 900000).toString();

}


// ===============================
// SEND OTP FUNCTION
// ===============================

function sendOTP() {

    const email = emailInput.value.trim();

    // VALIDATION
    if (email === "") {

        alert("Please enter your Gmail");
        return;

    }

    // EMAIL FORMAT CHECK
    if (!email.includes("@")) {

        alert("Please enter a valid email");
        return;

    }

    // GENERATE OTP
    generatedOTP = generateOTP();

    // BUTTON LOADING
    sendOtpBtn.innerText = "Sending...";
    sendOtpBtn.disabled = true;

    // ===============================
    // EMAILJS SEND
    // ===============================

    emailjs.send(
        "service_59gbgap",      // YOUR SERVICE ID
        "template_otp123",      // YOUR TEMPLATE ID
        {
            to_email: email,
            otp_code: generatedOTP
        }
    )

    .then(function(response) {

        console.log("SUCCESS!", response.status, response.text);

        alert("OTP Sent Successfully!");

        startTimer();

    })

    .catch(function(error) {

        console.log("FAILED...", error);

        alert("Failed to send OTP");

    })

    .finally(() => {

        sendOtpBtn.innerText = "Send OTP";
        sendOtpBtn.disabled = false;

    });

}


// ===============================
// SEND OTP BUTTON
// ===============================

sendOtpBtn.addEventListener("click", () => {

    sendOTP();

});


// ===============================
// VERIFY OTP
// ===============================

verifyBtn.addEventListener("click", () => {

    let enteredOTP = "";

    otpInputs.forEach(input => {

        enteredOTP += input.value;

    });

    // EMPTY CHECK
    if (enteredOTP.length < 6) {

        alert("Please enter complete OTP");
        return;

    }

    // VERIFY
    if (enteredOTP === generatedOTP) {

        alert("OTP Verified Successfully!");

    } else {

        alert("Invalid OTP");

    }

});


// ===============================
// AUTO NEXT INPUT
// ===============================

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        // ONLY NUMBERS
        input.value = input.value.replace(/[^0-9]/g, "");

        if (input.value.length === 1) {

            if (index < otpInputs.length - 1) {

                otpInputs[index + 1].focus();

            }

        }

    });

});


// ===============================
// TIMER
// ===============================

function startTimer() {

    clearInterval(timer);

    countdown = 60;

    timer = setInterval(() => {

        timerText.innerText = `Resend OTP in ${countdown}s`;

        countdown--;

        if (countdown < 0) {

            clearInterval(timer);

            timerText.innerText = "You can resend OTP now";

        }

    }, 1000);

}


// ===============================
// RESEND OTP
// ===============================

resendBtn.addEventListener("click", () => {

    sendOTP();

});