<script setup>
import { ref } from "vue";

const emit = defineEmits([
    "download-midi",
    "quantise",
    "trim",
    "update-bpm",
    "shift-to-start",
    "remove-overlaps"
]);

const midiJson = defineModel("midiJson");
console.log(midiJson.value);

/* BPM */
const newBpm = ref(Math.round(midiJson.value.header.tempos[0].bpm));

/* Quantise */
const noteDivision = ref(64);
const noteDivisionOptions = [1, 2, 4, 8, 16, 32, 64, 128];

/* Trim */
const trimStartSec = ref(0);
const trimEndSec = ref(10);

/* Emitters */
function download() {
    emit("download-midi");
}

function quantise() {
    emit("quantise", {
        division: noteDivision.value
    });
}

function trim() {
    emit("trim", {
        start: trimStartSec.value,
        end: trimEndSec.value
    });
}

function updateBpm() {
    emit("update-bpm", {
        bpm: newBpm.value
    });
}

function shiftToStart() {
    emit("shift-to-start");
}
</script>

<template>
    <v-container fluid>
        <v-row>

            <v-col cols="2">
                <v-btn block @click="shiftToStart">Shift To Start</v-btn>
            </v-col>

            <v-col cols="1">
                <v-number-input v-model="newBpm" density="compact" hide-details="auto" />
            </v-col>

            <v-col cols="2">
                <v-btn block @click="updateBpm">Update BPM</v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn block @click="emit('remove-overlaps')">Remove Overlaps</v-btn>
            </v-col>

            <v-col cols="1">
                <v-autocomplete v-model="noteDivision" :items="noteDivisionOptions" density="compact" hide-details="auto" />
            </v-col>

            <v-col cols="2">
                <v-btn block @click="quantise" :disabled="!noteDivision">
                    Quantise
                </v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn block @click="download">Download MIDI</v-btn>
            </v-col>

        </v-row>
    </v-container>
</template>

<style scoped></style>
