const responses = getSurveyResponses();

const emptyState = document.getElementById("emptyState");
const dashboard = document.getElementById("dashboard");

let charts = {};

const standardPlatforms = [
    "Jumia",
    "Amazon",
    "Kilimall",
    "Carrefour",
    "AliExpress",
    "eBay",
    "Oraimo"
];

const platforms = [
    ...new Set([
        ...standardPlatforms,
        ...responses
            .map(response => response.shopping_platform)
            .filter(platform => platform && platform.trim() !== "")
    ])
];

function average(values) {
    const valid = values.filter(value => !isNaN(value));

    if (!valid.length) return 0;

    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function ratingValue(value) {
    return Number(value) || 0;
}

function platformResponses(platform) {
    return responses.filter(
        response => response.shopping_platform === platform
    );
}

function platformAverage(platform, field) {
    const data = platformResponses(platform);

    return average(
        data.map(response => ratingValue(response[field]))
    );
}

function percentage(values, target) {
    if (!values.length) return 0;

    return (
        values.filter(value => value === target).length /
        values.length
    ) * 100;
}

function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    charts = {};
}

function createBarChart(id, labels, data, label) {

    const canvas = document.getElementById(id);

    if (!canvas) return;

    const barColors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#17becf",
        "#bcbd22",
        "#7f7f7f"
    ];

    charts[id] = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: labels.map(
                    (_, index) => barColors[index % barColors.length]
                ),
                borderColor: labels.map(
                    (_, index) => barColors[index % barColors.length]
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

function createRecommendationChart() {

    const labels = platforms;

    const data = platforms.map(platform => {

        const platformData = platformResponses(platform);

        if (!platformData.length) return 0;

        return percentage(
            platformData.map(item => item.recommendation),
            "Yes"
        );
    });

    const canvas = document.getElementById("recommendationChart");

    if (!canvas) return;

    const barColors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#17becf",
        "#bcbd22",
        "#7f7f7f"
    ];

    charts.recommendation = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Recommendation Rate (%)",
                data,
                backgroundColor: labels.map(
                    (_, index) => barColors[index % barColors.length]
                ),
                borderColor: labels.map(
                    (_, index) => barColors[index % barColors.length]
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function createSpeedChart() {

    const speedMap = {
        "Very Fast": 5,
        "Fast": 4,
        "Average": 3,
        "Slow": 2,
        "Very Slow": 1
    };

    const data = platforms.map(platform => {

        const values = platformResponses(platform)
            .map(response => speedMap[response.delivery_speed])
            .filter(value => value);

        return average(values);
    });

    createBarChart(
        "speedChart",
        platforms,
        data,
        "Delivery Speed Score"
    );
}

function updateStats() {

    document.getElementById("totalResponses").textContent =
        responses.length;

    const activePlatforms = platforms.filter(
        platform => platformResponses(platform).length > 0
    );

    document.getElementById("platformCount").textContent =
        activePlatforms.length;

    const overallExperience = average(
        responses.map(response =>
            ratingValue(response.experience_rating)
        )
    );

    document.getElementById("overallAverage").textContent =
        overallExperience.toFixed(1);

    const recommendationRate = percentage(
        responses.map(response => response.recommendation),
        "Yes"
    );

    document.getElementById("recommendationRate").textContent =
        Math.round(recommendationRate) + "%";

    const platformScores = activePlatforms.map(platform => ({
        platform,
        score: platformAverage(platform, "experience_rating")
    }));

    platformScores.sort((a, b) => b.score - a.score);

    if (platformScores.length) {

        const top = platformScores[0];

        document.getElementById("topPlatform").textContent =
            top.platform;

        document.getElementById("topPlatformScore").textContent =
            `${top.score.toFixed(1)} / 5 average experience rating`;
    }
}

function updateHighlights() {

    const metrics = [
        {
            name: "Customer Experience",
            field: "experience_rating"
        },
        {
            name: "Product Satisfaction",
            field: "product_satisfaction"
        },
        {
            name: "Delivery",
            field: "delivery_rating"
        },
        {
            name: "Customer Support",
            field: "support_rating"
        }
    ];

    const metricScores = metrics.map(metric => {

        let values = [];

        responses.forEach(response => {

            if (metric.field === "product_satisfaction") {

                const map = {
                    "Very Satisfied": 5,
                    "Satisfied": 4,
                    "Neutral": 3,
                    "Dissatisfied": 2,
                    "Very Dissatisfied": 1
                };

                if (map[response.product_satisfaction]) {
                    values.push(map[response.product_satisfaction]);
                }

            } else {

                const value = ratingValue(response[metric.field]);

                if (value) values.push(value);
            }
        });

        return {
            name: metric.name,
            score: average(values)
        };
    });

    metricScores.sort((a, b) => b.score - a.score);

    if (metricScores.length) {

        const strongest = metricScores[0];
        const weakest = metricScores[metricScores.length - 1];

        document.getElementById("strongestArea").textContent =
            strongest.name;

        document.getElementById("strongestAreaScore").textContent =
            `${strongest.score.toFixed(1)} / 5 average score`;

        document.getElementById("weakestArea").textContent =
            weakest.name;

        document.getElementById("weakestAreaScore").textContent =
            `${weakest.score.toFixed(1)} / 5 average score`;
    }
}

function buildCharts() {

    destroyCharts();

    createBarChart(
        "experienceChart",
        platforms,
        platforms.map(platform =>
            platformAverage(platform, "experience_rating")
        ),
        "Average Experience"
    );

    createBarChart(
        "deliveryChart",
        platforms,
        platforms.map(platform =>
            platformAverage(platform, "delivery_rating")
        ),
        "Average Delivery Rating"
    );

    const productMap = {
        "Very Satisfied": 5,
        "Satisfied": 4,
        "Neutral": 3,
        "Dissatisfied": 2,
        "Very Dissatisfied": 1
    };

    createBarChart(
        "productChart",
        platforms,
        platforms.map(platform =>
            average(
                platformResponses(platform)
                    .map(response =>
                        productMap[response.product_satisfaction]
                    )
                    .filter(value => value)
            )
        ),
        "Product Satisfaction"
    );

    createBarChart(
        "supportChart",
        platforms,
        platforms.map(platform =>
            platformAverage(platform, "support_rating")
        ),
        "Support Rating"
    );

    const pricingMap = {
        "Very Fair": 5,
        "Fair": 4,
        "Neutral": 3,
        "Unfair": 2,
        "Very Unfair": 1
    };

    createBarChart(
        "pricingChart",
        platforms,
        platforms.map(platform =>
            average(
                platformResponses(platform)
                    .map(response =>
                        pricingMap[response.pricing_fairness]
                    )
                    .filter(value => value)
            )
        ),
        "Pricing Fairness"
    );

    createRecommendationChart();
    createSpeedChart();
}

function buildComparisonTable() {

    const tbody =
        document.querySelector("#comparisonTable tbody");

    tbody.innerHTML = "";

    platforms.forEach(platform => {

        const data = platformResponses(platform);

        if (!data.length) return;

        const recommendation = percentage(
            data.map(item => item.recommendation),
            "Yes"
        );

        const productMap = {
            "Very Satisfied": 5,
            "Satisfied": 4,
            "Neutral": 3,
            "Dissatisfied": 2,
            "Very Dissatisfied": 1
        };

        const pricingMap = {
            "Very Fair": 5,
            "Fair": 4,
            "Neutral": 3,
            "Unfair": 2,
            "Very Unfair": 1
        };

        const product = average(
            data.map(item => productMap[item.product_satisfaction])
                .filter(value => value)
        );

        const pricing = average(
            data.map(item => pricingMap[item.pricing_fairness])
                .filter(value => value)
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${platform}</strong></td>
            <td>${data.length}</td>
            <td>${platformAverage(platform, "experience_rating").toFixed(1)}</td>
            <td>${product.toFixed(1)}</td>
            <td>${platformAverage(platform, "delivery_rating").toFixed(1)}</td>
            <td>${pricing.toFixed(1)}</td>
            <td>${platformAverage(platform, "support_rating").toFixed(1)}</td>
            <td>${Math.round(recommendation)}%</td>
        `;

        tbody.appendChild(row);
    });
}

function generateInsights() {

    const container =
        document.getElementById("insightsList");

    container.innerHTML = "";

    if (!responses.length) return;

    const activePlatforms = platforms.filter(
        platform => platformResponses(platform).length
    );

    const scores = activePlatforms.map(platform => ({
        platform,
        score: platformAverage(platform, "experience_rating")
    }));

    scores.sort((a, b) => b.score - a.score);

    if (scores.length >= 2) {

        const best = scores[0];
        const lowest = scores[scores.length - 1];

        const difference =
            best.score - lowest.score;

        addInsight(
            `📊 ${best.platform} has the highest average customer experience rating at ${best.score.toFixed(1)}/5, while ${lowest.platform} has the lowest at ${lowest.score.toFixed(1)}/5.`
        );

        if (difference >= 1) {

            addInsight(
                `The gap between the highest and lowest rated platforms is ${difference.toFixed(1)} points, indicating a noticeable difference in customer experience.`
            );

        } else {

            addInsight(
                "Customer experience ratings are relatively close across the platforms represented in the current data."
            );
        }
    }

    const recommendationRate = percentage(
        responses.map(response => response.recommendation),
        "Yes"
    );

    if (recommendationRate >= 80) {

        addInsight(
            `👍 ${Math.round(recommendationRate)}% of respondents would recommend their selected shopping platform.`
        );

    } else if (recommendationRate >= 50) {

        addInsight(
            `ℹ️ ${Math.round(recommendationRate)}% of respondents would recommend their selected shopping platform, suggesting generally positive but mixed feedback.`
        );

    } else {

        addInsight(
            `⚠️ Only ${Math.round(recommendationRate)}% of respondents would recommend their selected shopping platform, suggesting an opportunity to improve customer experience.`
        );
    }

    const averages = [
        {
            name: "Experience",
            score: average(
                responses.map(r => ratingValue(r.experience_rating))
            )
        },
        {
            name: "Delivery",
            score: average(
                responses.map(r => ratingValue(r.delivery_rating))
            )
        },
        {
            name: "Support",
            score: average(
                responses.map(r => ratingValue(r.support_rating))
            )
        }
    ];

    averages.sort((a, b) => b.score - a.score);

    addInsight(
        `🔎 ${averages[0].name} is currently the strongest measured area with an average score of ${averages[0].score.toFixed(1)}/5.`
    );

    addInsight(
        `💡 These findings are based only on the responses currently stored in this browser and should be interpreted as sample feedback rather than a complete market-wide assessment.`
    );
}

function addInsight(text) {

    const item = document.createElement("div");

    item.className = "insight-item";

    item.textContent = text;

    document
        .getElementById("insightsList")
        .appendChild(item);
}

function downloadCSV() {

    if (!responses.length) return;

    const headers = [
        "Platform",
        "Experience Rating",
        "Product Satisfaction",
        "Delivery Rating",
        "Recommendation",
        "Shopping Frequency",
        "Pricing Fairness",
        "Support Rating",
        "Delivery Speed",
        "Improvement Suggestions",
        "Submitted At"
    ];

    const rows = responses.map(response => [
        response.shopping_platform,
        response.experience_rating,
        response.product_satisfaction,
        response.delivery_rating,
        response.recommendation,
        response.shopping_frequency,
        response.pricing_fairness,
        response.support_rating,
        response.delivery_speed,
        response.improvement_suggestions,
        response.submitted_at
    ]);

    const csv = [
        headers,
        ...rows
    ]
    .map(row =>
        row.map(value =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
    )
    .join("\n");

    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "shoppulse_survey_results.csv";

    link.click();

    URL.revokeObjectURL(url);
}

function downloadExcel() {

    if (!responses.length) return;

    let rows = `
        <table border="1">
            <tr>
                <th>Platform</th>
                <th>Experience Rating</th>
                <th>Product Satisfaction</th>
                <th>Delivery Rating</th>
                <th>Recommendation</th>
                <th>Shopping Frequency</th>
                <th>Pricing Fairness</th>
                <th>Support Rating</th>
                <th>Delivery Speed</th>
                <th>Improvement Suggestions</th>
                <th>Submitted At</th>
            </tr>
    `;

    responses.forEach(response => {

        rows += `
            <tr>
                <td>${response.shopping_platform}</td>
                <td>${response.experience_rating}</td>
                <td>${response.product_satisfaction}</td>
                <td>${response.delivery_rating}</td>
                <td>${response.recommendation}</td>
                <td>${response.shopping_frequency}</td>
                <td>${response.pricing_fairness}</td>
                <td>${response.support_rating}</td>
                <td>${response.delivery_speed}</td>
                <td>${response.improvement_suggestions}</td>
                <td>${response.submitted_at}</td>
            </tr>
        `;
    });

    rows += "</table>";

    const blob = new Blob(
        [rows],
        { type: "application/vnd.ms-excel" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "shoppulse_survey_report.xls";

    link.click();

    URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {

    if (!responses.length) {

        emptyState.style.display = "block";
        dashboard.style.display = "none";

        return;
    }

    emptyState.style.display = "none";
    dashboard.style.display = "block";

    updateStats();
    updateHighlights();
    buildCharts();
    buildComparisonTable();
    generateInsights();

    document
        .getElementById("csvButton")
        .addEventListener("click", downloadCSV);

    document
        .getElementById("excelButton")
        .addEventListener("click", downloadExcel);
});




