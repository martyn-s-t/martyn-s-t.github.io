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
const gameMode = defineModel("gameMode");

const requireHoldAllKeys = ref(false);

const activeNotes = ref({});
const requestedNotes = ref([]);
const midiInputs = ref([]);

const isPlaying = ref(false);
const isSeeking = ref(false);

const startTime = ref(0);
const pausedAt = ref(0);

const timeToFall = ref(3);

const keyPressLeyway = ref(100);


const tone = {
    synth: null
};
const SAMPLE_URLS = {
    A1: "A1.mp3",
    C3: "C3.mp3",
    C4: "C4.mp3",
    A4: "A4.mp3"
};

const voices = {};


function navigateMainMenu() {
    emit("navigate-main-menu");
}

function getNow() {
    return Tone.now()
}

function keyDown(midi) {
    switch (gameMode.value) {
        case "free-play":
        case "listen-song":
            noteOn(midi);
            break;
        case "learn-song":
            noteOn(midi);

            for (const requestedNote of requestedNotes.value) {
                if (requestedNote.midi === midi) {
                    requestedNote.pressed = true;
                }
            }
            const pass = requestedNotes.value.every(note => {
                return activeNotes.value[note.midi] > 0;
            });

            if (pass) {
                requestedNotes.value = [];
                play();
            }
            break;
    }
}
function keyUp(midi) {
    switch (gameMode.value) {
        case "free-play":
        case "free-play":
        case "listen-song":
        case "learn-song":
            noteOff(midi);
            break;
    }
}

function requestedNoteOn(note) {
    const midi = note.midi;
    const now = performance.now();
    const entry = activeNotes.value[midi];

    const midi = note.midi;
    const now = performance.now();
    const entry = activeNotes.value[midi];

    switch (gameMode.value) {
        case "listen-song":
            noteOn(note.midi)
            setTimeout(() => noteOff(note.midi), note.duration * 1000);
            break;
        case "learn-song":
            requestedNotes.value.push(note);
            pause();
            break;
    }
}

function noteOn(midi) {
    const now = performance.now();
    activeNotes.value[midi] ??= {
        count: 0,
        pressedAt: now
    };

    const entry = activeNotes.value[midi];
    entry.count++;
    entry.pressedAt = now;

    const noteName = Tone.Frequency(midi, "midi").toNote();
    const voice = createVoiceFromMaster(tone.synth);

    if (!voices[midi]) voices[midi] = [];
    voices[midi].push(voice);

    voice.triggerAttack(noteName);
}


function noteOff(midi) {
    const entry = activeNotes.value[midi];
    if (!entry) return;

    entry.count--;

    if (entry.count <= 0) {
        delete activeNotes.value[midi];
    }

    const entry = activeNotes.value[midi];
    if (!entry) return;

    entry.count--;

    if (entry.count <= 0) {
        delete activeNotes.value[midi];
    }

    const noteName = Tone.Frequency(midi, "midi").toNote();

    if (!voices[midi] || voices[midi].length === 0) return;

    const voice = voices[midi].shift();
    voice.triggerRelease(noteName);
}


function createVoiceFromMaster(master) {
    const voice = new Tone.Sampler({
        urls: SAMPLE_URLS,
        release: master.release,
        baseUrl: "/piano-hero/dist/samples/piano/"
    }).toDestination();

    // Copy buffers from master
    voice._buffers = master._buffers;

    return voice;
}

async function play() {
    if (isPlaying.value) return;
    if (isPlaying.value) return;
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
    activeNotes.value = {};
    requestedNotes.value = [];
    activeNotes.value = {};
    requestedNotes.value = [];
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
    console.log("MIDI Access obtained:", access);
    console.log("MIDI Access obtained:", access);
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
                // console.log(`Note On: ${note} (velocity: ${data2}) on channel ${channel + 1}`);
                // console.log(`Note On: ${note} (velocity: ${data2}) on channel ${channel + 1}`);
                keyDown(note);
            } else {
                // console.log(`Note Off: ${note} on channel ${channel + 1}`);
                // console.log(`Note Off: ${note} on channel ${channel + 1}`);
                keyUp(note);
            }
            break;
        case 0x80: // Note Off
            // console.log(`Note Off: ${note} on channel ${channel + 1}`);
            keyUp(note);
            break;
        case 0xB0: // Control Change
            // console.log(`Control Change: controller ${note}, value ${data2}`);
            break;
        default:
        // console.log(`Other MIDI message: ${event.data}`);
    }

}

onMounted(async () => {
    tone.synth = new Tone.Sampler({
        urls: SAMPLE_URLS,
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
        <ProgressCanvas v-if="midi" v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" v-model:timeToFall="timeToFall" :now="getNow" :isPlaying="isPlaying" @seek-to="seekTo" />
        <TrackCanvas v-if="midi" v-model:midi="midi" v-model:startTime="startTime" v-model:pausedAt="pausedAt" v-model:isSeeking="isSeeking" v-model:timeToFall="timeToFall" :now="getNow" :isPlaying="isPlaying" @request-note-on="requestedNoteOn" />
        <KeyboardCanvas :activeNotes="activeNotes" v-model:requestedNotes="requestedNotes" @key-down="keyDown" @key-up="keyUp" />
    </v-sheet>
</template>
