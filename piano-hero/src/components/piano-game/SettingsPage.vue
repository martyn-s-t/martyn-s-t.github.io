<script setup>
import { ref, onMounted } from "vue";
const emit = defineEmits(["navigate"]);

const selectedMidiDevice = defineModel("selectedMidiDevice");
const requireHoldAllKeys = defineModel("requireHoldAllKeys");
const pressKeyLeeway = defineModel("pressKeyLeeway");

const selectedMidiDeviceLocal = ref(null);
const requireHoldAllKeysLocal = ref(true);
const pressKeyLeewayLocal = ref(100);

const midiDevices = ref([]);

async function initMIDI() {
    const access = await navigator.requestMIDIAccess();

    midiDevices.value = [];
    access.inputs.forEach(input => midiDevices.value.push(input));

}

onMounted(async () => {
    await initMIDI()
    selectedMidiDeviceLocal.value = selectedMidiDevice.value;
    requireHoldAllKeysLocal.value = requireHoldAllKeys.value;
    pressKeyLeewayLocal.value = pressKeyLeeway.value;
});


function saveSettings() {
    selectedMidiDevice.value = selectedMidiDeviceLocal.value;
    requireHoldAllKeys.value = requireHoldAllKeysLocal.value;
    pressKeyLeeway.value = pressKeyLeewayLocal.value;

    localStorage.setItem("midiDevice", selectedMidiDevice.value);
    localStorage.setItem("requireHoldAllKeys", requireHoldAllKeys.value);
    localStorage.setItem("pressKeyLeeway", pressKeyLeeway.value);

    console.log(localStorage.getItem("midiDevice"));

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
                        <v-switch label="Require Hold All Keys" v-model="requireHoldAllKeysLocal" hide-details density="compact" />
                    </v-col>
                </v-row>
                <v-row class="mb-4 align-center">
                    <v-col cols="12">
                        <v-text-field label="Press Key Leeway (ms)" v-model="pressKeyLeewayLocal" type="number" hide-details density="compact" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text>
                <h3 class="mb-4">MIDI Device</h3>

                <v-row class="mb-4 align-center">
                    <v-col cols="2">
                        <v-btn block @click="initMIDI">
                            <v-icon size="x-large">mdi-piano</v-icon>
                        </v-btn>
                    </v-col>

                    <v-col cols="10">
                        <v-select label="Input Device" :items="midiDevices" item-title="name" return-object v-model="selectedMidiDeviceLocal" hide-details density="compact" />
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