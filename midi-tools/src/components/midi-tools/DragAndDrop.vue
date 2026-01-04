<script setup>
import { ref } from "vue";

const file = defineModel("file");
const isDragging = ref(false);

function handleDrop(e) {
    isDragging.value = false
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith(".mid")) {
        file.value = dropped
    }
}
</script>

<template>
    <v-card width="600" elevation="6" class="pa-6">

        <!-- Drag + Drop Zone -->
        <div class="drop-zone" :class="{ 'drop-zone--active': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
            <p class="text-center">
                Drag & drop your MIDI file here
            </p>
        </div>

        <!-- Fallback File Input -->
        <v-file-input v-model="file" accept=".mid" label="Select MIDI file" prepend-icon="mdi-music" outlined dense class="mt-4" />
    </v-card>
</template>

<style scoped>
.drop-zone {
    border: 2px dashed #888;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;
}

.drop-zone--active {
    border-color: #1976d2;
    background-color: rgba(25, 118, 210, 0.1);
}
</style>
