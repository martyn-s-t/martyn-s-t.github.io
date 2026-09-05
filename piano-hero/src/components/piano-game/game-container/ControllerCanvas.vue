<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(["navigate", "start", "play", "pause", "stop", "rec-on", "rec-off", "save-rec", "change-playback-speed"]);

const props = defineProps({
    mode: String,
    playbackSpeed: Number,
    isRecording: Boolean,
    hasRecording: Boolean
});

const playbackSpeedLocal = ref(props.playbackSpeed * 100);

function toggleRec() {
    if (isRecording.value) {
        emit("rec-off");
    } else {
        emit("rec-on");
    }
}

function navigate() {
    if (props.mode === "free") {
        emit("navigate", "main-menu");
    } else {
        emit("navigate");
    }
}

function onPlaybackSpeedChanged(value) {
    emit("change-playback-speed", value / 100);
    // playbackSpeedLocal.value = value;
}

</script>

<template>
    <v-row style="width:100%; height:5vh" justify="center" class="align-center">

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-btn block color="error" @click="navigate">
                <v-icon size="x-large">mdi-chevron-left</v-icon>
            </v-btn>
        </v-col>

        <v-col cols="3"></v-col>

        <v-col cols="4" class="d-flex justify-center h-100">
            <v-btn-group variant="outlined" divided>
                <v-btn v-if="mode === 'free'" @click="toggleRec" :color="isRecording ? 'red' : undefined">
                    <v-icon size="x-large">mdi-record</v-icon>
                </v-btn>

                <v-btn @click="$emit('start')">
                    <v-icon size="x-large">mdi-skip-previous</v-icon>
                </v-btn>

                <v-btn @click="$emit('play')">
                    <v-icon size="x-large">mdi-play</v-icon>
                </v-btn>

                <v-btn @click="$emit('pause')">
                    <v-icon size="x-large">mdi-pause</v-icon>
                </v-btn>

                <v-btn @click="$emit('stop')">
                    <v-icon size="x-large">mdi-stop</v-icon>
                </v-btn>

                <v-btn v-if="mode === 'free'" @click="$emit('save-rec')" :disabled="!hasRecording">
                    <v-icon size="x-large">mdi-content-save</v-icon>
                </v-btn>
            </v-btn-group>
        </v-col>

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-number-input v-model="playbackSpeedLocal" @update:model-value="onPlaybackSpeedChanged"
            :min="10" :max="200" :step="10" control-variant="split"></v-number-input>

        </v-col>

        <!-- Spacer -->
        <v-col cols="3">

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
