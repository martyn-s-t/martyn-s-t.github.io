<script setup>
const emit = defineEmits(["navigate"]);
</script>

<template>
    <v-container class="pa-4" style="max-width: 400px;">
        <v-btn block class="mb-4" color="primary" @click="emit('navigate', 'song-manager')">Play a Song</v-btn>
        <v-btn block class="mb-4" color="primary" @click="emit('navigate', 'free-play')">Free Play</v-btn>
        <v-btn block color="primary" @click="emit('navigate', 'settings')">Settings</v-btn>
    </v-container>
</template>

<style scoped></style>