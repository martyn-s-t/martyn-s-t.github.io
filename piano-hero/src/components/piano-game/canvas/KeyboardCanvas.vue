<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["note-on", "note-off"]);
const activeNotes = defineModel("activeNotes");

const canvasElement = ref(null);
let canvasContext = null;
let animationFrameId = null;

const whiteKey = "white";
const whiteKeyDepressed = "rgba(255, 200, 0, 1)";
const blackKey = "black";
const blackKeyDepressed = "rgba(255, 220, 120, 1)";

const keyRects = []; // { midi, x, width, isBlack }

let currentDepressedKey = ref(null);


// Resize canvas internal resolution to match CSS size
function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;
}

function getSizeCalculations() {
    const canvas = canvasElement.value;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const totalWhiteKeys = 52;
    const whiteKeyWidth = canvasWidth / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = canvasHeight * 0.6;
    return {
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        whiteKeyWidth: whiteKeyWidth,
        blackKeyWidth: blackKeyWidth,
        blackKeyHeight: blackKeyHeight
    };
}

function animationLoop() {

    const { canvasWidth, canvasHeight, whiteKeyWidth, blackKeyWidth, blackKeyHeight } = getSizeCalculations();

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

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
            keyRects.push({ midi, x: xPosition, width: isBlackKey ? blackKeyWidth : whiteKeyWidth, isBlackKey });

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
        keyRects.push({ midi, x: xPosition, width: isBlackKey ? blackKeyWidth : whiteKeyWidth, isBlackKey });
    }
    animationFrameId = requestAnimationFrame(animationLoop);
}


function getMidiFromPointer(event) {
    const { canvasWidth, canvasHeight, whiteKeyWidth, blackKeyWidth, blackKeyHeight } = getSizeCalculations();

    const rect = canvasElement.value.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    // Black keys first (they sit on top)
    for (const key of keyRects.filter(k => k.isBlackKey)) {
        const withinX = localX >= key.x && localX <= key.x + key.width;
        const withinY = localY >= 0 && localY <= blackKeyHeight;
        if (withinX && withinY) return key.midi;
    }

    // Then white keys
    for (const key of keyRects.filter(k => !k.isBlackKey)) {
        if (localX >= key.x && localX <= key.x + key.width) {
            return key.midi;
        }
    }

    return null;
}

function onPointerDownKey(event) {
    const midi = getMidiFromPointer(event);
    if (midi !== null) {
        currentDepressedKey.value = midi;
        emit("note-on", midi, 100);
    }
}
function onPointerUpKey(event) {
    if (currentDepressedKey.value !== null) {
        emit("note-off", currentDepressedKey.value);
        currentDepressedKey.value = null;
    }
}



onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("pointerdown", onPointerDownKey);
    canvas.addEventListener("pointerup", onPointerUpKey);
    canvas.addEventListener("pointerleave", onPointerUpKey);

    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
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
