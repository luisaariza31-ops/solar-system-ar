
const startButton = document.getElementById("start-button");
const exitButton = document.getElementById("exit-button");

const welcomeScreen = document.getElementById("welcome-screen");
const arContainer = document.getElementById("ar-container");
const scene = document.querySelector("a-scene");

const scanInstructions = document.getElementById("scan-instructions");
const scanStatus = document.getElementById("scan-status");
const selectionMessage = document.getElementById("selection-message");

const planetCards = document.querySelectorAll(".planet-card");

const planets = [
    { index: 0, name: "EARTH" },
    { index: 1, name: "MARS" },
    { index: 2, name: "JUPITER" },
    { index: 3, name: "SATURN" }
];

let selectedPlanetIndex = 0;

// Show or hide MindAR scanner
function showScanner(show) {
    const scannerElements = document.querySelectorAll(".mindar-ui-overlay");

    scannerElements.forEach(function (element) {
        element.style.visibility = show ? "visible" : "hidden";
    });
}

// Update scan messages
function updateScanMessage(message, detected) {
    scanStatus.textContent = message;

    if (detected) {
        scanStatus.classList.add("detected");
    } else {
        scanStatus.classList.remove("detected");
    }
}

// Show only the selected planet
function updatePlanetVisibility() {

    planets.forEach(function (planet) {

        const target = document.querySelector(
            '[mindar-image-target="targetIndex: ' + planet.index + '"]'
        );

        if (target) {

            const content = target.querySelector(".planet-content");

            if (content) {

                const isSelected =
                    planet.index === selectedPlanetIndex;

                content.setAttribute("visible", isSelected);
            }
        }
    });
}

// Select a planet
function preparePlanetSelection() {

    planetCards.forEach(function (card) {

        card.addEventListener("click", function () {

            selectedPlanetIndex = Number(card.dataset.planet);

            const selectedPlanet = planets[selectedPlanetIndex];

            planetCards.forEach(function (otherCard) {
                otherCard.classList.remove("selected");
            });

            card.classList.add("selected");

            selectionMessage.textContent =
                "Selected planet: " + selectedPlanet.name;

            console.log("Selected planet:", selectedPlanet.name);
        });
    });
}

// Detect planets
function preparePlanetRecognition() {

    planets.forEach(function (planet) {

        const target = document.querySelector(
            '[mindar-image-target="targetIndex: ' + planet.index + '"]'
        );

        if (target) {

            target.addEventListener("targetFound", function () {

                // Always hide the planets that were not selected
                updatePlanetVisibility();

                if (planet.index === selectedPlanetIndex) {

                    updateScanMessage(
                        planet.name + " detected!",
                        true
                    );

                } else {

                    updateScanMessage(
                        "Please scan the " +
                        planets[selectedPlanetIndex].name +
                        " card.",
                        false
                    );
                }
            });

            target.addEventListener("targetLost", function () {

                // Keep the visibility of only the selected planet
                updatePlanetVisibility();

                updateScanMessage(
                    "Searching for " +
                    planets[selectedPlanetIndex].name +
                    "...",
                    false
                );
            });
        }
    });
}

// Prepare AR
function prepareAR() {

    preparePlanetSelection();
    preparePlanetRecognition();

    // Start AR
    startButton.addEventListener("click", async function () {

        startButton.disabled = true;

        welcomeScreen.style.display = "none";
        arContainer.classList.add("ar-visible");
        exitButton.style.display = "block";

        const selectedPlanet = planets[selectedPlanetIndex];

        scanInstructions.textContent =
            "Point your camera at the " +
            selectedPlanet.name +
            " card";

        updateScanMessage(
            "Searching for " + selectedPlanet.name + "...",
            false
        );

        // Set visibility before starting the camera
        updatePlanetVisibility();

        showScanner(true);

        try {

            const arSystem = scene.systems["mindar-image-system"];

            await arSystem.start();

            console.log("AR started successfully");

        } catch (error) {

            console.error("AR start error:", error);

            showScanner(false);

            arContainer.classList.remove("ar-visible");
            exitButton.style.display = "none";
            welcomeScreen.style.display = "block";
            startButton.disabled = false;
        }
    });

    // Exit AR
    exitButton.addEventListener("click", function () {

        try {

            const arSystem = scene.systems["mindar-image-system"];

            arSystem.stop();

            console.log("AR stopped successfully");

        } catch (error) {

            console.error("AR stop error:", error);

        } finally {

            showScanner(false);

            arContainer.classList.remove("ar-visible");
            exitButton.style.display = "none";

            welcomeScreen.style.display = "block";
            startButton.disabled = false;

            updatePlanetVisibility();

            updateScanMessage(
                "Searching for " +
                planets[selectedPlanetIndex].name +
                "...",
                false
            );
        }
    });
}

// Wait until A-Frame is loaded
if (scene.hasLoaded) {
    prepareAR();
} else {
    scene.addEventListener("loaded", prepareAR, { once: true });
}

// Hide scanner initially
showScanner(false);
