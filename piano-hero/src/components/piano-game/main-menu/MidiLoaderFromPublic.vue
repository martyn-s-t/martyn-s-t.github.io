<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["file-selected"]);
const file = ref(null);

const publicFiles = ref([
    "FMA - Brothers.mid",
    "FMA - Brothers - Part 1-4.mid",
    "FMA - Brothers - Part 1.mid",
    "FMA - Brothers - Part 2.mid",
    "FMA - Brothers - Part 3.mid",
    "FMA - Brothers - Part 4.mid",
    "FMA - Brothers - Part 5.mid",
    "FMA - Brothers - Part 6.mid",
    "FMA - Brothers - Part 7.mid",
    "Final Fantasy XV - Valse di Fantastica.mid",
    "Final Fantasy XV - Valse di Fantastica - Part 1.mid",
    "Final Fantasy XV - Valse di Fantastica - Part 2.mid",
    "Final Fantasy XV - Valse di Fantastica - Part 3.mid",
    "Steins;Gate - Believe Me.mid",
    "SongOfStorms.mid",
]);
function selectMode(mode) {
    if (!file.value) return;
    console.log(file.value)
    emit("file-selected", file.value, mode);
}

const selectedFile = ref(null);


watch(selectedFile, async (newValue) => {
    if (newValue) {
        const response = await fetch(`./samples/midi/${newValue}`);
        if (!response.ok) {
            console.error("Failed to fetch the MIDI file:", response.statusText);
            return;
        }
        file.value = response;
    }
});
</script>


<template>
    <v-card width="600" elevation="6" class="pa-6 mx-auto">
        <v-card-title>
            Load From Public
        </v-card-title>

        <v-card-text>
            <v-select label="Select a file" v-model="selectedFile" :items="publicFiles" hide-details="auto" density="compact" />
        </v-card-text>

        <v-card-actions>
            <v-btn :disabled="!file" @click="selectMode('listen-song')">
                Listen to Song
            </v-btn>

            <v-btn :disabled="!file" @click="selectMode('learn-song')">
                Learn Song
            </v-btn>

            <v-btn :disabled="!file" @click="selectMode('play-song')">
                Play Song
            </v-btn>
        </v-card-actions>
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
