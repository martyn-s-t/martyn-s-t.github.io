<script setup>
import { ref, onMounted } from 'vue';
import { Midi } from "@tonejs/midi";
import { v4 as uuidv4, v4 } from 'uuid';

import EditSong from './song-manager/EditSong.vue';
import DeleteSong from './song-manager/DeleteSong.vue';
import UploadSong from './song-manager/UploadSong.vue';

const emit = defineEmits(["navigate", "song-selected"]);

const selectedSong = defineModel("selectedSong");
const songs = ref([]);

const editDialog = ref(false);
const deleteDialog = ref(false);
const uploadDialog = ref(false);


const songName = ref("");


const publicFiles = [
    "./samples/midi/FMA - Brothers.mid",
    "./samples/midi/FMA - Brothers - Part 1-4.mid",
    "./samples/midi/FMA - Brothers - Part 1.mid",
    "./samples/midi/FMA - Brothers - Part 2.mid",
    "./samples/midi/FMA - Brothers - Part 3.mid",
    "./samples/midi/FMA - Brothers - Part 4.mid",
    "./samples/midi/FMA - Brothers - Part 5.mid",
    "./samples/midi/FMA - Brothers - Part 6.mid",
    "./samples/midi/FMA - Brothers - Part 7.mid",
    "./samples/midi/Final Fantasy XV - Valse di Fantastica.mid",
    "./samples/midi/Final Fantasy XV - Valse di Fantastica - Part 1.mid",
    "./samples/midi/Final Fantasy XV - Valse di Fantastica - Part 2.mid",
    "./samples/midi/Final Fantasy XV - Valse di Fantastica - Part 3.mid",
    "./samples/midi/Steins;Gate - Believe Me.mid",
    "./samples/midi/SongOfStorms.mid",
];

const headers = ref([
    { title: "Song Name", key: "name" },
    { title: "Number of Tracks", key: "tracks" },
    { title: "Number of Notes", key: "notes" },
    { title: "Actions", key: "actions", sortable: false }
]);

function openEdit(song) {
    selectedSong.value = song;
    songName.value = song.name;
    editDialog.value = true;
}
function saveEdit() {
    selectedSong.value.name = songName.value;
    localStorage.setItem("songs", JSON.stringify(songs.value));
    editDialog.value = false; selectedSong.value = null; songName.value = "";
}

function openDelete(song) {
    selectedSong.value = song;
    songName.value = song.name;
    deleteDialog.value = true;
}
function deleteSong() {
    songs.value = songs.value.filter(song => song.id !== selectedSong.value.id);
    localStorage.setItem("songs", JSON.stringify(songs.value));
    localStorage.removeItem(`song-${selectedSong.value.id}`);
    deleteDialog.value = false; selectedSong.value = null; songName.value = "";
}

function openUpload() {
    uploadDialog.value = true;
}

function playSong(song) {
    selectedSong.value = song;
    emit("navigate", "song-mode-select");
}

onMounted(async () => {
    songs.value = localStorage.getItem("songs") ? JSON.parse(localStorage.getItem("songs")) : [];

    await Promise.all(publicFiles.filter(file => {
        return !songs.value.find(song => song.id === file)
    }).map(file => loadSongFromUrl(file)));
});

async function loadSongFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Failed to fetch the MIDI file:", response.statusText);
        return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    const midiJson = midi.toJSON();

    const song = { id: url, name: url.split("/").pop(), tracks: midiJson.tracks.length, notes: midiJson.tracks.reduce((acc, track) => acc + track.notes.length, 0) };

    songs.value.push(song);

    localStorage.setItem("songs", JSON.stringify(songs.value));
    localStorage.setItem(`song-${song.id}`, JSON.stringify(midiJson));

    uploadDialog.value = false;
}
async function loadSongFromFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    const midiJson = midi.toJSON();

    const song = { id: v4(), name: file.name, tracks: midiJson.tracks.length, notes: midiJson.tracks.reduce((acc, track) => acc + track.notes.length, 0) };

    songs.value.push(song);

    localStorage.setItem("songs", JSON.stringify(songs.value));
    localStorage.setItem(`song-${song.id}`, JSON.stringify(midiJson));

    uploadDialog.value = false;
}
</script>

<template>
    <v-container class="pa-4">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <v-btn color="error" @click="$emit('navigate', 'main-menu')">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <span>Loaded Songs</span>
                <v-btn color="primary" @click="openUpload">Upload</v-btn>
            </v-card-title>

            <v-data-table :headers="headers" :items="songs" item-key="name" class="elevation-1" @click:row="emit('song-selected', $event.item)">
                <template #item.actions="{ item }">
                    <v-btn icon color="primary" variant="text" @click="playSong(item)"><v-icon>mdi-play</v-icon></v-btn>
                    <v-btn icon variant="text" @click="openEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn icon color="error" variant="text" @click="openDelete(item)"><v-icon>mdi-delete</v-icon></v-btn>
                </template>

            </v-data-table>
        </v-card>
    </v-container>

    <EditSong v-model:display="editDialog" v-model:songName="songName" @save-song="saveEdit" />
    <DeleteSong v-model:display="deleteDialog" v-model:songName="songName" @delete-song="deleteSong" />
    <UploadSong v-model:display="uploadDialog" @upload-song-from-file="loadSongFromFile" @upload-song-from-url="" />
</template>

<style scoped></style>