<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const emit = defineEmits(["seek-to"]);

const midi = defineModel("midi");
const startTime = defineModel("startTime");
const pausedAt = defineModel("pausedAt");
const isSeeking = defineModel("isSeeking");
const timeToFall = defineModel("timeToFall");

const isPointerOver = ref(false);
const x = ref(0);

const endOfMidi = midi.value.duration + timeToFall.value;

const props = defineProps({
    now: Function,
    isPlaying: Boolean
});

const canvasElement = ref(null);
let canvasContext = null;

let animationFrameId = null;

function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;
}

function animationLoop() {
    const now = props.now();

    // if song is finished, elapsed seconds is endOfMidi, is there any point to this? stop progress going above 100%
    const elapsedSeconds = props.isPlaying ? endOfMidi > now - startTime.value ? now - startTime.value : endOfMidi : pausedAt.value;
    const totalSeconds = endOfMidi;
    const progress = (elapsedSeconds) / (midi.value.duration + timeToFall.value);

    const canvas = canvasElement.value;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawProgress(canvasWidth, canvasHeight, progress);
    drawScrub(canvas, canvasWidth, canvasHeight);
    drawDuration(canvasWidth, canvasHeight, elapsedSeconds, endOfMidi);

    animationFrameId = requestAnimationFrame(animationLoop);
}

function drawProgress(canvasWidth, canvasHeight, percentage) {
    canvasContext.fillStyle = "red";
    canvasContext.fillRect(0, 0, canvasWidth * percentage, canvasHeight);
}
function drawDuration(canvasWidth, canvasHeight, elapsedSeconds, totalSeconds) {
    const text = `${formatTime(elapsedSeconds)} / ${formatTime(totalSeconds)}`;

    canvasContext.fillStyle = "white";
    canvasContext.font = "20px Arial";
    canvasContext.textBaseline = "middle";
    canvasContext.fillText(text, canvasWidth - 150, canvasHeight / 2);
}

function drawScrub(canvasWidth, canvasHeight) {
    if (isSeeking.value) {
        canvasContext.fillStyle = "white";
        canvasContext.fillRect(x.value, 0, 2, canvasHeight);
    }
}

function onPointerDown(event) {
    const rect = canvasElement.value.getBoundingClientRect();
    x.value = event.clientX - rect.left;
    isSeeking.value = true;
    seekFromEvent(event);
}

function onPointerMove(event) {
    if (isSeeking.value) {
        const rect = canvasElement.value.getBoundingClientRect();
        x.value = event.clientX - rect.left;
        seekFromEvent(event);
    }
}

function onPointerUp(event) {
    isSeeking.value = false;
}

function seekFromEvent() {
    // deal with hot reloads
    if (canvasElement.value === null) return;
    const rect = canvasElement.value.getBoundingClientRect();
    const width = rect.width;

    const percentage = Math.min(Math.max(x.value / width, 0), 1);
    const newTime = percentage * (midi.value.duration + timeToFall.value);

    emit("seek-to", newTime);
}

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}



onMounted(async () => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    canvas.addEventListener("pointerenter", () => {
        isPointerOver.value = true;
    });

    canvas.addEventListener("pointerleave", () => {
        isPointerOver.value = false;
    });


    resizeCanvasToCssSize(canvas);
    window.addEventListener("resize", () => {
        resizeCanvasToCssSize(canvas);
    });

    animationLoop();
});
onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <canvas ref="canvasElement" style="position: absolute; top: 5vh; left: 0; width: 100vw; height: 5vh; "></canvas>
</template>
