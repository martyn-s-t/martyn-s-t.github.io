<script setup>
import { ref, watch } from 'vue';
import { Midi } from "@tonejs/midi";

import DragAndDrop from './midi-tools/DragAndDrop.vue';
import DisplayMidi from './midi-tools/DisplayMidi.vue';
import ActionBar from './midi-tools/ActionBar.vue';


const file = ref(null);
const midiJson = ref(null);

watch(file, convertToJson);

async function convertToJson() {
	if (!file.value) return

	// Read MIDI file as ArrayBuffer
	const arrayBuffer = await file.value.arrayBuffer()

	// Parse MIDI → JSON
	const midi = new Midi(arrayBuffer)
	midiJson.value = midi.toJSON()

	console.log("Converted JSON:", midiJson.value)
}
function downloadMidi() {
	const midi = new Midi();
	midi.fromJSON(midiJson.value);

	const bytes = midi.toArray();
	const blob = new Blob([bytes], { type: 'audio/midi' });

	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url
	a.download = `${file.value.name} - ${Date.now()}.mid`;
	a.click();

	URL.revokeObjectURL(url);
}
</script>

<template style='height:"100vh";'>
	<v-row><v-col class="d-flex justify-center">
			<h1>Midi Tools</h1>
		</v-col></v-row>

	<v-row><v-col class="d-flex justify-center">
			<DragAndDrop v-model:file="file" v-if="!midiJson" />
		</v-col></v-row>
	<v-row><v-col>
			<DisplayMidi v-model:file="file" v-model:midiJson="midiJson" v-if="midiJson" />
		</v-col></v-row>
	<v-row><v-col>
			<ActionBar v-model:midiJson="midiJson" v-if="midiJson" @download-midi="downloadMidi"></ActionBar>
		</v-col></v-row>
</template>

<style scoped></style>
