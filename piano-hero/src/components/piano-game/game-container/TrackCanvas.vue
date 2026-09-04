<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
    notes: Array,          // engine-prepared falling notes
    currentTime: Number,   // engine timing
    timeToFall: Number,    // engine timing
    isSeeking: Boolean,     // engine state
    isPlaying: Boolean,    // engine state
    duration: Number,      // engine state
    getNow: Function,       // engine state
    startTime: Number,      // engine state
    pausedAt: Number,       // engine state
});

const canvasElement = ref(null);
let canvasContext = null;
let animationFrameId = null;

// purely visual data
let pixelsPerSecond = 0;
let fallingNotes = [];

const leftWhite = "rgba(0, 255, 150, 0.8)";
const rightWhite = "rgba(0, 150, 255, 0.8)";
const leftBlack = "rgba(0, 130, 60, 1)";
const rightBlack = "rgba(0, 60, 130, 1)";

function resizeCanvasToCssSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function prepareVisualNotes() {
    const canvas = canvasElement.value;
    const rect = canvas.getBoundingClientRect();

    const trackTopPx = rect.top;
    const keyboardTopPx = window.innerHeight * 0.8;

    const fallDistancePx = keyboardTopPx - trackTopPx;

    pixelsPerSecond = fallDistancePx / props.timeToFall;

    fallingNotes = props.notes.map(note => ({
        ...note,
        // top of note starts above canvas
        yPosition: -note.duration * pixelsPerSecond,
        height: note.duration * pixelsPerSecond,
        speed: pixelsPerSecond
    }));
}

function animationLoop() {
    const now = props.getNow();
    const totalSeconds = props.duration + props.timeToFall;
    const elapsedSeconds = props.isPlaying ? Math.min(now - props.startTime, totalSeconds) : props.pausedAt;

    const canvas = canvasElement.value;
    const w = canvas.width;
    const h = canvas.height;

    canvasContext.clearRect(0, 0, w, h);

    const totalWhiteKeys = 52;
    const whiteKeyWidth = w / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    fallingNotes.forEach(note => {
        renderNote(note, whiteKeyWidth, blackKeyWidth, h, elapsedSeconds);
    });

    animationFrameId = requestAnimationFrame(animationLoop);
}

function renderNote(note, whiteKeyWidth, blackKeyWidth, canvasHeight, elapsedSeconds) {
    if (elapsedSeconds < note.startTime || elapsedSeconds > note.endTime) return;

    const whiteIndex = getWhiteKeyIndex(note.midi);
    if (whiteIndex === null) return;

    const isBlack = isBlackMidi(note.midi);
    const xPosition = isBlack
        ? whiteIndex * whiteKeyWidth - blackKeyWidth / 2
        : whiteIndex * whiteKeyWidth;

    note.yPosition = (elapsedSeconds - note.startTime) * pixelsPerSecond - note.height;

    const fill = note.hand === "left"
        ? (isBlack ? leftBlack : leftWhite)
        : (isBlack ? rightBlack : rightWhite);

    canvasContext.fillStyle = fill;

    const width = isBlack ? blackKeyWidth : whiteKeyWidth;

    canvasContext.fillRect(xPosition, note.yPosition, width, note.height);
    canvasContext.strokeRect(xPosition, note.yPosition, width, note.height);
}

function isBlackMidi(midiNumber) {
    const note = midiNumber % 12;
    return [1, 3, 6, 8, 10].includes(note);
}

function getWhiteKeyIndex(midiNumber) {
    let index = 0;
    for (let m = 21; m < midiNumber; m++) {
        if (!isBlackMidi(m)) index++;
    }
    return index;
}

onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    resizeCanvasToCssSize(canvas);
    prepareVisualNotes();

    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
        prepareVisualNotes();
    });

    animationLoop();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
});

watch(() => props.notes, () => {
    prepareVisualNotes();
});
</script>

<template>
    <canvas ref="canvasElement" style="position: absolute; top: 10vh; left: 0; width: 100vw; height: 70vh;"></canvas>
</template>
