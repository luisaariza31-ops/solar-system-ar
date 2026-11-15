
const startButton = document.getElementById("start-button");
const exitButton = document.getElementById("exit-button");

const welcomeScreen = document.getElementById("welcome-screen");
const arContainer = document.getElementById("ar-container");
const scene = document.querySelector("a-scene");

// Controla la visibilidad del escáner de MindAR
function showScanner(show) {
    const scannerElements = document.querySelectorAll(".mindar-ui-overlay");

    scannerElements.forEach(function (element) {
        element.style.visibility = show ? "visible" : "hidden";
    });
}

function prepareAR() {

    // Start AR
    startButton.addEventListener("click", async function () {

        startButton.disabled = true;

        welcomeScreen.style.display = "none";
        arContainer.classList.add("ar-visible");
        exitButton.style.display = "block";

        // Mostrar el escáner
        showScanner(true);

        try {
            const arSystem = scene.systems["mindar-image-system"];

            await arSystem.start();

            console.log("AR started successfully");

        } catch (error) {
            console.error("AR start error:", error);

            arContainer.classList.remove("ar-visible");
            exitButton.style.display = "none";
            welcomeScreen.style.display = "block";
            startButton.disabled = false;

            showScanner(false);
        }
    });

    // Exit AR
    exitButton.addEventListener("click", async function () {

        console.log("Exit button clicked");

        try {
            const arSystem = scene.systems["mindar-image-system"];

            arSystem.stop();

            console.log("AR stopped successfully");

        } catch (error) {
            console.error("AR stop error:", error);

        } finally {

            // Ocultar el escáner
            showScanner(false);

            // Ocultar la cámara y la escena
            arContainer.classList.remove("ar-visible");

            // Ocultar el botón Exit
            exitButton.style.display = "none";

            // Volver a la pantalla inicial
            welcomeScreen.style.display = "block";
            startButton.disabled = false;
        }
    });
}

// Esperar a que A-Frame cargue
if (scene.hasLoaded) {
    prepareAR();
} else {
    scene.addEventListener("loaded", prepareAR, { once: true });
}

// Ocultar el escáner al iniciar la página
showScanner(false);
