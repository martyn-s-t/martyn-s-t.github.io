<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["request-note-on"]);

const startTime = defineModel("startTime");
const pausedAt = defineModel("pausedAt");
const midi = defineModel("midi");
const isSeeking = defineModel("isSeeking");

const props = defineProps({ now: Function, isPlaying: Boolean });
const timeToFall = defineModel("timeToFall");

const canvasElement = ref(null);
let canvasContext = null;

let fallingNotes = [];
let animationFrameId = null;

let pixelsPerSecond = 0;
const endOfMidi = midi.value.duration + timeToFall.value;

function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;
}
function recalculateNoteSpeed(canvas) {
    const canvasHeight = canvas.height;

    fallingNotes.forEach(note => note.speed = canvasHeight / 2);
}

async function prepareMidiData(midi) {
    resizeCanvasToCssSize(canvasElement.value);
    const canvasHeight = canvasElement.value.height;

    pixelsPerSecond = canvasHeight / timeToFall.value;

    fallingNotes = midi.tracks.flatMap(track => {
        return track.notes.map(note => {
            return {
                midi: note.midi,
                startTime: note.time,
                endTime: note.time + note.duration + timeToFall.value,
                duration: note.duration,
                yPosition: -note.duration * pixelsPerSecond,
                height: note.duration * pixelsPerSecond,
                speed: canvasHeight / timeToFall.value,
                hasStarted: false,
                hasPlayed: false
            }
        })
    });
    startTime.value = props.now();
}

function animationLoop() {
    const now = props.now();
    
    // if song is finished, elapsed seconds is endOfMidi, is there any point to this? stop progress going above 100%
    const elapsedSeconds = props.isPlaying ? endOfMidi > now - startTime.value ? now - startTime.value : endOfMidi : pausedAt.value;
    const progress = (elapsedSeconds) / (midi.value.duration + timeToFall.value);
    
    animationLoop.lastTime = now;

    const canvas = canvasElement.value;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    const totalWhiteKeys = 52;
    const whiteKeyWidth = canvasWidth / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    let renderedNotes = 0;
    fallingNotes.forEach((note, index) => {
        renderedNotes += !!renderNote(note, whiteKeyWidth, blackKeyWidth, canvasHeight, elapsedSeconds, index);
    });
    animationFrameId = requestAnimationFrame(animationLoop);
}

function renderNote(note, whiteKeyWidth, blackKeyWidth, canvasHeight, elapsedSeconds, index) {
    if (elapsedSeconds < note.startTime || elapsedSeconds > note.endTime) return;
    note.hasStarted = true;

    const whiteIndex = getWhiteKeyIndex(note.midi);
    if (whiteIndex === null) return;

    const isBlack = isBlackMidi(note.midi);
    const xPosition = isBlack ? whiteIndex * whiteKeyWidth - blackKeyWidth / 2 : whiteIndex * whiteKeyWidth;

    note.yPosition = (elapsedSeconds - note.startTime) * pixelsPerSecond - note.height;

    if (isSeeking.value === false && note.yPosition + note.height >= canvasHeight) {
        if (!note.hasPlayed) {
            emit("request-note-on", note);
            note.hasPlayed = true;
        }
    }

    // Draw
    canvasContext.fillStyle = isBlack ? "rgba(0, 60, 130, 1)" : "rgba(0, 150, 255, 0.8)";

    const width = isBlack ? blackKeyWidth : whiteKeyWidth;

    canvasContext.fillRect(xPosition, note.yPosition, width, note.height);
    canvasContext.strokeRect(xPosition, note.yPosition, width, note.height);
    return true;
}

function isBlackMidi(midiNumber) {
    const note = midiNumber % 12;
    return [1, 3, 6, 8, 10].includes(note);
}

function getWhiteKeyIndex(midiNumber) {
    let index = 0;
    for (let m = 21; m < midiNumber; m++) {
        if (!isBlackMidi(m)) {
            index++;
        }
    }

    return index;
}

onMounted(async () => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    resizeCanvasToCssSize(canvas);
    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
        recalculateNoteSpeed(canvas);
    });

    animationLoop();
    prepareMidiData(midi.value);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
});

watch(startTime, (newStartTime) => {
    animationLoop.lastTime = props.now();
    fallingNotes.forEach(note => {
        if (note.startTime >= newStartTime) {
            note.yPosition = -note.height;
            note.hasPlayed = false;
            note.hasStarted = false;
        }
    });
});

</script>

<template>
    <canvas ref="canvasElement" style="position: absolute; top: 10vh; left: 0; width: 100vw; height: 70vh; "></canvas>
</template>
