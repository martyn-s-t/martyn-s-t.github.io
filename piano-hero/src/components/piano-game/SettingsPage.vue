<script setup>
import { ref, onMounted } from "vue";
const emit = defineEmits(["navigate"]);


const selectedMidiInputDevice = ref(localStorage.getItem("midiInputDevice"));
const selectedMidiOutputDevice = ref(localStorage.getItem("midiOutputDevice"));
const requireHoldAllKeys = ref(localStorage.getItem("requireHoldAllKeys"));
const pressKeyLeeway = ref(localStorage.getItem("pressKeyLeeway"));

const midiInputDevices = ref([]);
const midiOutputDevices = ref([{id: null, name: "No Output"}, {id: "system-output", name: "System Output"}]);

async function initMIDI() {
    const access = await navigator.requestMIDIAccess();

    midiInputDevices.value = []; midiOutputDevices.value = [{id: null, name: "No Output"}, {id: "system-output", name: "System Output"}];
    access.inputs.forEach(input => midiInputDevices.value.push(input));
    access.outputs.forEach(output => midiOutputDevices.value.push(output));
}

onMounted(async () => {
    await initMIDI()
});


function saveSettings() {
    localStorage.setItem("midiInputDevice", selectedMidiInputDevice.value);
    localStorage.setItem("midiOutputDevice", selectedMidiOutputDevice.value);
    localStorage.setItem("requireHoldAllKeys", requireHoldAllKeys.value);
    localStorage.setItem("pressKeyLeeway", pressKeyLeeway.value);

    emit("navigate", "main-menu");
}
</script>

<template>
    <v-container class="pa-4" style="max-width: 600px;">
        <h2 class="mb-6">Settings</h2>

        <v-card class="mb-6 pa-4">
            <v-card-text>
                <h3 class="mb-4">Game Settings</h3>

                <v-row class="mb-4 align-center">
                    <v-col cols="12">
                        <v-switch label="Require Hold All Keys" v-model="requireHoldAllKeys" hide-details density="compact" />
                    </v-col>
                </v-row>
                <v-row class="mb-4 align-center">
                    <v-col cols="12">
                        <v-text-field label="Press Key Leeway (ms)" v-model="pressKeyLeeway" type="number" hide-details density="compact" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <h3 class="mb-4">MIDI Device</h3>

                <v-row class="mb-4 align-center">
                    <v-col cols="2">
                        <v-btn block @click="initMIDI"><v-icon size="x-large">mdi-piano</v-icon></v-btn>
                    </v-col>
                    <v-col cols="10">
                        <v-select label="Input Device" :items="midiInputDevices" item-title="name" item-value="id" v-model="selectedMidiInputDevice" hide-details density="compact" />
                    </v-col>
                </v-row>

                <v-row class="mb-4 align-center">
                    <v-col cols="2">
                        <v-btn block @click="initMIDI"><v-icon size="x-large">mdi-piano</v-icon></v-btn>
                    </v-col>
                    <v-col cols="10">
                        <v-select label="Output Device" :items="midiOutputDevices" item-title="name" item-value="id" v-model="selectedMidiOutputDevice" hide-details density="compact" />
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions class="d-flex">
                <v-btn color="secondary" class="flex-grow-1" @click="emit('navigate', 'main-menu')">Back</v-btn>
                <v-btn color="primary" class="flex-grow-1" @click="saveSettings">Save</v-btn>
            </v-card-actions>
        </v-card>

    </v-container>
</template>

<style scoped></style>