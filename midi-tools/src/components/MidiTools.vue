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
    if (!file.value) return;

    const arrayBuffer = await file.value.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    let json = midi.toJSON();

    if (json.header.tempos.length === 0) {
        addBpmFromFirstNote(json);
    }

    midiJson.value = json;
}

function downloadMidi() {
    const midi = new Midi();
    midi.fromJSON(midiJson.value);

    const bytes = midi.toArray();
    const blob = new Blob([bytes], { type: 'audio/midi' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${file.value.name.replace(".mid", "")} - ${Date.now()}.mid`;
    a.click();

    URL.revokeObjectURL(url);
}

function addBpmFromFirstNote(midi) {
    const bpm = bpmFromNote(midi.tracks[0].notes[0], midi.header.ppq);
    midi.header.tempos.push({ bpm, ticks: 0 });
}

function bpmFromNote(note, ppq) {
    const secondsPerTick = note.duration / note.durationTicks;
    const secondsPerQuarter = secondsPerTick * ppq;
    return 60 / secondsPerQuarter;
}

function ticksToSeconds(ticks, midi) {
    const ppq = midi.header.ppq;
    const tempos = midi.header.tempos;

    let last = tempos[0];
    let seconds = 0;

    for (let i = 1; i < tempos.length; i++) {
        const t = tempos[i];

        if (ticks < t.ticks) {
            const deltaTicks = ticks - last.ticks;
            seconds += deltaTicks * (60 / last.bpm) / ppq;
            return seconds;
        }

        const deltaTicks = t.ticks - last.ticks;
        seconds += deltaTicks * (60 / last.bpm) / ppq;
        last = t;
    }

    const deltaTicks = ticks - last.ticks;
    seconds += deltaTicks * (60 / last.bpm) / ppq;

    return seconds;
}

function secondsToTicks(seconds, midi) {
    const ppq = midi.header.ppq;
    const tempos = midi.header.tempos;

    let last = tempos[0];
    let ticks = 0;
    let remaining = seconds;

    for (let i = 1; i < tempos.length; i++) {
        const t = tempos[i];
        const secPerTick = (60 / last.bpm) / ppq;
        const segmentSeconds = (t.ticks - last.ticks) * secPerTick;

        if (remaining < segmentSeconds) {
            return ticks + remaining / secPerTick;
        }

        ticks += segmentSeconds / secPerTick;
        remaining -= segmentSeconds;
        last = t;
    }

    const secPerTick = (60 / last.bpm) / ppq;
    ticks += remaining / secPerTick;

    return ticks;
}

function updateBpmHandler(newBpm) {
    const ppq = midiJson.value.header.ppq;

    // NEW seconds per tick for the updated BPM
    const newSecondsPerTick = (60 / newBpm.bpm) / ppq;

    const updated = {
        header: {
            ...midiJson.value.header,
            tempos: midiJson.value.header.tempos.map(t => ({
                bpm: newBpm.bpm,
                ticks: t.ticks
            }))
        },

        tracks: midiJson.value.tracks.map(track => ({
            ...track,

            endOfTrackTicks: track.endOfTrackTicks,

            notes: track.notes.map(note => ({
                ...note,
                time: note.ticks * newSecondsPerTick,
                duration: note.durationTicks * newSecondsPerTick
            })),

            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([ccNum, events]) => ([
                    ccNum,
                    events.map(ev => ({
                        ...ev,
                        time: ev.ticks * newSecondsPerTick
                    }))
                ]))
            ),

            pitchBends: track.pitchBends.map(pb => ({
                ...pb,
                time: pb.ticks * newSecondsPerTick
            }))
        }))
    };

    midiJson.value = updated;
}



function quantiseMidiHandler({ division }) {
    const ppq = midiJson.value.header.ppq;
    const grid = (ppq * 4) / division;

    quantise(midiJson.value, grid);
}

function trimMidi(startSec, endSec) {
    if (!midiJson.value) return;

    for (const track of midiJson.value.tracks) {
        track.notes = track.notes.filter(note => {
            const sec = ticksToSeconds(note.ticks, midiJson.value);
            return sec >= startSec && sec <= endSec;
        });
    }
}

function shiftToStart() {
    if (!midiJson.value) return;

    // Find earliest note start (ticks)
    const firstTick = midiJson.value.tracks.reduce(
        (min, track) =>
            Math.min(min, ...track.notes.map(n => n.ticks)),
        Infinity
    );

    // Find earliest note start (seconds)
    const firstTime = midiJson.value.tracks.reduce(
        (min, track) =>
            Math.min(min, ...track.notes.map(n => n.time)),
        Infinity
    );

    const newJson = {
        header: {
            ...midiJson.value.header,
            tempos: midiJson.value.header.tempos.map(t => ({
                bpm: t.bpm,
                ticks: Math.max(t.ticks - firstTick, 0)
            }))
        },

        tracks: midiJson.value.tracks.map(track => ({
            ...track,

            endOfTrackTicks: Math.max(track.endOfTrackTicks - firstTick, 0),

            notes: track.notes.map(note => ({
                ...note,
                ticks: Math.max(note.ticks - firstTick, 0),
                time: Math.max(note.time - firstTime, 0)
            })),

            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([ccNum, events]) => ([
                    ccNum,
                    events.map(ev => ({
                        ...ev,
                        ticks: Math.max(ev.ticks - firstTick, 0),
                        time: Math.max(ev.time - firstTime, 0)
                    }))
                ]))
            ),

            pitchBends: track.pitchBends.map(pb => ({
                ...pb,
                ticks: Math.max(pb.ticks - firstTick, 0),
                time: Math.max(pb.time - firstTime, 0)
            }))
        }))
    };

    midiJson.value = newJson;
}

function buildClusters(track, jitterWindow = 0.015, arpeggioWindow = 0.12) {
    const notes = [...track.notes].sort((a, b) => a.time - b.time);
    const clusters = [];
    let cluster = [notes[0]];

    for (let i = 1; i < notes.length; i++) {
        const prev = notes[i - 1];
        const curr = notes[i];
        const delta = curr.time - prev.time;

        if (delta < arpeggioWindow) {
            cluster.push(curr);
        } else {
            clusters.push(cluster);
            cluster = [curr];
        }
    }

    clusters.push(cluster);
    return clusters;
}

function classifyCluster(cluster) {
    if (cluster.length === 1) return "single";

    const times = cluster.map(n => n.time);
    const deltas = times.slice(1).map((t, i) => t - times[i]);

    const maxDelta = Math.max(...deltas);
    const minDelta = Math.min(...deltas);

    // Chord: tiny jitter
    if (maxDelta < 0.015) return "chord";

    // Arpeggio: consistent spacing
    const consistent = deltas.every(d => Math.abs(d - deltas[0]) < 0.02);
    if (consistent && maxDelta < 0.12) return "arpeggio";

    // Sloppy timing: medium spacing but inconsistent
    if (maxDelta < 0.12) return "sloppy";

    // Sequential notes: large spacing
    return "sequential";
}

function snapCluster(cluster, midiJson, grid) {
    // Snap BACKWARD to the latest tick in the cluster
    const latestTick = Math.max(...cluster.map(n => n.ticks));
    const snappedTick = Math.floor(latestTick / grid) * grid;

    const secondsPerTick = 60 / midiJson.header.tempos[0].bpm / midiJson.header.ppq;

    // Snap start times
    for (const note of cluster) {
        note.ticks = snappedTick;
        note.time = snappedTick * secondsPerTick;
    }

    // NEW: unify durations so they end together
    const maxDurationTicks = Math.max(...cluster.map(n => n.durationTicks));

    for (const note of cluster) {
        note.durationTicks = maxDurationTicks;
        note.duration = maxDurationTicks * secondsPerTick;
    }
}

function removeOverlapsHandler() {
    removeOverlaps(midiJson.value);
}


function removeOverlaps(midiJson) {
    const ppq = midiJson.header.ppq;
    const bpm = midiJson.header.tempos[0].bpm;
    const secondsPerTick = 60 / bpm / ppq;

    const MIN_TICK_GAP = 1; // avoid note-off/note-on collision

    for (const track of midiJson.tracks) {
		const notesByMidi = track.notes.reduce((cumulative, current) => {
			cumulative[current.midi] ??= [];
			cumulative[current.midi].push(current);
			return cumulative;
		}, {});

		Object.entries(notesByMidi).forEach(([midi, notes]) => {
			notes = notes.sort((a, b) => a.ticks - b.ticks);
			notes.forEach((note, index) => {
				const endTick = note.ticks + note.durationTicks;
				const nextNote = notes[index + 1]
				if (nextNote && endTick > nextNote.ticks) {
					// Adjust the duration of the current note to avoid overlap
					note.durationTicks = Math.max(nextNote.ticks - note.ticks - MIN_TICK_GAP, 0);
					note.duration = note.durationTicks * secondsPerTick;
				}
			});
		});

		track.notes = Object.values(notesByMidi).flat().sort((a, b) => a.ticks - b.ticks);
    }
}



function quantise(midiJson, grid) {
    for (const track of midiJson.tracks) {
        const clusters = buildClusters(track);

        for (const cluster of clusters) {
            const type = classifyCluster(cluster);

            switch (type) {
                case "chord":
                case "arpeggio":
                case "sloppy":
                    snapCluster(cluster, midiJson, grid);
                    break;

                case "sequential":
                case "single":
                    // leave untouched
                    break;
            }
        }
    }
}

</script>

<template style='height:"100vh";'>
	<v-row><v-col class="d-flex justify-center">
			<h1>Midi Tools</h1>
		</v-col></v-row>

	<v-row><v-col class="d-flex justify-center">
			<DragAndDrop v-model:file="file" v-if="!midiJson" />
		</v-col>
	</v-row>
	<v-row><v-col>
			<DisplayMidi v-model:file="file" v-model:midiJson="midiJson" v-if="midiJson" />
		</v-col>
	</v-row>
	<v-row>
		<v-col>
			<ActionBar v-if="midiJson" v-model:midiJson="midiJson" @download-midi="downloadMidi" @quantise="quantiseMidiHandler" @trim="trimMidi" @update-bpm="updateBpmHandler" @shift-to-start="shiftToStart" @remove-overlaps="removeOverlapsHandler"/>
		</v-col>
	</v-row>
</template>

<style scoped></style>
