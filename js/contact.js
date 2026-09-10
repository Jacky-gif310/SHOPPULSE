const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();

        contactMessage.className = "survey-message success";
        contactMessage.textContent =
            `Thank you, ${name}! Your message has been received.`;

        contactForm.reset();

        contactMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}
