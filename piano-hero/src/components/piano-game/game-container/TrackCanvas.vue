<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
    notes: Array,
    timeToFall: Number,
    duration: Number,
    startTime: Number,
    elapsedSeconds: Number,
    mode: String,
});

const emit = defineEmits(["assign-left", "assign-right"]);

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

const whiteKeyWidth = ref(0);
const blackKeyWidth = ref(0);

function resizeCanvasToCssSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    const totalWhiteKeys = 52;
    whiteKeyWidth.value = w / totalWhiteKeys;
    blackKeyWidth.value = whiteKeyWidth.value * 0.6;
}

function prepareVisualNotes() {
    const canvas = canvasElement.value;
    const rect = canvas.getBoundingClientRect();

    const trackTopPx = rect.top;
    const keyboardTopPx = window.innerHeight * 0.8;

    const fallDistancePx = keyboardTopPx - trackTopPx;

    pixelsPerSecond = fallDistancePx / props.timeToFall;

    fallingNotes = props.notes.map(note => {
        const isBlack = isBlackMidi(note.midi);
        const whiteIndex = getWhiteKeyIndex(note.midi);
        const xPosition = isBlack ? whiteIndex * whiteKeyWidth.value - blackKeyWidth.value / 2 : whiteIndex * whiteKeyWidth.value;
        const width = isBlack ? blackKeyWidth.value : whiteKeyWidth.value;
        return {
            ...note,
            isBlack: isBlack,
            xPosition: xPosition,
            yPosition: -note.duration * pixelsPerSecond,
            height: note.duration * pixelsPerSecond,
            width: width,
            speed: pixelsPerSecond
        }
    });
    window.fallingNotes = fallingNotes;
}

function animationLoop() {
    const canvas = canvasElement.value;
    const w = canvas.width;
    const h = canvas.height;

    canvasContext.clearRect(0, 0, w, h);

    fallingNotes.forEach(note => {
        renderNote(note, props.elapsedSeconds);
    });

    animationFrameId = requestAnimationFrame(animationLoop);
}

function renderNote(note, elapsedSeconds) {
    if (elapsedSeconds < note.startTime || elapsedSeconds > note.endTime) return;

    note.yPosition = (elapsedSeconds - note.startTime) * pixelsPerSecond - note.height;
    const fill = note.hand === "left" ? (note.isBlack ? leftBlack : leftWhite) : (note.isBlack ? rightBlack : rightWhite);
    
    canvasContext.fillStyle = fill;

    canvasContext.fillRect(note.xPosition, note.yPosition, note.width, note.height);
    canvasContext.strokeRect(note.xPosition, note.yPosition, note.width, note.height);
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

function getNoteAt(x, y) {
    for (let i = fallingNotes.length - 1; i >= 0; i--) {
        const note = fallingNotes[i];
        if (x >= note.xPosition && x <= note.xPosition + note.width && y >= note.yPosition && y <= note.yPosition + note.height) {
            return note.id;
        }
    }

    return null;
}

function handleMouseDown(event) {
    const canvas = canvasElement.value;

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const noteId = getNoteAt(x, y);
    if (!noteId) return;

    switch (event.button) {
        case 0:
            return emit("assign-left", noteId);
        case 2:
            return emit("assign-right", noteId);
    }
}

function preventContextMenu(event) { event.preventDefault(); }

onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    resizeCanvasToCssSize(canvas);
    prepareVisualNotes();

    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
        prepareVisualNotes();
    });

    if (props.mode === "edit") {
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("contextmenu", preventContextMenu);
    }

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
