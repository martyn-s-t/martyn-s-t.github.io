<script setup>
import { onMounted, onBeforeUnmount } from "vue";

// Shared engine
import useGameEngine from "../../engine/useGameEngine.js";

// Canvases
import ControllerCanvas from "./game-container/ControllerCanvas.vue";
import KeyboardCanvas from "./game-container/KeyboardCanvas.vue";
import ProgressCanvas from "./game-container/ProgressCanvas.vue";
import TrackCanvas from "./game-container/TrackCanvas.vue";

const emit = defineEmits(["navigate"]);

const song = defineModel("selectedSong");
const mode = defineModel("selectedMode");
const hand = defineModel("selectedHand");

const {
    notes,
    fallingNotes,


    currentTime,
    duration,
    timeToFall,
    getNow,

    isPlaying,
    startTime,
    pausedAt,
    isSeeking,

    play,
    pause,
    stop,
    seekTo,


    onKeyDown,
    onKeyUp,


    activeNotes,
    requestedNotes, 
    requestedNoteOn,


    startListen,
    startLearn,
    startPlay,


    loadMidi,
    initAudio,
} = useGameEngine();


function navigate() {
    stop();
    emit("navigate", "song-mode-select");
}

onMounted(async () => {
    let midi = JSON.parse(localStorage.getItem(`song-${song.value.id}`));
    await initAudio();
    loadMidi(midi);

    if (mode.value === "listen") startListen();
    if (mode.value === "learn") startLearn();
    if (mode.value === "play") return;
});

onBeforeUnmount(() => {

});
</script>

<template>
    <div class="game-canvas-layer">
        <ControllerCanvas @pause="pause" @play="play" @stop="stop" @navigate="navigate" />
        <KeyboardCanvas v-model:activeNotes="activeNotes" v-model:requestedNotes="requestedNotes" @key-down="onKeyDown" @key-up="onKeyUp" />
        <ProgressCanvas :duration="duration" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isPlaying="isPlaying" v-model:isSeeking="isSeeking" v-model:timeToFall="timeToFall" v-model:getNow="getNow" @seek-to="seekTo" />
        <TrackCanvas :notes="fallingNotes" :startTime="startTime" :timeToFall="timeToFall" :isSeeking="isSeeking" :isPlaying="isPlaying" :duration="duration" :pausedAt="pausedAt" :getNow="getNow"  @request-note-on="requestedNoteOn" />
    </div>
</template>

<style scoped>
.game-canvas-layer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
