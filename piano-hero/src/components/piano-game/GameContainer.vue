<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

// Shared engine
import useGameEngine from "../../engine/useGameEngine.js";

// Canvases
import ControllerCanvas from "./game-container/ControllerCanvas.vue";
import KeyboardCanvas from "./game-container/KeyboardCanvas.vue";
import ProgressCanvas from "./game-container/ProgressCanvas.vue";
import TrackCanvas from "./game-container/TrackCanvas.vue";

const emit = defineEmits(["navigate"]);

const midiInputDevices = ref([]);
const midiOutputDevices = ref([]);

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
    isSeeking,
    isRecording,

    hasRecording,

    startTime,
    pausedAt,

    play,
    pause,
    stop,
    start,
    seekTo,

    recOn,
    recOff,
    saveRec,

    handleMIDIMessage,
    onKeyDown,
    onKeyUp,


    activeNotes,
    requestedNotes,

    startFreePlay,
    startListen,
    startLearn,
    startPlay,


    loadMidi,
    initAudio,
} = useGameEngine();


function navigate(view = "song-mode-select") {
    stop();
    emit("navigate", view);
}

async function initMIDI() {
    const access = await navigator.requestMIDIAccess();

    midiInputDevices.value = []; midiOutputDevices.value = [];
    access.inputs.forEach(input => midiInputDevices.value.push(input));
    access.outputs.forEach(output => midiOutputDevices.value.push(output));
}

onMounted(async () => {
    let midiDeviceInputId = localStorage.getItem("midiDeviceInput");
    let midiDeviceOutputId = localStorage.getItem("midiDeviceInput");
    
    await initMIDI()
    
    let selectedMidiInputDevice = midiInputDevices.value.find(device => device.id === midiDeviceInputId);
    let selectedMidiOutputDevice = midiInputDevices.value.find(device => device.id === midiDeviceOutputId);
    if (selectedMidiInputDevice)
        selectedMidiInputDevice.onmidimessage = handleMIDIMessage;
    
    await initAudio(midiDeviceOutputId, selectedMidiOutputDevice);

    
    if (mode.value === "free") {
        startFreePlay(); 
        return
    }

    let midi = JSON.parse(localStorage.getItem(`song-${song.value.id}`));
    loadMidi(midi);

    if (mode.value === "listen") startListen();
    if (mode.value === "learn") startLearn(hand.value);
    if (mode.value === "play") return;
});

onBeforeUnmount(() => {

});
</script>

<template>
    <div class="game-canvas-layer">
        <ControllerCanvas v-model:mode="mode" v-model:isRecording="isRecording" v-model:hasRecording="hasRecording" @pause="pause" @play="play" @stop="stop" @start="start" @rec-on="recOn" @rec-off="recOff" @save-rec="saveRec" @navigate="navigate" />
        <KeyboardCanvas v-model:activeNotes="activeNotes" v-model:requestedNotes="requestedNotes" @key-down="onKeyDown" @key-up="onKeyUp" />
        <ProgressCanvas v-if="mode !== 'free'" :duration="duration" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isPlaying="isPlaying" v-model:isSeeking="isSeeking" v-model:timeToFall="timeToFall" v-model:getNow="getNow" @seek-to="seekTo" />
        <TrackCanvas :notes="fallingNotes" :startTime="startTime" :timeToFall="timeToFall" :isSeeking="isSeeking" :isPlaying="isPlaying" :duration="duration" :pausedAt="pausedAt" :getNow="getNow" />
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
