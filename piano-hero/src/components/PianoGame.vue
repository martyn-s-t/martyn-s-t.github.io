<script setup>
import { ref, onMounted } from "vue";

import MainMenu from "./piano-game/MainMenu.vue";
import SongManager from "./piano-game/SongManager.vue";
import SongModeSelect from "./piano-game/SongModeSelect.vue";
import GameContainer from "./piano-game/GameContainer.vue";
import SheetMusic from "./piano-game/SheetMusic.vue";
import SettingsPage from "./piano-game/SettingsPage.vue";

const views = {
    "main-menu": MainMenu,
    "song-manager": SongManager,
    "song-mode-select": SongModeSelect,
    "game": GameContainer,
    "sheet-music": SheetMusic,
    "settings": SettingsPage
};

const currentView = ref("main-menu");

const selectedSong = ref(null);
const selectedMode = ref(null);
const selectedHand = ref(null);

function navigate(view) {
    console.log(`Navigating to view: ${view}`);
    currentView.value = view;
}

</script>

<template>
    <component :is="views[currentView]" v-model:selectedSong="selectedSong" v-model:selectedMode="selectedMode" v-model:selectedHand="selectedHand" @navigate="navigate" />
</template>
