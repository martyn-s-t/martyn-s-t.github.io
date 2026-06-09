<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const activeNotes = defineModel("activeNotes");

const canvasElement = ref(null);
let canvasContext = null;
let animationFrameId = null;

const whiteKey = "white";
const whiteKeyDepressed = "rgba(255, 200, 0, 1)";
const blackKey = "black";
const blackKeyDepressed = "rgba(255, 220, 120, 1)";

// Resize canvas internal resolution to match CSS size
function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;
}

function animationLoop() {
    const canvas = canvasElement.value;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    const totalWhiteKeys = 52;
    const whiteKeyWidth = canvasWidth / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = canvasHeight * 0.6;

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let midi = 21; midi <= 108; midi++) {
        const note = midi % 12;
        const isBlackKey = [1, 3, 6, 8, 10].includes(note);

        if (!isBlackKey) {
            const xPosition = whiteKeyIndex * whiteKeyWidth;

            canvasContext.fillStyle = activeNotes.value[midi] ? whiteKeyDepressed : whiteKey;
            canvasContext.fillRect(xPosition, 0, whiteKeyWidth, canvasHeight);
            canvasContext.strokeRect(xPosition, 0, whiteKeyWidth, canvasHeight);

            whiteKeyIndex++;
        }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let midi = 21; midi <= 108; midi++) {
        const note = midi % 12;
        const isBlackKey = [1, 3, 6, 8, 10].includes(note);

        if (!isBlackKey) {
            whiteKeyIndex++;
            continue;
        }

        const xPosition = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;

        canvasContext.fillStyle = activeNotes.value[midi] ? blackKeyDepressed : blackKey;
        canvasContext.fillRect(xPosition, 0, blackKeyWidth, blackKeyHeight);
    }
    animationFrameId = requestAnimationFrame(animationLoop);
}

onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
        drawKeyboard();
    });

    resizeCanvasToCssSize(canvas);
    animationLoop();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <canvas ref="canvasElement" style="position: absolute; bottom: 0; left: 0; width: 100vw; height: 20vh; "></canvas>
</template>
