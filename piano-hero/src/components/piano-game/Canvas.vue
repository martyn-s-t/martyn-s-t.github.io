<script setup>
import { ref, onMounted, reactive } from "vue";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

import ControllerCanvas from "./canvas/ControllerCanvas.vue";
import ProgressCanvas from "./canvas/ProgressCanvas.vue";
import TrackCanvas from "./canvas/TrackCanvas.vue";
import KeyboardCanvas from "./canvas/KeyboardCanvas.vue";

const emit = defineEmits(["navigate-main-menu"]);

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

function navigateMainMenu() {
    emit("navigate-main-menu");
}

function getNow() {
    return Tone.now()
}

function noteOn(midi) { 
    const noteName = Tone.Frequency(midi, "midi").toNote();
    activeNotes[midi] = true;
    tone.synth.triggerAttack(noteName);

}
function noteOff(midi) { 
    const noteName = Tone.Frequency(midi, "midi").toNote();
    delete activeNotes[midi]; 
    tone.synth.triggerRelease(noteName);
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
    midiInputs.value = [];
    access.inputs.forEach(input => {
        midiInputs.value.push(input);
    });
}
function connectMidi(midi) {
    if (!midi) return;
    midi.value.onmidimessage = handleMIDIMessage;
}
function handleMIDIMessage(event) {
    const [status, note, data2] = event.data;

    const command = status & 0xF0; // message type
    const channel = status & 0x0F; // channel number

    switch (command) {
        case 0x90: // Note On
            if (data2 > 0) {
                console.log(`Note On: ${note} (velocity: ${data2}) on channel ${channel + 1}`);
                noteOn(note);
            } else {
                console.log(`Note Off: ${note} on channel ${channel + 1}`);
                noteOff(note);
            }
            break;
        case 0x80: // Note Off
            console.log(`Note Off: ${note} on channel ${channel + 1}`);
            noteOff(note);
            break;
        case 0xB0: // Control Change
            console.log(`Control Change: controller ${note}, value ${data2}`);
            break;
        default:
            console.log(`Other MIDI message: ${event.data}`);
    }

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
    <v-sheet class="d-block pa-0 ma-0" style="position: relative; width: 100vw; height: 100vh; overflow: hidden;" elevation="2">
        <ControllerCanvas v-model:midi="midi" v-model:midiInputs="midiInputs" :now="getNow" @navigate-main-menu="navigateMainMenu" @play="play" @pause="pause" @stop="stop" @init-midi="initMIDI" @connect-midi="connectMidi" />
        <ProgressCanvas  v-if="midi" v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @seek-to="seekTo" />
        <TrackCanvas v-if="midi" v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" :now="getNow" :isPlaying="isPlaying" @note-on="noteOn" @note-off="noteOff"/>
        <KeyboardCanvas :activeNotes="activeNotes" @note-on="noteOn" @note-off="noteOff" />
    </v-sheet>
</template>
