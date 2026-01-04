<script setup>
import { computed, ref } from 'vue';

const file = defineModel("file");
const midiJson = defineModel("midiJson");

const secondsPerTick = computed(() => 60 / midiJson.value.header.tempos[0].bpm / midiJson.value.header.ppq);
const ticksPerSecond = computed(() => midiJson.value.header.tempos[0].bpm * midiJson.value.header.ppq / 60);

const lastNoteTickFromAllTracks = computed(() => midiJson.value.tracks.reduce(
    (cumulative, current) =>
        Math.max(
            cumulative,
            current.endOfTrackTicks
        ),
    0
));

const firstNoteTimeFromAllTracks = computed(() => midiJson.value.tracks.reduce(
    (cumulative, current) =>
        Math.min(
            cumulative,
            current.notes.reduce(
                (cumulative, current) => Math.min(current.time, cumulative),
                Infinity
            )
        ),
    Infinity
));
</script>

<template>
    <v-container fluid>
        <v-row>
            <v-col class="d-flex justify-center">
                <h2>{{ file.name }}</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col>Number of Tracks: {{ midiJson.tracks.length }}</v-col>
            <v-col>PPQ: {{ midiJson.header.ppq }}</v-col>
            <v-col>BPM: {{ midiJson.header.tempos[0].bpm }}</v-col>
            <v-col>ticks/s: {{ ticksPerSecond }}</v-col>
            <v-col>s/ticks: {{ secondsPerTick }}</v-col>
            <v-col>Timestamp of First Note: {{ firstNoteTimeFromAllTracks }}</v-col>
            <v-col>Length in Ticks: {{ lastNoteTickFromAllTracks }}</v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-container>
                    <v-row v-for="track in midiJson.tracks">
                        <template v-if="track.notes.length">
                            <v-col>Channel: {{ track.channel }}</v-col>
                            <v-col>Name: {{ track.name }}</v-col>
                            <v-col>Number of Notes: {{ track.notes.length }}</v-col>
                            <v-col>Timestamp of First Note: {{track.notes.reduce((cumulative, current) => Math.min(current.time, cumulative), Infinity)}}</v-col>
                        </template>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped></style>
