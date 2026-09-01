<script setup>
import { ref } from "vue";
const emit = defineEmits(["upload-song-from-file", "upload-song-from-url"]);

const display = defineModel("display");

const file = ref(null);
const isDragging = ref(false);
const url = ref("");

function handleDrop(event) {
    isDragging.value = false;
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".mid")) {
        file.value = droppedFile;
    }
    console.log("Dropped file:", droppedFile);
}

function handleInput(fileName) {
    if (fileName?.name.endsWith(".mid")) {
        file.value = fileName;
    }
}

function close() {
    display.value = false;
}
function uploadFromFile() {
    if (!file.value) return;
    emit("upload-song-from-file", file.value);
}

function uploadFromUrl() {
    if (!url.value) return;
    emit("upload-song-from-url", url.value);
}
</script>

<template>
    <v-dialog v-model="display" max-width="600">
        <v-card>
            <v-card-title>Upload Song</v-card-title>

            <v-card-text>
                <!-- Upload from file -->
                <h3 class="mb-2">From File</h3>

                <div class="drop-zone" :class="{ 'drop-zone--active': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                    <p class="text-center">Drag & drop your MIDI file here</p>
                </div>

                <v-file-input v-model="file" accept=".mid" label="Select MIDI file" prepend-icon="mdi-music" outlined dense class="mt-4" @update:modelValue="handleInput" />
                <v-btn class="mt-2" color="primary" block :disabled="!file" @click="uploadFromFile">Upload File</v-btn>

                <v-divider class="my-6"></v-divider>

                <!-- Upload from URL -->
                <h3 class="mb-2">From URL</h3>
                <v-text-field label="MIDI URL" v-model="url" prepend-icon="mdi-link" outlined dense />
                <v-btn class="mt-2" color="primary" block :disabled="!url" @click="uploadFromUrl">Load From URL</v-btn>
            </v-card-text>

            <v-card-actions>
                <v-btn class="flex-grow-1" @click="close">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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