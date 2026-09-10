const charts = {};

const standardPlatforms = [
    "Jumia",
    "Amazon",
    "Kilimall",
    "Carrefour",
    "AliExpress",
    "eBay",
    "Oraimo"
];

async function getSupabaseResponses() {
    try {
        const { data, error } = await supabaseClient
            .from("survey_responses")
            .select("*")
            .order("submitted_at", { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];

    } catch (error) {
        console.error("Unable to load survey responses from Supabase:", error);
        return [];
    }
}

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

function createBarChart(id, labels, data, label, max = 5) {
    const canvas = document.getElementById(id);

    if (!canvas) {
        return;
    }

    destroyChart(id);

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
                    (_, index) =>
                        barColors[index % barColors.length]
                ),

                borderColor: labels.map(
                    (_, index) =>
                        barColors[index % barColors.length]
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
                    max: max
                }
            }
        }
    });
}

function createRecommendationChart(id, labels, data) {
    createBarChart(
        id,
        labels,
        data,
        "Recommendation Rate",
        100
    );

    if (charts[id]) {
        charts[id].options.scales.y.ticks = {
            callback: function(value) {
                return value + "%";
            }
        };

        charts[id].update();
    }
}

function calculateAverage(responses, field, platform) {
    const filtered = responses.filter(response =>
        response.shopping_platform === platform &&
        Number(response[field]) > 0
    );

    if (!filtered.length) {
        return 0;
    }

    const total = filtered.reduce(
        (sum, response) =>
            sum + Number(response[field]),
        0
    );

    return Number(
        (total / filtered.length).toFixed(2)
    );
}

function calculateTextAverage(responses, field, platform) {
    const values = {
        "Very Satisfied": 5,
        "Satisfied": 4,
        "Neutral": 3,
        "Dissatisfied": 2,
        "Very Dissatisfied": 1,

        "Very Fair": 5,
        "Fair": 4,
        "Neutral": 3,
        "Unfair": 2,
        "Very Unfair": 1
    };

    const filtered = responses
        .filter(response =>
            response.shopping_platform === platform &&
            response[field]
        )
        .map(response =>
            values[String(response[field]).trim()] || 0
        )
        .filter(value => value > 0);

    if (!filtered.length) {
        return 0;
    }

    const total = filtered.reduce(
        (sum, value) => sum + value,
        0
    );

    return Number(
        (total / filtered.length).toFixed(2)
    );
}

function calculateRecommendationRate(responses, platform) {
    const filtered = responses.filter(
        response =>
            response.shopping_platform === platform
    );

    if (!filtered.length) {
        return 0;
    }

    const recommended = filtered.filter(
        response =>
            String(response.recommendation || "")
                .toLowerCase()
                .includes("yes")
    ).length;

    return Number(
        ((recommended / filtered.length) * 100).toFixed(1)
    );
}

function calculateSpeedScore(responses, platform) {
    const values = {
        "Very Fast": 5,
        "Fast": 4,
        "Average": 3,
        "Slow": 2,
        "Very Slow": 1
    };

    const filtered = responses
        .filter(response =>
            response.shopping_platform === platform &&
            response.delivery_speed
        )
        .map(response =>
            values[String(response.delivery_speed).trim()] || 0
        )
        .filter(value => value > 0);

    if (!filtered.length) {
        return 0;
    }

    const total = filtered.reduce(
        (sum, value) => sum + value,
        0
    );

    return Number(
        (total / filtered.length).toFixed(2)
    );
}

function updateSummary(responses, platforms) {
    const totalElement =
        document.getElementById("totalResponses");

    if (totalElement) {
        totalElement.textContent = responses.length;
    }

    const platformElement =
        document.getElementById("platformCount");

    if (platformElement) {
        const activePlatforms = platforms.filter(platform =>
            responses.some(
                response =>
                    response.shopping_platform === platform
            )
        );

        platformElement.textContent =
            activePlatforms.length;
    }

    const overallAverageElement =
        document.getElementById("overallAverage");

    if (overallAverageElement) {
        const ratings = responses
            .map(response => Number(response.experience_rating))
            .filter(value => value > 0);

        const average = ratings.length
            ? ratings.reduce((sum, value) => sum + value, 0) /
              ratings.length
            : 0;

        overallAverageElement.textContent =
            average.toFixed(1);
    }

    const recommendationElement =
        document.getElementById("recommendationRate");

    if (recommendationElement) {
        const recommended = responses.filter(
            response =>
                String(response.recommendation || "")
                    .toLowerCase()
                    .includes("yes")
        ).length;

        const rate = responses.length
            ? (recommended / responses.length) * 100
            : 0;

        recommendationElement.textContent =
            rate.toFixed(1) + "%";
    }
}

function updateHighlights(responses, platforms) {
    const platformScores = platforms
        .map(platform => ({
            platform,
            score: calculateAverage(
                responses,
                "experience_rating",
                platform
            )
        }))
        .filter(item => item.score > 0);

    const topPlatform = platformScores.sort(
        (a, b) => b.score - a.score
    )[0];

    const topPlatformElement =
        document.getElementById("topPlatform");

    const topPlatformScoreElement =
        document.getElementById("topPlatformScore");

    if (topPlatform) {
        topPlatformElement.textContent =
            topPlatform.platform;

        topPlatformScoreElement.textContent =
            `${topPlatform.score.toFixed(2)} / 5 average experience rating`;
    }

    const areas = [
        {
            name: "Experience",
            field: "experience_rating",
            numeric: true
        },
        {
            name: "Delivery",
            field: "delivery_rating",
            numeric: true
        },
        {
            name: "Support",
            field: "support_rating",
            numeric: true
        },
        {
            name: "Product Satisfaction",
            field: "product_satisfaction",
            numeric: false
        },
        {
            name: "Pricing Fairness",
            field: "pricing_fairness",
            numeric: false
        }
    ];

    const areaScores = areas.map(area => {
        const values = responses
            .map(response => {
                if (area.numeric) {
                    return Number(response[area.field]);
                }

                const valuesMap = {
                    "Very Satisfied": 5,
                    "Satisfied": 4,
                    "Neutral": 3,
                    "Dissatisfied": 2,
                    "Very Dissatisfied": 1,
                    "Very Fair": 5,
                    "Fair": 4,
                    "Unfair": 2,
                    "Very Unfair": 1
                };

                return valuesMap[
                    String(response[area.field] || "").trim()
                ] || 0;
            })
            .filter(value => value > 0);

        const average = values.length
            ? values.reduce((sum, value) => sum + value, 0) /
              values.length
            : 0;

        return {
            name: area.name,
            score: average
        };
    }).filter(area => area.score > 0);

    if (areaScores.length) {
        const strongest = [...areaScores].sort(
            (a, b) => b.score - a.score
        )[0];

        const weakest = [...areaScores].sort(
            (a, b) => a.score - b.score
        )[0];

        const strongestElement =
            document.getElementById("strongestArea");

        const strongestScoreElement =
            document.getElementById("strongestAreaScore");

        const weakestElement =
            document.getElementById("weakestArea");

        const weakestScoreElement =
            document.getElementById("weakestAreaScore");

        if (strongestElement) {
            strongestElement.textContent =
                strongest.name;
        }

        if (strongestScoreElement) {
            strongestScoreElement.textContent =
                `${strongest.score.toFixed(2)} / 5 average score`;
        }

        if (weakestElement) {
            weakestElement.textContent =
                weakest.name;
        }

        if (weakestScoreElement) {
            weakestScoreElement.textContent =
                `${weakest.score.toFixed(2)} / 5 average score`;
        }
    }
}

function updateComparisonTable(responses, platforms) {
    const tableBody =
        document.querySelector("#comparisonTable tbody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    platforms.forEach(platform => {
        const platformResponses =
            responses.filter(
                response =>
                    response.shopping_platform === platform
            );

        const row =
            document.createElement("tr");

        const experience =
            calculateAverage(
                responses,
                "experience_rating",
                platform
            );

        const product =
            calculateTextAverage(
                responses,
                "product_satisfaction",
                platform
            );

        const delivery =
            calculateAverage(
                responses,
                "delivery_rating",
                platform
            );

        const pricing =
            calculateTextAverage(
                responses,
                "pricing_fairness",
                platform
            );

        const support =
            calculateAverage(
                responses,
                "support_rating",
                platform
            );

        const recommendation =
            calculateRecommendationRate(
                responses,
                platform
            );

        row.innerHTML = `
            <td>${platform}</td>
            <td>${platformResponses.length}</td>
            <td>${experience || "—"}</td>
            <td>${product || "—"}</td>
            <td>${delivery || "—"}</td>
            <td>${pricing || "—"}</td>
            <td>${support || "—"}</td>
            <td>${recommendation}%</td>
        `;

        tableBody.appendChild(row);
    });
}

function updateInsights(responses, platforms) {
    const container =
        document.getElementById("insightsList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!responses.length) {
        return;
    }

    const insights = [];

    const platformCounts = platforms
        .map(platform => ({
            platform,
            count: responses.filter(
                response =>
                    response.shopping_platform === platform
            ).length
        }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);

    if (platformCounts.length) {
        insights.push(
            `${platformCounts[0].platform} has the highest number of responses with ${platformCounts[0].count} response${platformCounts[0].count === 1 ? "" : "s"}.`
        );
    }

    const experienceRatings = responses
        .map(response => Number(response.experience_rating))
        .filter(value => value > 0);

    if (experienceRatings.length) {
        const average =
            experienceRatings.reduce(
                (sum, value) => sum + value,
                0
            ) / experienceRatings.length;

        insights.push(
            `The overall customer experience rating is ${average.toFixed(2)} out of 5.`
        );
    }

    const recommended =
        responses.filter(response =>
            String(response.recommendation || "")
                .toLowerCase()
                .includes("yes")
        ).length;

    const recommendationRate =
        (recommended / responses.length) * 100;

    insights.push(
        `${recommendationRate.toFixed(1)}% of respondents would recommend their selected shopping platform.`
    );

    const speedValues = {
        "Very Fast": 5,
        "Fast": 4,
        "Average": 3,
        "Slow": 2,
        "Very Slow": 1
    };

    const speeds = responses
        .map(response =>
            speedValues[
                String(response.delivery_speed || "").trim()
            ] || 0
        )
        .filter(value => value > 0);

    if (speeds.length) {
        const averageSpeed =
            speeds.reduce(
                (sum, value) => sum + value,
                0
            ) / speeds.length;

        let description = "average";

        if (averageSpeed >= 4) {
            description = "generally fast";
        } else if (averageSpeed <= 2) {
            description = "generally slow";
        }

        insights.push(
            `Delivery speed responses indicate that delivery is ${description} overall.`
        );
    }

    insights.forEach(text => {
        const item =
            document.createElement("div");

        item.className = "insight-item";

        item.textContent = text;

        container.appendChild(item);
    });
}

function showDashboard(responses) {
    const emptyState =
        document.getElementById("emptyState");

    const dashboard =
        document.getElementById("dashboard");

    if (responses.length > 0) {
        if (emptyState) {
            emptyState.style.display = "none";
        }

        if (dashboard) {
            dashboard.style.display = "block";
        }
    } else {
        if (emptyState) {
            emptyState.style.display = "block";
        }

        if (dashboard) {
            dashboard.style.display = "none";
        }
    }
}

function setupExportButtons(responses) {
    const csvButton =
        document.getElementById("csvButton");

    if (csvButton) {
        csvButton.onclick = function() {
            if (!responses.length) {
                alert("There are no responses to export.");
                return;
            }

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
                        `"${String(value ?? "")
                            .replace(/"/g, '""')}"`
                    ).join(",")
                )
                .join("\n");

            const blob =
                new Blob([csv], {
                    type: "text/csv;charset=utf-8;"
                });

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "shoppulse-survey-responses.csv";

            link.click();

            URL.revokeObjectURL(url);
        };
    }

    const excelButton =
        document.getElementById("excelButton");

    if (excelButton) {
        excelButton.onclick = function() {
            alert(
                "Excel export is not available in the browser-only version yet. Use Download CSV for now."
            );
        };
    }
}

async function initializeDashboard() {
    console.log("Loading shared responses from Supabase...");

    const responses =
        await getSupabaseResponses();

    console.log(
        "Total shared responses:",
        responses.length
    );

    const platforms = [
        ...new Set([
            ...standardPlatforms,

            ...responses
                .map(
                    response =>
                        response.shopping_platform
                )
                .filter(
                    platform =>
                        platform &&
                        platform.trim() !== ""
                )
        ])
    ];

    showDashboard(responses);

    updateSummary(
        responses,
        platforms
    );

    updateHighlights(
        responses,
        platforms
    );

    updateComparisonTable(
        responses,
        platforms
    );

    updateInsights(
        responses,
        platforms
    );

    const experienceData =
        platforms.map(platform =>
            calculateAverage(
                responses,
                "experience_rating",
                platform
            )
        );

    const deliveryData =
        platforms.map(platform =>
            calculateAverage(
                responses,
                "delivery_rating",
                platform
            )
        );

    const productData =
        platforms.map(platform =>
            calculateTextAverage(
                responses,
                "product_satisfaction",
                platform
            )
        );

    const pricingData =
        platforms.map(platform =>
            calculateTextAverage(
                responses,
                "pricing_fairness",
                platform
            )
        );

    const supportData =
        platforms.map(platform =>
            calculateAverage(
                responses,
                "support_rating",
                platform
            )
        );

    const recommendationData =
        platforms.map(platform =>
            calculateRecommendationRate(
                responses,
                platform
            )
        );

    const speedData =
        platforms.map(platform =>
            calculateSpeedScore(
                responses,
                platform
            )
        );

    createBarChart(
        "experienceChart",
        platforms,
        experienceData,
        "Average Experience Rating"
    );

    createBarChart(
        "deliveryChart",
        platforms,
        deliveryData,
        "Average Delivery Rating"
    );

    createBarChart(
        "productChart",
        platforms,
        productData,
        "Average Product Satisfaction"
    );

    createBarChart(
        "pricingChart",
        platforms,
        pricingData,
        "Average Pricing Fairness"
    );

    createBarChart(
        "supportChart",
        platforms,
        supportData,
        "Average Support Rating"
    );

    createRecommendationChart(
        "recommendationChart",
        platforms,
        recommendationData
    );

    createBarChart(
        "speedChart",
        platforms,
        speedData,
        "Average Delivery Speed",
        5
    );

    setupExportButtons(responses);

    console.log(
        "ShopPulse dashboard successfully loaded from Supabase."
    );
}

if (typeof supabaseClient !== "undefined") {
    initializeDashboard();
} else {
    console.error(
        "Supabase client is not available."
    );
}
