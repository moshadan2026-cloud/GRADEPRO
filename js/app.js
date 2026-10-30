/* =====================================
   GRADEPRO - MAIN APPLICATION
   ASSESS · ANALYSE · ACHIEVE
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    // 1. MOBILE SIDEBAR NAVIGATION

    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("menuButton");

    if (sidebar && menuButton) {

        menuButton.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });

        // Close sidebar when clicking outside it
        document.addEventListener("click", function (event) {

            const clickedOutside =
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target);

            if (window.innerWidth <= 700 && clickedOutside) {
                sidebar.classList.remove("open");
            }

        });

    }


    // 2. ACADEMIC PERFORMANCE CHART

    const performanceCanvas =
        document.getElementById("performanceChart");

    if (performanceCanvas && typeof Chart !== "undefined") {

        new Chart(performanceCanvas, {

            type: "line",

            data: {

                labels: [
                    "Term 1",
                    "Term 2",
                    "Term 3"
                ],

                datasets: [{

                    label: "Average Performance (%)",

                    data: [65, 72, 78],

                    borderColor: "#123B73",

                    backgroundColor: "rgba(18, 59, 115, 0.10)",

                    borderWidth: 3,

                    tension: 0.4,

                    fill: true,

                    pointBackgroundColor: "#2563EB",

                    pointRadius: 5

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        max: 100,

                        ticks: {
                            callback: function (value) {
                                return value + "%";
                            }
                        }

                    }

                }

            }

        });

    }


    // 3. GRADE DISTRIBUTION CHART

    const gradeCanvas =
        document.getElementById("gradeChart");

    if (gradeCanvas && typeof Chart !== "undefined") {

        new Chart(gradeCanvas, {

            type: "doughnut",

            data: {

                labels: [
                    "A",
                    "B",
                    "C",
                    "D",
                    "E"
                ],

                datasets: [{

                    data: [15, 25, 30, 20, 10],

                    backgroundColor: [
                        "#123B73",
                        "#2563EB",
                        "#60A5FA",
                        "#93C5FD",
                        "#CBD5E1"
                    ],

                    borderWidth: 2,

                    borderColor: "#FFFFFF"

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }

                    }

                }

            }

        });

    }


    // 4. DASHBOARD INITIALIZATION

    console.log(
        "GRADEPRO dashboard initialized successfully."
    );

    console.log(
        "Dashboard charts currently display demonstration data."
    );

});
