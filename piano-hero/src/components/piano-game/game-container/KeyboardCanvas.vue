<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["key-down", "key-up"]);
const activeNotes = defineModel("activeNotes");
const requestedNotes = defineModel("requestedNotes");

const canvasElement = ref(null);
let canvasContext = null;
let animationFrameId = null;

const whiteKey            = "white";
const whiteKeyDepressed   = "rgba(255, 200, 0, 1)";
const whiteKeyLeftExpected  = "rgba(100, 150, 255, 0.8)";
const whiteKeyRightExpected = "rgba(255, 100, 100, 0.8)";

const blackKey            = "black";
const blackKeyDepressed   = "rgba(255, 220, 120, 1)";
const blackKeyLeftExpected  = "rgba(120, 170, 255, 1)";
const blackKeyRightExpected = "rgba(255, 120, 120, 1)";

let keyRects = [];
let currentDepressedKey = ref(null);

function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;

    const { canvasHeight, whiteKeyWidth, blackKeyWidth, blackKeyHeight } = getSizeCalculations();

    keyRects = [];
    let whiteKeyIndex = 0;

    for (let midi = 21; midi <= 108; midi++) {
        const note = midi % 12;
        const isBlackKey = [1, 3, 6, 8, 10].includes(note);

        if (!isBlackKey) {
            const x = whiteKeyIndex * whiteKeyWidth;
            whiteKeyIndex++;
            keyRects.push({ midi, x, width: whiteKeyWidth, height: canvasHeight, isBlackKey });
        } else {
            const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;
            keyRects.push({ midi, x, width: blackKeyWidth, height: blackKeyHeight, isBlackKey });
        }
    }
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
    const { canvasWidth, canvasHeight } = getSizeCalculations();
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    // White keys
    for (let key of keyRects.filter(k => !k.isBlackKey)) {
        const entry = activeNotes.value[key.midi];
        const isActive = entry && entry.count;

        const isLeftExpected  = requestedNotes.value.some(n => n.midi === key.midi && !n.pressed && n.hand === "left");
        const isRightExpected = requestedNotes.value.some(n => n.midi === key.midi && !n.pressed && n.hand === "right");

        let fill =
            isActive        ? whiteKeyDepressed :
            isLeftExpected  ? whiteKeyLeftExpected :
            isRightExpected ? whiteKeyRightExpected :
                              whiteKey;

        canvasContext.fillStyle = fill;
        canvasContext.fillRect(key.x, 0, key.width, key.height);
        canvasContext.strokeRect(key.x, 0, key.width, key.height);
    }

    // Black keys
    for (let key of keyRects.filter(k => k.isBlackKey)) {
        const entry = activeNotes.value[key.midi];
        const isActive = entry && entry.count;

        const isLeftExpected  = requestedNotes.value.some(n => n.midi === key.midi && !n.pressed && n.hand === "left");
        const isRightExpected = requestedNotes.value.some(n => n.midi === key.midi && !n.pressed && n.hand === "right");

        let fill =
            isActive        ? blackKeyDepressed :
            isLeftExpected  ? blackKeyLeftExpected :
            isRightExpected ? blackKeyRightExpected :
                              blackKey;

        canvasContext.fillStyle = fill;
        canvasContext.fillRect(key.x, 0, key.width, key.height);
        canvasContext.strokeRect(key.x, 0, key.width, key.height);
    }

    animationFrameId = requestAnimationFrame(animationLoop);
}


function getMidiFromPointer(event) {
    const { blackKeyHeight } = getSizeCalculations();
    const rect = canvasElement.value.getBoundingClientRect();

    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    for (const key of keyRects.filter(k => k.isBlackKey)) {
        if (
            localX >= key.x &&
            localX <= key.x + key.width &&
            localY >= 0 &&
            localY <= blackKeyHeight
        ) return key.midi;
    }

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
        emit("key-down", midi, 100);
    }
}

function onPointerUpKey() {
    if (currentDepressedKey.value !== null) {
        emit("key-up", currentDepressedKey.value);
        currentDepressedKey.value = null;
    }
}


onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("pointerdown", onPointerDownKey);
    canvas.addEventListener("pointerup", onPointerUpKey);
    canvas.addEventListener("pointerleave", onPointerUpKey);

    window.addEventListener("resize", () => resizeCanvasToCssSize(canvas));

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
