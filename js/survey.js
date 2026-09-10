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

    surveyForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const formData = new FormData(surveyForm);

        let selectedPlatform =
            formData.get("shopping_platform");

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
                ).trim()
        };

        surveyMessage.className = "survey-message";
        surveyMessage.textContent = "Submitting your response...";

        try {

            const { data, error } =
                await supabaseClient
                    .from("survey_responses")
                    .insert([response])
                    .select();

            if (error) {
                throw error;
            }

            surveyMessage.className =
                "survey-message success";

            surveyMessage.textContent =
                "? Thank you! Your survey response has been recorded successfully.";

            surveyForm.reset();

            if (otherPlatformContainer) {
                otherPlatformContainer.style.display = "none";
            }

            console.log(
                "Survey response saved to Supabase:",
                data
            );

        } catch (error) {

            console.error(
                "Supabase submission error:",
                error
            );

            surveyMessage.className =
                "survey-message error";

            surveyMessage.textContent =
                "Sorry, we could not record your response. Please try again.";
        }

        surveyMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}
