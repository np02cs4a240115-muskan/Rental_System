function resetPassword() {
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (newPass === "" || confirmPass === "") {
        message.style.color = "red";
        message.innerText = "Please fill all fields!";
        return;
    }

    if (newPass.length < 6) {
        message.style.color = "red";
        message.innerText = "Password must be at least 6 characters!";
        return;
    }

    if (newPass !== confirmPass) {
        message.style.color = "red";
        message.innerText = "Passwords do not match!";
        return;
    }

    message.style.color = "green";
    message.innerText = "Password reset successful!";
}