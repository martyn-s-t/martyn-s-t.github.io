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

const activeNotes = reactive({});
const midiInputs = ref([]);

const isPlaying = ref(false);
const isSeeking = ref(false);

const startTime = ref(0);
const pausedAt = ref(0);


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
async function initMIDI() {
    const access = await navigator.requestMIDIAccess();

    access.inputs.forEach(input => {
        midiInputs.value.push(input);

        input.onmidimessage = handleMIDIMessage;
    });
}

function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;

    const command = status & 0xf0;

    if (command === 0x90 && velocity > 0) {
        // onNoteOn(note, velocity);
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        // onNoteOff(note);
    }
}

function noteOn(note, velocity) {
    activeNotes[note] = true;
    notePlay(note, 1);
}

function noteOff(note) {
    delete activeNotes[note];
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
        <ControllerCanvas v-model:midi="midi" :now="getNow" @play="play" @pause="pause" @stop="stop" @init-midi="initMIDI"/>
        <ProgressCanvas   v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @seek-to="seekTo"/>
        <TrackCanvas      v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @note-play="notePlay" @note-down="noteDown" @note-up="noteUp" />
        <KeyboardCanvas :activeNotes="activeNotes" @note-on="noteOn" @note-off="noteOff"/>
    </v-sheet>
</template>
