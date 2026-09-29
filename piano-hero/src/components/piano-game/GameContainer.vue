<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

// Shared engine
import useGameEngine from "../../engine/useGameEngine.js";
import midiToMusicXml from "../../engine/midiToMusicXml.js";

// Canvases
import ControllerCanvas from "./game-container/ControllerCanvas.vue";
import KeyboardCanvas from "./game-container/KeyboardCanvas.vue";
import ProgressCanvas from "./game-container/ProgressCanvas.vue";
import TrackCanvas from "./game-container/TrackCanvas.vue";
import SheetMusicStrip from "./game-container/SheetMusicStrip.vue";

const emit = defineEmits(["navigate"]);

const song = defineModel("selectedSong");
const mode = defineModel("selectedMode");
const hand = defineModel("selectedHand");

const musicXml = ref(null);

const settings = {
    requireHoldAllKeys: localStorage.getItem("requireHoldAllKeys") === "true",
    keyPressLeeway: Number(localStorage.getItem("keyPressLeeway")),
    midiInputDevice: localStorage.getItem("midiInputDevice"),
    midiOutputDevice: localStorage.getItem("midiOutputDevice"),
    quantiseNotes: localStorage.getItem("quantiseNotes") === "true",
    quantiseSubdivisions: Number(localStorage.getItem("quantiseSubdivisions")),
}

const {
    notes,
    fallingNotes,
    pressedNotes,

    duration,
    timeToFall,
    getNow,

    isSeeking,
    isRecording,
    hasRecording,

    playbackSpeed,
    recordingTempo,
    recordingBeatsPerMeasure,
    recordingBeatUnits,

    elapsedSeconds,
    totalSeconds,
    progressPercentage,

    play,
    pause,
    stop,
    start,
    seekTo,

    setPlaybackSpeed,
    setRecordingTempo,
    setRecordingBeatsPerMeasure,
    setRecordingBeatUnit,

    recOn,
    recOff,
    saveRec,

    musicRollOn,
    musicRollOff,
    displayMusicRoll,

    onKeyDown,
    onKeyUp,

    metronomeActive,
    startMetronome,
    stopMetronome,

    autoAssignHands,
    assignLeftHand,
    assignRightHand,
    saveEdit,

    activeNotes,
    requestedNotes,

    startFreePlay,
    startListen,
    startLearn,
    startPlay,


    loadMidi,
    initMidiDevices,
    initAudio,
} = useGameEngine(settings);


function navigate(view = "song-mode-select") {
    stop();
    emit("navigate", view);
}

onMounted(async () => {    
    await initMidiDevices();    
    await initAudio();

    if (mode.value === "free") {
        startFreePlay(); 
        return
    }

    let midi = JSON.parse(localStorage.getItem(`song-${song.value.id}`));
    loadMidi(midi);
    
    musicXml.value = midiToMusicXml(midi);

    window.midi = midi;



    if (mode.value === "listen") startListen();
    if (mode.value === "learn") startLearn(hand.value);
    if (mode.value === "play") return;
    if (mode.value === "edit") return;
});

onBeforeUnmount(() => {

});
</script>

<template>
    <div class="game-canvas-layer">
        <ControllerCanvas 
                v-model:mode="mode" v-model:isRecording="isRecording" v-model:hasRecording="hasRecording" 
                :playbackSpeed="playbackSpeed" :bpm="recordingTempo" :beatsPerMeasure="recordingBeatsPerMeasure" :beatUnit="recordingBeatUnits"
                @pause="pause" @play="play" @stop="stop" @start="start" 
                @change-playback-speed="setPlaybackSpeed" @change-recording-tempo="setRecordingTempo" @change-recording-beats-per-measure="setRecordingBeatsPerMeasure" @change-recording-beat-unit="setRecordingBeatUnit"
                @music-roll-on="musicRollOn" @music-roll-off="musicRollOff" :displayMusicRoll="displayMusicRoll"
                @rec-on="recOn" @rec-off="recOff" @save-rec="saveRec" @navigate="navigate" 
                @auto-assign-hands="autoAssignHands" @save-edit="saveEdit"
                @start-metronome="startMetronome" @stop-metronome="stopMetronome" :metronomeActive="metronomeActive"
                />
        <ProgressCanvas v-if="mode !== 'free'" v-model:isSeeking="isSeeking" :elapsedSeconds="elapsedSeconds" :totalSeconds="totalSeconds" :progressPercentage="progressPercentage" @seek-to="seekTo" />
        <SheetMusicStrip v-if="displayMusicRoll" :musicXml="musicXml" :elapsedSeconds="elapsedSeconds" :duration="duration" :timeToFall="timeToFall"/>
        <TrackCanvas :mode="mode" :notes="fallingNotes" :timeToFall="timeToFall" :duration="duration" :elapsedSeconds="elapsedSeconds" :activeNotes="activeNotes" :pressedNotes="pressedNotes" @assign-left="assignLeftHand" @assign-right="assignRightHand"/>
        <KeyboardCanvas v-model:activeNotes="activeNotes" v-model:requestedNotes="requestedNotes" @key-down="onKeyDown" @key-up="onKeyUp" />
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
