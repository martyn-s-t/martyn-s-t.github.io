<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(["delete-song"]);

const display = defineModel("display");
const songName = defineModel("songName");

function close() {
    display.value = false;
}


</script>

<template>
    <v-dialog v-model="display" max-width="400">
        <v-card>
            <v-card-title>Delete {{ songName }}</v-card-title>

            <v-card-actions>
                <v-btn class="flex-grow-1" @click="close">
                    Cancel
                </v-btn>

                <v-btn class="flex-grow-1" color="error" @click="emit('delete-song')">
                    Delete
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped></style>