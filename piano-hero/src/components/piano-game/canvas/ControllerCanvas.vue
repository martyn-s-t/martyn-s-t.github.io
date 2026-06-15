<script setup>
import { ref } from 'vue';

const emit = defineEmits(["navigate-main-menu", "play", "pause", "stop", "init-midi", "connect-midi"]);

const midiInputs = defineModel("midiInputs");
const selectedMidi = ref(null);

const connected = ref(false);

function connectMidi() {
    emit("connect-midi", selectedMidi);
    connected.value = true;
}
</script>

<template >
    <v-row style="width:100vw; height:5vh" justify="center">
        <v-col cols="1" class="d-flex justify-center">
            <v-btn @click="$emit('navigate-main-menu')" block color="error"><v-icon size="x-large">mdi-chevron-left</v-icon></v-btn>
        </v-col>

        <v-col cols="3" class="d-flex justify-center">
            <v-btn @click="$emit('init-midi')"><v-icon size="x-large">mdi-piano</v-icon></v-btn>
            <v-select label="Input Device" :items="midiInputs" v-model="selectedMidi" density="compact" hide-details="auto" item-title="name" return-object :disabled="midiInputs.length === 0"/>
            <v-btn @click="connectMidi" :disabled="!selectedMidi" :color="connected ? 'success' : 'info' "><v-icon size="x-large">mdi-connection</v-icon></v-btn>
        </v-col>

        <v-col class="d-flex justify-center">
            <v-btn-group variant="outlined" divided>
                 <v-btn @click="$emit('play')"><v-icon size="x-large">mdi-play</v-icon></v-btn>
                 <v-btn @click="$emit('pause')"><v-icon size="x-large">mdi-pause</v-icon></v-btn>
                 <v-btn @click="$emit('stop')"><v-icon size="x-large">mdi-stop</v-icon></v-btn>
            </v-btn-group>
        </v-col>

        <v-col cols="4">

        </v-col>
    </v-row>
</template>

<style scoped>
    .v-btn-group {
        height: 100%;
    }
    .v-btn {
        height: 100%;
    }
</style>