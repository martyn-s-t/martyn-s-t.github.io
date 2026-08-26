<script setup>
import { ref, watch } from "vue";
import MidiLoader from "./main-menu/MidiLoader.vue";

const emit = defineEmits(["file-selected", "virtual-keyboard"]);
function fileSelected(file, gameMode) { 
    emit("file-selected", file, gameMode) 
}
function selectMode(mode) {
    switch (mode) {
        case "virtual-keyboard":
            return emit("virtual-keyboard");
    }
}

const selectedFile = ref(null);
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
]);

watch(selectedFile, async (newValue) => {
    if (newValue) {
        const response = await fetch(`./public/samples/midi/${newValue}`);
        if (!response.ok) {
            console.error("Failed to fetch the MIDI file:", response.statusText);
            return;
        }
        fileSelected(response);
    }
});
</script>

<template>
    <v-row>
        <v-col>
            <v-card>
                <v-card-title>
                    Load Virtual Keyboard
                </v-card-title>
                <v-card-text>
                    something soemthing
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="selectMode('virtual-keyboard')">Load Virtual Keyboard</v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
        <v-col>
            <MidiLoader @file-selected="fileSelected" />
        </v-col>
        <v-col>
            <v-card>
                <v-card-title>
                    Load from public
                </v-card-title>
                <v-card-text>
                    <v-select label="Select a file" v-model="selectedFile" :items="publicFiles" hide-details="auto" density="compact" />
                </v-card-text>
            </v-card>
        </v-col>
        <v-col>
            <v-card>
                <v-card-title>
                    Midi Tools
                </v-card-title>
                <v-card-text>
                    something soemthing
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped></style>