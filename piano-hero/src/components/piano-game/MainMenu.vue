<script setup>
const emit = defineEmits(["navigate"]);

const selectedMode = defineModel("selectedMode");

function startFreePlay() {
    selectedMode.value = "free"
    emit("navigate", "game");
}
</script>

<template>
    <v-container class="pa-4" style="max-width: 400px;">
        <div class="title-wrapper">
            <img src="https://placeholdit.com/1200x200/008080/FF69B4?text=PIANO+HERO" />
        </div>

        <v-btn block class="mb-4" color="primary" @click="emit('navigate', 'song-manager')">Play a Song</v-btn>
        <v-btn block class="mb-4" color="primary" @click="startFreePlay">Free Play</v-btn>
        <v-btn block color="primary" @click="emit('navigate', 'settings')">Settings</v-btn>
    </v-container>
</template>

<style scoped>
.title-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}
</style>
