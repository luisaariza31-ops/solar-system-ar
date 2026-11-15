
const startButton = document.getElementById("start-button");
const exitButton = document.getElementById("exit-button");

const welcomeScreen = document.getElementById("welcome-screen");
const arContainer = document.getElementById("ar-container");
const scene = document.querySelector("a-scene");

const scanInstructions = document.getElementById("scan-instructions");
const scanStatus = document.getElementById("scan-status");
const selectionMessage = document.getElementById("selection-message");

const planetCards = document.querySelectorAll(".planet-card");

// Available planets
const planets = [
    { index: 0, name: "EARTH" },
    { index: 1, name: "MARS" },
    { index: 2, name: "JUPITER" },
    { index: 3, name: "SATURN" }
];

// Selected planet is Earth by default
let selectedPlanetIndex = 0;

// Control scanner visibility
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

// Select which planet content can be displayed
function updatePlanetVisibility() {

    planets.forEach(function (planet) {

        const target = document.querySelector(
            '[mindar-image-target="targetIndex: ' + planet.index + '"]'
        );

        if (target) {

            // Only the selected planet can display its 3D content
            const isSelected = planet.index === selectedPlanetIndex;

            target.object3D.children.forEach(function (child) {
                child.visible = isSelected;
            });
        }
    });
}

// Select a planet from the menu
function preparePlanetSelection() {

    planetCards.forEach(function (card) {

        card.addEventListener("click", function () {

            selectedPlanetIndex = Number(card.dataset.planet);

            const selectedPlanet = planets[selectedPlanetIndex];

            // Remove selection from all cards
            planetCards.forEach(function (otherCard) {
                otherCard.classList.remove("selected");
            });

            // Highlight selected card
            card.classList.add("selected");

            // Update selection message
            selectionMessage.textContent =
                "Selected planet: " + selectedPlanet.name;

            console.log("Selected planet:", selectedPlanet.name);
        });
    });
}

// Listen for planet recognition
function preparePlanetRecognition() {

    planets.forEach(function (planet) {

        const target = document.querySelector(
            '[mindar-image-target="targetIndex: ' + planet.index + '"]'
        );

        if (target) {

            target.addEventListener("targetFound", function () {

                // Apply visibility rules to ALL planets
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

                // Do not make every planet visible again.
                // Keep only the selected planet visible.
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

// Start and exit AR
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

        // Hide all planets except the selected one
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

        console.log("Exit button clicked");

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

// Hide scanner at the beginning
showScanner(false);
