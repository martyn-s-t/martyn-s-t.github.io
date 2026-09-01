<script setup>
import { ref, onMounted } from "vue";

import MainMenu from "./piano-game/MainMenu.vue";
import SongManager from "./piano-game/SongManager.vue";
import SongModeSelect from "./piano-game/SongModeSelect.vue";
import GameContainer from "./piano-game/GameContainer.vue";
import SettingsPage from "./piano-game/SettingsPage.vue";

const views = {
    "main-menu": MainMenu,
    "song-manager": SongManager,
    "song-mode-select": SongModeSelect,
    "game": GameContainer,
    "settings": SettingsPage
};

const currentView = ref("main-menu");

const selectedMidiDevice = ref(null);
const requireHoldAllKeys = ref(true);
const pressKeyLeeway = ref(100);

const selectedSong = ref(null);
const selectedMode = ref(null);
const selectedHand = ref(null);

function navigate(view) {
    console.log(`Navigating to view: ${view}`);
    currentView.value = view;
}

onMounted(() => {
    selectedMidiDevice.value = localStorage.getItem("selectedMidiDevice") || null;
    requireHoldAllKeys.value = localStorage.getItem("requireHoldAllKeys") || null;
    pressKeyLeeway.value = localStorage.getItem("pressKeyLeeway") || 100;
});

</script>

<template>
    <component :is="views[currentView]" v-model:selectedMidiDevice="selectedMidiDevice" v-model:requireHoldAllKeys="requireHoldAllKeys" v-model:pressKeyLeeway="pressKeyLeeway" v-model:selectedSong="selectedSong" v-model:selectedMode="selectedMode" @navigate="navigate" />
</template>
