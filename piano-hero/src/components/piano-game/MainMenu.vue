<script setup>
import MidiLoader from "./main-menu/MidiLoader.vue";

const emit = defineEmits(["file-selected", "virtual-keyboard"]);
function fileSelected(file, gameMode) { emit("file-selected", file, gameMode) }
function selectMode(mode) {
    switch (mode) {
        case "virtual-keyboard": 
            return emit("virtual-keyboard");
    }
}
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
                Midi Tools
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped></style>