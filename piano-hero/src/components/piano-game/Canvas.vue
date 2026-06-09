<script setup>
import { reactive } from "vue";

import KeyboardCanvas from "./canvas/KeyboardCanvas.vue";
import TrackCanvas from "./canvas/TrackCanvas.vue";

const file = defineModel("file");
const activeNotes = reactive({});

function noteDown(midi) {
    activeNotes[midi] = true;
}
function noteUp(midi) {
    activeNotes[midi] = false;
}
</script>

<template>
    <v-sheet class="d-block pa-0 ma-0" style="position: relative; width: 100vw; height: 100vh; overflow: hidden;" elevation="2">
        <TrackCanvas v-model:file="file" @note-down="noteDown" @note-up="noteUp"/>
        <KeyboardCanvas v-model:activeNotes="activeNotes" />
    </v-sheet>
</template>
