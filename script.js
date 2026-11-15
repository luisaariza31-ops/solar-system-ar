const startButton = document.getElementById("start-button");
const welcomeScreen = document.getElementById("welcome-screen");
const arContainer = document.getElementById("ar-container");
const scene = document.querySelector("a-scene");

// Wait until the AR scene is completely loaded
function prepareAR() {

    startButton.addEventListener("click", async function () {

        startButton.disabled = true;

        welcomeScreen.style.display = "none";

        arContainer.classList.add("ar-visible");

        try {
            const arSystem = scene.systems["mindar-image-system"];

            await arSystem.start();

            console.log("AR started successfully");

        } catch (error) {
            console.error("AR start error:", error);
        }

    });
}

if (scene.hasLoaded) {
    prepareAR();
} else {
    scene.addEventListener("loaded", prepareAR, { once: true });
}