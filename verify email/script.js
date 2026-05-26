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
// SEND OTP
// ===============================

sendOtpBtn.addEventListener("click", () => {

    const email = emailInput.value.trim();

    if(email === ""){

        alert("Please enter your Gmail");
        return;

    }

    generatedOTP = generateOTP();

    // EMAILJS SEND
    emailjs.send("service_59gbgap", "029780", {

        to_email: email,
        otp_code: generatedOTP

    }).then(() => {

        alert("OTP Sent Successfully!");

        startTimer();

    }).catch((error) => {

        alert("Failed to send OTP");
        console.log(error);

    });

});

// ===============================
// VERIFY OTP
// ===============================

verifyBtn.addEventListener("click", () => {

    let enteredOTP = "";

    otpInputs.forEach(input => {

        enteredOTP += input.value;

    });

    if(enteredOTP === generatedOTP){

        alert("OTP Verified Successfully!");

    }else{

        alert("Invalid OTP");

    }

});

// ===============================
// AUTO NEXT INPUT
// ===============================

otpInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        if(input.value.length === 1){

            if(index < otpInputs.length - 1){

                otpInputs[index + 1].focus();

            }

        }

    });

});

// ===============================
// TIMER
// ===============================

function startTimer(){

    clearInterval(timer);

    countdown = 60;

    timer = setInterval(() => {

        timerText.innerText = `Resend OTP in ${countdown}s`;

        countdown--;

        if(countdown < 0){

            clearInterval(timer);

            timerText.innerText = "You can resend OTP now";

        }

    },1000);

}

// ===============================
// RESEND OTP
// ===============================

resendBtn.addEventListener("click", () => {

    sendOtpBtn.click();

});