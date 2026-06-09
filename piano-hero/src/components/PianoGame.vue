<script setup>
import { ref } from "vue";
import MidiDropLoader from "./piano-game/MidiLoader.vue";
import Canvas from "./piano-game/Canvas.vue";

const selectedFile = ref(null);

function handleFileSelected(file) {
    selectedFile.value = file;
}
</script>

<template>
    <v-container fluid class="pa-0">
        <MidiDropLoader v-if="!selectedFile" @file-selected="handleFileSelected" />
        <Canvas v-if="selectedFile" v-model:file="selectedFile" />
    </v-container>
</template>
