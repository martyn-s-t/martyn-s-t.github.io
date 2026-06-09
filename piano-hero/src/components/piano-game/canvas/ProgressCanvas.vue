<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const midi = defineModel("midi");
const startTime = defineModel("startTime");

const props = defineProps({
    now: Function,
    isPlaying: Boolean
});

const canvasElement = ref(null);
let canvasContext = null;

let animationFrameId = null;

let endTime = computed(() => Math.max(...midi.value.tracks.map(track => track.duration)));

function resizeCanvasToCssSize(canvas) {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    canvas.width = cssWidth;
    canvas.height = cssHeight;
}

function animationLoop() {
    if (props.isPlaying === false) return animationFrameId = requestAnimationFrame(animationLoop);
    const now = props.now();
    const elapsedSeconds = now - startTime.value;
    const progress = elapsedSeconds /  endTime.value;

    const canvas = canvasElement.value;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawProgress(canvasWidth, canvasHeight, progress);

    animationFrameId = requestAnimationFrame(animationLoop);
}

function drawProgress(canvasWidth, canvasHeight, percentage) {
    canvasContext.fillStyle = "red";
    canvasContext.fillRect(0, 0, canvasWidth * percentage, canvasHeight);
}

onMounted(async () => {
    const canvas = canvasElement.value;
    canvasContext = canvas.getContext("2d");

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
