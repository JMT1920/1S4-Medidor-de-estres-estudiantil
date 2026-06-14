const STORAGE_KEY = "stressData";

const STRESS_LEVELS = [
    { key: "low", label: "Bajo", chartLabel: "Estres Bajo" },
    { key: "moderate", label: "Moderado", chartLabel: "Estres Moderado" },
    { key: "high", label: "Alto", chartLabel: "Estres Alto" }
];

const GRADE_LABELS = ["Septimo", "Octavo", "Noveno", "Decimo", "Undecimo"];

const GRADE_COLORS = [
    "#22C55E",
    "#388AD6",
    "#F59E0B",
    "#EF4444",
    "#7C4DFF"
];

const AGE_COLORS = [
    "#22C55E",
    "#388AD6",
    "#F59E0B",
    "#EF4444",
    "#7C4DFF",
    "#14B8A6",
    "#A855F7"
];

const charts = {};
let lastSavedData = "";

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getStressData() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return [];
    }

    try {
        const parsedData = JSON.parse(savedData);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("No se pudo leer stressData:", error);
        return [];
    }
}

function normalizeStressLevel(level) {
    const normalizedLevel = normalizeText(level);

    if (normalizedLevel === "bajo") {
        return "Bajo";
    }

    if (normalizedLevel === "moderado") {
        return "Moderado";
    }

    if (normalizedLevel === "alto") {
        return "Alto";
    }

    return "";
}

function getRecordStressLevel(record) {
    return record.level || record.nivel || "";
}

function getRecordGrade(record) {
    return record.grade || record.seccion || "";
}

function getRecordAge(record) {
    return record.age || record.edad || "";
}

function normalizeGrade(grade) {
    const normalizedGrade = normalizeText(grade);

    const gradeNames = {
        septimo: "Septimo",
        octavo: "Octavo",
        noveno: "Noveno",
        decimo: "Decimo",
        undecimo: "Undecimo"
    };

    return gradeNames[normalizedGrade] || "";
}

function getStressPercentages(stressData) {
    const total = stressData.length;
    const counters = {
        Bajo: 0,
        Moderado: 0,
        Alto: 0
    };

    stressData.forEach((record) => {
        const level = normalizeStressLevel(getRecordStressLevel(record));

        if (level) {
            counters[level]++;
        }
    });

    if (total === 0) {
        return {
            low: 0,
            moderate: 0,
            high: 0
        };
    }

    return {
        low: Math.round((counters.Bajo / total) * 100),
        moderate: Math.round((counters.Moderado / total) * 100),
        high: Math.round((counters.Alto / total) * 100)
    };
}

function getGradeDistribution(stressData, level) {
    const distribution = {};

    GRADE_LABELS.forEach((grade) => {
        distribution[grade] = 0;
    });

    stressData.forEach((record) => {
        const recordLevel = normalizeStressLevel(getRecordStressLevel(record));
        const recordGrade = normalizeGrade(getRecordGrade(record));

        if (recordLevel === level && recordGrade) {
            distribution[recordGrade]++;
        }
    });

    return distribution;
}

function getAgeDistribution(stressData, level) {
    const distribution = {};

    stressData.forEach((record) => {
        const recordLevel = normalizeStressLevel(getRecordStressLevel(record));
        const age = Number(getRecordAge(record));

        if (recordLevel === level && age) {
            const ageLabel = `${age} años`;
            distribution[ageLabel] = (distribution[ageLabel] || 0) + 1;
        }
    });

    return distribution;
}

function hasDistributionData(distribution) {
    return Object.values(distribution).some((value) => value > 0);
}

function createPieChart(canvasId, distribution, colors) {
    const canvas = document.getElementById(canvasId);
    const emptyMessage = document.getElementById(canvasId.replace("chart", "empty"));
    const rawLabels = Object.keys(distribution);
    const values = Object.values(distribution);
    const hasData = hasDistributionData(distribution);
    const total = values.reduce((sum, value) => sum + value, 0);
    const labels = rawLabels.map((label, index) => {
        const percentage = total === 0
            ? 0
            : Math.round((values[index] / total) * 100);

        return `${label}: ${percentage}%`;
    });

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    canvas.classList.toggle("hidden", !hasData);
    emptyMessage.classList.toggle("hidden", hasData);

    if (!hasData) {
        return;
    }

    if (typeof Chart === "undefined") {
        canvas.classList.add("hidden");
        emptyMessage.classList.remove("hidden");
        emptyMessage.textContent = "Chart.js no esta disponible.";
        return;
    }

    charts[canvasId] = new Chart(canvas, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: "#FFFFFF",
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        boxWidth: 14,
                        boxHeight: 14,
                        color: "#1F2937",
                        font: {
                            family: "Inter",
                            size: 12,
                            weight: "600"
                        }
                    }
                }
            }
        }
    });
}

function updateSummaryCards(stressData) {
    const percentages = getStressPercentages(stressData);

    document.getElementById("total-students").textContent = stressData.length;
    document.getElementById("low-percent").textContent = `${percentages.low}%`;
    document.getElementById("moderate-percent").textContent = `${percentages.moderate}%`;
    document.getElementById("high-percent").textContent = `${percentages.high}%`;
    document
        .getElementById("empty-message")
        .classList.toggle("hidden", stressData.length > 0);
}

function updateCharts(stressData) {
    STRESS_LEVELS.forEach((level) => {
        createPieChart(
            `grade-${level.key}-chart`,
            getGradeDistribution(stressData, level.label),
            GRADE_COLORS
        );

        createPieChart(
            `age-${level.key}-chart`,
            getAgeDistribution(stressData, level.label),
            AGE_COLORS
        );
    });
}

function renderStats() {
    const stressData = getStressData();

    updateSummaryCards(stressData);
    updateCharts(stressData);
}

function refreshStatsIfDataChanged() {
    const currentSavedData = localStorage.getItem(STORAGE_KEY) || "";

    if (currentSavedData === lastSavedData) {
        return;
    }

    lastSavedData = currentSavedData;
    renderStats();
}

lastSavedData = localStorage.getItem(STORAGE_KEY) || "";
renderStats();

window.addEventListener("storage", refreshStatsIfDataChanged);
setInterval(refreshStatsIfDataChanged, 1000);
