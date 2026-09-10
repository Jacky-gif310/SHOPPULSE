 // =========================================================
 // ShopPulse - Survey Engine
 // Supports standard platforms + custom "Other" platform
 // =========================================================

const surveyForm = document.getElementById("surveyForm");
const surveyMessage = document.getElementById("surveyMessage");

const otherPlatformRadio = document.getElementById("otherPlatformRadio");
const otherPlatformContainer = document.getElementById("otherPlatformContainer");
const otherPlatformInput = document.getElementById("otherPlatform");

if (otherPlatformRadio && otherPlatformContainer) {

    document.querySelectorAll('input[name="shopping_platform"]').forEach(radio => {

        radio.addEventListener("change", function () {

            if (otherPlatformRadio.checked) {

                otherPlatformContainer.style.display = "block";

                if (otherPlatformInput) {
                    otherPlatformInput.focus();
                }

            } else {

                otherPlatformContainer.style.display = "none";

                if (otherPlatformInput) {
                    otherPlatformInput.value = "";
                }
            }
        });
    });
}

if (surveyForm) {

    surveyForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const formData = new FormData(surveyForm);

        let selectedPlatform =
            formData.get("shopping_platform");

        // If Other is selected, use the custom platform name
        if (selectedPlatform === "Other") {

            const customPlatform =
                String(formData.get("other_platform") || "").trim();

            if (!customPlatform) {

                surveyMessage.className = "survey-message error";

                surveyMessage.textContent =
                    "Please enter the name of the shopping platform.";

                if (otherPlatformInput) {
                    otherPlatformInput.focus();
                }

                return;
            }

            selectedPlatform = customPlatform;
        }

        const response = {

            id: Date.now(),

            shopping_platform:
                selectedPlatform,

            experience_rating:
                Number(formData.get("experience_rating")),

            product_satisfaction:
                formData.get("product_satisfaction"),

            delivery_rating:
                Number(formData.get("delivery_rating")),

            recommendation:
                formData.get("recommendation"),

            shopping_frequency:
                formData.get("shopping_frequency"),

            pricing_fairness:
                formData.get("pricing_fairness"),

            support_rating:
                Number(formData.get("support_rating")),

            delivery_speed:
                formData.get("delivery_speed"),

            improvement_suggestions:
                String(
                    formData.get("improvement_suggestions") || ""
                ).trim(),

            submitted_at:
                new Date().toISOString()
        };

        // Get existing responses
        const responses = getSurveyResponses();

        // Add newest response
        responses.push(response);

        // Save locally
        saveSurveyResponses(responses);

        // Show success message
        surveyMessage.className =
            "survey-message success";

        surveyMessage.textContent =
            "✓ Thank you! Your survey response has been recorded successfully.";

        // Reset the form
        surveyForm.reset();

        // Hide Other field after reset
        if (otherPlatformContainer) {
            otherPlatformContainer.style.display = "none";
        }

        // Scroll to message
        surveyMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        console.log(
            "Survey response saved:",
            response
        );

        console.log(
            "Total responses:",
            responses.length
        );
    });
}
