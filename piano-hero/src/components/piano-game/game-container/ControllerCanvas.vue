<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits([
    "navigate", "start", "play", "pause", "stop",
    "rec-on", "rec-off", "save-rec",
    "music-roll-on", "music-roll-off",
    "change-playback-speed", "change-recording-tempo", "change-recording-beats-per-measure", "change-recording-beat-unit",
    "auto-assign-hands", "save-edit",
    "start-metronome", "stop-metronome"
]);

const props = defineProps({
    mode: String,
    playbackSpeed: Number,
    isRecording: Boolean,
    hasRecording: Boolean,
    displayMusicRoll: Boolean,
    bpm: Number,
    beatsPerMeasure: Number,
    beatUnit: Number,
    metronomeActive: Boolean,
});

const playbackSpeedLocal = ref(props.playbackSpeed * 100);
const bpmLocal = ref(props.bpm);
const beatsPerMeasureLocal = ref(props.beatsPerMeasure);
const beatUnitLocal = ref(props.beatUnit);

function toggleRec() {
    if (props.isRecording) {
        emit("rec-off");
    } else {
        emit("rec-on");
    }
}

function toggleMusicRoll() {
    if (props.displayMusicRoll) {
        emit("music-roll-off");
    } else {
        emit("music-roll-on");
    }
}

function navigate() {
    if (props.mode === "free") {
        emit("navigate", "main-menu");
    } else {
        emit("navigate");
    }
}

function onPlaybackSpeedChanged(value) {
    emit("change-playback-speed", value / 100);
}
function onTempoSpeedChange(value) {
    emit("change-recording-tempo", value);
}
function onBeatsPerMeasureChanged(value) {
    emit("change-recording-beats-per-measure", value);
}
function onBeatUnitChanged(value) {
    emit("change-recording-beat-unit", value);
}
function autoAssignHands() {
    emit("auto-assign-hands");
}
function startMetronome() {
    emit("start-metronome");
}
function stopMetronome() {
    emit("stop-metronome");
}
function toggleMetronome() {
    if (props.metronomeActive) {
        stopMetronome();
    } else {
        startMetronome();
    }
    
}

</script>

<template>
    <v-row style="width:100%; height:5vh" justify="center" class="align-center">

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-btn block color="error" @click="navigate">
                <v-icon size="x-large">mdi-chevron-left</v-icon>
            </v-btn>
        </v-col>

        <v-col cols="3"></v-col>

        <v-col cols="4" class="d-flex justify-center h-100">
            <v-btn-group variant="outlined" divided>
                <v-btn v-if="mode === 'free'" @click="toggleRec" :color="isRecording ? 'red' : undefined">
                    <v-icon size="x-large">mdi-record</v-icon>
                </v-btn>

                <v-btn @click="$emit('start')">
                    <v-icon size="x-large">mdi-skip-previous</v-icon>
                </v-btn>

                <v-btn @click="$emit('play')">
                    <v-icon size="x-large">mdi-play</v-icon>
                </v-btn>

                <v-btn @click="$emit('pause')">
                    <v-icon size="x-large">mdi-pause</v-icon>
                </v-btn>

                <v-btn @click="$emit('stop')">
                    <v-icon size="x-large">mdi-stop</v-icon>
                </v-btn>

                <v-btn v-if="mode === 'free'" @click="$emit('save-rec')" :disabled="!hasRecording">
                    <v-icon size="x-large">mdi-content-save</v-icon>
                </v-btn>
                <v-btn v-if="mode === 'edit'" @click="$emit('save-edit')">
                    <v-icon size="x-large">mdi-content-save</v-icon>
                </v-btn>

                <v-btn @click="toggleMetronome">
                    <v-icon size="x-large">mdi-metronome</v-icon>
                </v-btn>
            </v-btn-group>
        </v-col>

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-number-input v-if="mode !== 'free'" v-model="playbackSpeedLocal" @update:model-value="onPlaybackSpeedChanged" :min="10" :max="200" :step="10" control-variant="split" hide-detail="auto" density="compact"></v-number-input>
            <v-number-input v-if="mode === 'free'" v-model="bpmLocal" @update:model-value="onTempoSpeedChange" :min="30" :max="240" :step="1" control-variant="split" hide-detail="auto" density="compact" label="Tempo"></v-number-input>
        </v-col>

        <v-col cols="2">
            <v-row>
                <v-col>
                    <v-number-input v-if="mode === 'free'" v-model="beatsPerMeasureLocal" @update:model-value="onBeatsPerMeasureChanged" :min="1" :max="32" :step="1" control-variant="split" hide-detail="auto" density="compact" label="Beats Per Measure"></v-number-input>
                </v-col>
                <v-col cols="auto" v-if="mode === 'free'">
                    <v-icon size="x-large">mdi-slash-forward</v-icon>
                </v-col>
                <v-col>
                    <v-number-input v-if="mode === 'free'" v-model="beatUnitLocal" @update:model-value="onBeatUnitChanged" :min="1" :max="32" :step="1" control-variant="split" hide-detail="auto" density="compact" label="Beat Unit"></v-number-input>
                </v-col>
            </v-row>
        </v-col>

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-btn v-if="!['free', 'edit'].includes(mode)" @click="toggleMusicRoll" hide-detail="auto" density="compact" block>
                <v-icon size-="x-large">mdi-music-note</v-icon>
            </v-btn>
            <v-btn v-if="['edit'].includes(mode)" @click="autoAssignHands" hide-detail="auto" density="compact" black>
                Auto Assign Hands
            </v-btn>
        </v-col>

    </v-row>
</template>

<style scoped>
.v-btn-group {
    height: 100%;
}

.v-btn {
    height: 100%;
}
</style>
