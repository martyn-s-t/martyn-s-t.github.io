<script setup>
import { ref, onMounted, reactive } from "vue";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

import ControllerCanvas from "./canvas/ControllerCanvas.vue";
import ProgressCanvas from "./canvas/ProgressCanvas.vue";
import TrackCanvas from "./canvas/TrackCanvas.vue";
import KeyboardCanvas from "./canvas/KeyboardCanvas.vue";

const file = defineModel("file");
const midi = defineModel("midi");

const startTime = defineModel("startTime");
const isPlaying = ref(false);
const pausedAt = ref(0);

const isSeeking = ref(false);


const activeNotes = reactive({});

const tone = {
    synth: null
};

function getNow() {
    return Tone.now()
}

function noteDown(midi) { activeNotes[midi] = true; }
function noteUp(midi) { delete activeNotes[midi]; }

function notePlay(midi, duration) {
    const noteName = Tone.Frequency(midi, "midi").toNote();

    tone.synth.triggerAttackRelease(noteName, duration);
    noteDown(midi);
}


async function play() {
    await Tone.start();

    if (pausedAt.value) {
        startTime.value = getNow() - pausedAt.value;
    } else {
        startTime.value = getNow();
    }

    isPlaying.value = true;
}
function pause() {
    if (!isPlaying.value) return;

    pausedAt.value = getNow() - startTime.value;
    isPlaying.value = false;
}
function stop() {
    isPlaying.value = false;
    pausedAt.value = 0;
    startTime.value = 0;

    // Reset active notes
    for (const key in activeNotes) delete activeNotes[key];
}

function seekTo(seconds) {
    pausedAt.value = seconds;

    if (isPlaying.value) {
        startTime.value = getNow() - seconds;
    } else {
        startTime.value = 0;
    }
}


async function loadMidiFile(file) {
    if (!file.value) return
    const arrayBuffer = await file.value.arrayBuffer()
    midi.value = new Midi(arrayBuffer);
}

onMounted(async () => {
    tone.synth = new Tone.Sampler({
        urls: {
            A1: "A1.mp3",
            C3: "C3.mp3",
            C4: "C4.mp3",
            A4: "A4.mp3"
        },
        release: 1,
        baseUrl: "/piano-hero/dist/samples/piano/"
    }).toDestination();

    await Tone.loaded();
    loadMidiFile(file);
    await play();
});
</script>

<template>
    <v-sheet v-if="midi" class="d-block pa-0 ma-0" style="position: relative; width: 100vw; height: 100vh; overflow: hidden;" elevation="2">
        <ControllerCanvas v-model:midi="midi" :now="getNow" @play="play" @pause="pause" @stop="stop" />
        <ProgressCanvas   v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @seek-to="seekTo"/>
        <TrackCanvas      v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @note-play="notePlay" @note-down="noteDown" @note-up="noteUp" />
        <KeyboardCanvas :activeNotes="activeNotes" />
    </v-sheet>
</template>
