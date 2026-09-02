<script setup>
import { onMounted, ref } from "vue";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import midiToMusicXml from "./../../engine/midiToMusicXml";

const emit = defineEmits(["navigate"]);

const selectedSong = defineModel("selectedSong");
const midi = ref({});

const container = ref(null);
const osmd = ref(null);

const musicXml = ref("");

onMounted(async () => {
    midi.value = JSON.parse(
        localStorage.getItem(`song-${selectedSong.value.id}`)
    );

    musicXml.value = midiToMusicXml(midi.value);

    window.xml = musicXml.value

    osmd.value = new OpenSheetMusicDisplay(container.value, {
        autoResize: true,
        drawTitle: true,
        drawComposer: false,
        drawPartNames: false,
        backend: "svg",
        pageFormat: "Endless",
        spacingBetweenSystems: 20,
        zoom: 0.9,
    });

    await osmd.value.load(musicXml.value);
    osmd.value.render();

});
</script>

<template>
    <v-row>
        <v-col>
            <v-btn color="error" @click="$emit('navigate', 'song-manager')">
                <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
        </v-col>
    </v-row>
    <div ref="container" class="osmd-container" style="width: 100%;"></div>
</template>

<style scoped>
.osmd-container {
    background: white !important;
    color: black !important;
}
</style>