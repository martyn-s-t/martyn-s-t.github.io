<script setup>
import { ref } from "vue";

const emit = defineEmits(["file-selected"]);
const file = ref(null);
const isDragging = ref(false);

function handleDrop(event) {
	isDragging.value = false;
	const droppedFile = event.dataTransfer.files[0];

	if (droppedFile && droppedFile.name.endsWith(".mid")) {
		file.value = droppedFile;
		emit("file-selected", droppedFile);
	}
}

function handleInput(fileName) {
	if (fileName?.name.endsWith(".mid")) {
		file.value = fileName;
		emit("file-selected", fileName);
	}
}
</script>

<template>
	<v-card width="600" elevation="6" class="pa-6 mx-auto">

		<!-- Drag + Drop Zone -->
		<div class="drop-zone" :class="{ 'drop-zone--active': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
			<p class="text-center">Drag & drop your MIDI file here</p>
		</div>

		<!-- Fallback File Input -->
		<v-file-input accept=".mid" label="Select MIDI file" prepend-icon="mdi-music" outlined dense class="mt-4" @update:modelValue="handleInput" />
	</v-card>
</template>

<style scoped>
.drop-zone {
	border: 2px dashed #888;
	border-radius: 8px;
	padding: 40px 20px;
	text-align: center;
	cursor: pointer;
	transition: border-color 0.2s, background-color 0.2s;
}

.drop-zone--active {
	border-color: #1976d2;
	background-color: rgba(25, 118, 210, 0.1);
}
</style>
