// ShopPulse - Application Foundation

const SHOPPULSE_STORAGE_KEY = "shoppulse_survey_responses";
const SHOPPULSE_USER_KEY = "shoppulse_current_user";

function getSurveyResponses() {
    try {
        return JSON.parse(localStorage.getItem(SHOPPULSE_STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Unable to load survey responses:", error);
        return [];
    }
}

function saveSurveyResponses(responses) {
    localStorage.setItem(
        SHOPPULSE_STORAGE_KEY,
        JSON.stringify(responses)
    );
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(SHOPPULSE_USER_KEY));
    } catch (error) {
        return null;
    }
}

function logoutUser() {
    localStorage.removeItem(SHOPPULSE_USER_KEY);
    window.location.href = "index.html";
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

console.log("ShopPulse initialized.");
