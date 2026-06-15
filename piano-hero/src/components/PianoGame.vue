<script setup>
import { ref } from "vue";
import MainMenu from "./piano-game/MainMenu.vue";
import Canvas from "./piano-game/Canvas.vue";

const view = ref("main-menu")
const selectedFile = ref(null);


function handleFileSelected(file) {
    selectedFile.value = file;
    view.value = "game";
}

function navigateMainMenu() {
    selectedFile.value = null;
    view.value = 'main-menu';
}
</script>

<template>
    <v-container fluid class="pa-0">
        <MainMenu v-if="view === 'main-menu'" @file-selected="handleFileSelected"/>
        <Canvas v-if="view === 'game'" v-model:file="selectedFile" @navigate-main-menu="navigateMainMenu"/>
    </v-container>
</template>
