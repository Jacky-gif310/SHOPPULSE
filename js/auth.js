const SHOPPULSE_USERS_KEY = "shoppulse_demo_users";

function getUsers() {
    try {
        return JSON.parse(
            localStorage.getItem(SHOPPULSE_USERS_KEY)
        ) || [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        SHOPPULSE_USERS_KEY,
        JSON.stringify(users)
    );
}


/* ================================
   REGISTRATION
================================ */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");

        if (password !== confirmPassword) {

            message.className = "survey-message error";

            message.textContent =
                "Passwords do not match.";

            return;
        }

        const users = getUsers();

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {

            message.className = "survey-message error";

            message.textContent =
                "An account with this email already exists.";

            return;
        }

        const user = {
            id: Date.now(),
            name,
            email,
            password
        };

        users.push(user);

        saveUsers(users);

        message.className = "survey-message success";

        message.textContent =
            "Account created successfully. You can now log in.";

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    });
}


/* ================================
   LOGIN
================================ */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim().toLowerCase();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(
            account =>
                account.email === email &&
                account.password === password
        );

        if (!user) {

            message.className = "survey-message error";

            message.textContent =
                "Incorrect email or password.";

            return;
        }

        localStorage.setItem(
            SHOPPULSE_USER_KEY,
            JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            })
        );

        message.className = "survey-message success";

        message.textContent =
            `Welcome back, ${user.name}!`;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    });
}
