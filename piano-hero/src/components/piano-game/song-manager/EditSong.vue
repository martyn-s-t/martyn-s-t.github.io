<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(["save-song"]);

const display = defineModel("display");
const songName = defineModel("songName");

const nameLocal = ref("");

function close() {
    display.value = false;
}


watch(() => display.value, (newVal) => {
    if (newVal) {
        nameLocal.value = songName.value;
    }
});
</script>

<template>
    <v-dialog v-model="display" max-width="400">
        <v-card>
            <v-card-title>Edit Song Name</v-card-title>

            <v-card-text>
                <v-text-field label="Song Name" v-model="nameLocal" autofocus />
            </v-card-text>

            <v-card-actions>
                <v-btn class="flex-grow-1" @click="close">
                    Cancel
                </v-btn>

                <v-btn class="flex-grow-1" color="primary" @click="emit('save-song', newName)">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped></style>