<script setup>
import MidiDropLoader from "./main-menu/MidiLoader.vue";

const emit = defineEmits(["file-selected"]);
function fileSelected(file) { emit("file-selected", file) }
</script>

<template>
    <MidiDropLoader @file-selected="fileSelected" />
</template>

<style scoped></style>