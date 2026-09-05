<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["seek-to"]);

const props = defineProps({
    elapsedSeconds: Number,
    totalSeconds: Number,
    progressPercentage: Number,
});

const isSeeking = defineModel("isSeeking");

const x = ref(0);


const canvasElement = ref(null);
let canvasContext = null;
let animationFrameId = null;

function resizeCanvasToCssSize(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function animationLoop() {
    const canvas = canvasElement.value;
    const w = canvas.width;
    const h = canvas.height;

    canvasContext.clearRect(0, 0, w, h);

    drawProgress(w, h, props.progressPercentage);
    drawScrub(w, h);
    drawDuration(w, h, props.elapsedSeconds, props.totalSeconds);

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
    if (!isSeeking.value) return;
    const rect = canvasElement.value.getBoundingClientRect();
    x.value = event.clientX - rect.left;
    seekFromEvent(event);
}

function onPointerUp() {
    isSeeking.value = false;
}

function seekFromEvent() {
    // deal with hot reloads
    if (canvasElement.value === null) return;
    const rect = canvasElement.value.getBoundingClientRect();
    const width = rect.width;

    const percentage = Math.min(Math.max(x.value / width, 0), 1);
    const newTime = percentage * (props.totalSeconds);

    emit("seek-to", newTime);
}

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}



onMounted(() => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    resizeCanvasToCssSize(canvas);
    window.addEventListener("resize", () => resizeCanvasToCssSize(canvas));

    animationLoop();
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <canvas ref="canvasElement" style="position: absolute; top: 5vh; left: 0; width: 100vw; height: 5vh; "></canvas>
</template>
