<script setup>
import { computed, ref } from 'vue';

const emit = defineEmits("download-midi");
const midiJson = defineModel("midiJson");

const newBpm = ref(Math.round(midiJson.value.header.tempos[0].bpm));
const noteDivision = ref(64);
const nodeDevisionOptions = ref([1, 2, 4, 8, 16, 32, 64, 128]);

const quantizeModeFloorStart = ref(false);
const quantizeModeCeilDuration = ref(false);

const onlyOneTempo = computed(() => midiJson.value.header.tempos.length !== 1);
const secondsPerTick = computed(() => 60 / midiJson.value.header.tempos[0].bpm / midiJson.value.header.ppq);

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

const firstNoteTickFromAllTracks = computed(() => midiJson.value.tracks.reduce(
    (cumulative, current) =>
        Math.min(
            cumulative,
            current.notes.reduce(
                (cumulative, current) => Math.min(current.ticks, cumulative),
                Infinity
            )
        ),
    Infinity
));


function trim() {
    let newMidiJson = setStartTimeToZero(midiJson.value);
    newMidiJson = calculateTrackDuration(newMidiJson);
    midiJson.value = newMidiJson;
}
function setStartTimeToZero(midiJson) {
    let firstNoteTimestamp = firstNoteTimeFromAllTracks.value;
    let firstNoteTick = firstNoteTickFromAllTracks.value;

    let newMidiJson = {
        header: {
            keySignatures: midiJson.header.keySignatures,
            meta: midiJson.header.meta,
            name: midiJson.header.name,
            ppq: midiJson.header.ppq,
            tempos: midiJson.header.tempos.map(tempo => ({
                bpm: tempo.bpm,
                ticks: tempo.ticks
            })),
            timeSignatures: midiJson.header.timeSignatures.map(timeSignature => ({
                measures: timeSignature.measures,
                ticks: timeSignature.ticks,
                timeSignature: timeSignature.timeSignature
            })),
        },
        tracks: midiJson.tracks.map(track => ({
            channel: track.channel,
            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([controlChangeNumber, controlChangeEvents]) => ([
                    controlChangeNumber,
                    controlChangeEvents.map(controlChange => ({
                        number: controlChange.number,
                        ticks: Math.max(controlChange.ticks - firstNoteTick, 0), // update
                        time: Math.max(controlChange.time - firstNoteTimestamp, 0), // update
                        value: controlChange.value
                    }))
                ]))
            ),
            endOfTrackTicks: track.endOfTrackTicks - firstNoteTick, // update
            instrument: {
                family: track.instrument.family,
                number: track.instrument.number,
                name: track.instrument.name,
            },
            name: track.name,
            notes: track.notes.map(note => ({
                duration: note.duration,
                durationTicks: note.durationTicks,
                midi: note.midi,
                name: note.name,
                ticks: Math.max(note.ticks - firstNoteTick, 0), // update
                time: Math.max(note.time - firstNoteTimestamp, 0), // update
                velocity: note.velocity
            })),
            pitchBends: track.pitchBends.map(pitchBend => ({
                ticks: Math.max(pitchBend.ticks - firstNoteTick, 0), // update
                time: Math.max(pitchBend.time - firstNoteTimestamp, 0), // update
                value: pitchBend.value,
            }))
        }))
    };
    return newMidiJson;
}
function calculateTrackDuration(midiJson) {
    let newMidiJson = {
        header: {
            keySignatures: midiJson.header.keySignatures,
            meta: midiJson.header.meta,
            name: midiJson.header.name,
            ppq: midiJson.header.ppq,
            tempos: midiJson.header.tempos.map(tempo => ({
                bpm: tempo.bpm,
                ticks: tempo.ticks
            })),
            timeSignatures: midiJson.header.timeSignatures.map(timeSignature => ({
                measures: timeSignature.measures,
                ticks: timeSignature.ticks,
                timeSignature: timeSignature.timeSignature
            })),
        },
        tracks: midiJson.tracks.map(track => ({
            channel: track.channel,
            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([controlChangeNumber, controlChangeEvents]) => ([
                    controlChangeNumber,
                    controlChangeEvents.map(controlChange => ({
                        number: controlChange.number,
                        ticks: controlChange.ticks,
                        time: controlChange.time,
                        value: controlChange.value
                    }))
                ]))
            ),
            endOfTrackTicks: track.notes.reduce((cumulative, current) => Math.max(current.ticks + current.durationTicks, cumulative), 0), //update
            instrument: {
                family: track.instrument.family,
                number: track.instrument.number,
                name: track.instrument.name,
            },
            name: track.name,
            notes: track.notes.map(note => ({
                duration: note.duration,
                durationTicks: note.durationTicks,
                midi: note.midi,
                name: note.name,
                ticks: note.ticks,
                time: note.time,
                velocity: note.velocity
            })),
            pitchBends: track.pitchBends.map(pitchBend => ({
                ticks: pitchBend.ticks,
                time: pitchBend.time,
                value: pitchBend.value
            }))
        }))
    };
    return newMidiJson;
}
function updateBpm() {
    const newSecondsPerTick = (60 / newBpm.value) / midiJson.value.header.ppq

    let newMidiJson = {
        header: {
            keySignatures: midiJson.value.header.keySignatures,
            meta: midiJson.value.header.meta,
            name: midiJson.value.header.name,
            ppq: midiJson.value.header.ppq,
            tempos: midiJson.value.header.tempos.map(tempo => ({
                bpm: newBpm.value,
                ticks: tempo.ticks
            })),
            timeSignatures: midiJson.value.header.timeSignatures.map(timeSignature => ({
                measures: timeSignature.measures,
                ticks: timeSignature.ticks,
                timeSignature: timeSignature.timeSignature
            })),
        },
        tracks: midiJson.value.tracks.map(track => ({
            channel: track.channel,
            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([controlChangeNumber, controlChangeEvents]) => ([
                    controlChangeNumber,
                    controlChangeEvents.map(controlChange => ({
                        number: controlChange.number,
                        ticks: controlChange.ticks,
                        time: controlChange.ticks * newSecondsPerTick, // update
                        value: controlChange.value
                    }))
                ]))
            ),
            endOfTrackTicks: track.endOfTrackTicks,
            instrument: {
                family: track.instrument.family,
                number: track.instrument.number,
                name: track.instrument.name,
            },
            name: track.name,
            notes: track.notes.map(note => ({
                duration: note.durationTicks * newSecondsPerTick, // update
                durationTicks: note.durationTicks,
                midi: note.midi,
                name: note.name,
                ticks: note.ticks,
                time: note.ticks * newSecondsPerTick, // update
                velocity: note.velocity
            })),
            pitchBends: track.pitchBends.map(pitchBend => ({
                ticks: pitchBend.ticks,
                time: pitchBend.ticks * newSecondsPerTick, // update
                value: pitchBend.value,
            }))
        }))
    };

    midiJson.value = newMidiJson;

    console.log(newMidiJson);
}
function quantize() {
    const grid = (midiJson.value.header.ppq * 4) / noteDivision.value;

    let newMidiJson = {
        header: {
            keySignatures: midiJson.value.header.keySignatures,
            meta: midiJson.value.header.meta,
            name: midiJson.value.header.name,
            ppq: midiJson.value.header.ppq,
            tempos: midiJson.value.header.tempos.map(tempo => ({
                bpm: tempo.bpm,
                ticks: tempo.ticks
            })),
            timeSignatures: midiJson.value.header.timeSignatures.map(timeSignature => ({
                measures: timeSignature.measures,
                ticks: timeSignature.ticks,
                timeSignature: timeSignature.timeSignature
            })),
        },

        tracks: midiJson.value.tracks.map(track => ({
            channel: track.channel,

            controlChanges: Object.fromEntries(
                Object.entries(track.controlChanges).map(([controlChangeNumber, controlChangeEvents]) => ([
                    controlChangeNumber,
                    controlChangeEvents.map(controlChange => {
                        const snappedTicks = quantizeStart(controlChange.ticks, grid)

                        return {
                            number: controlChange.number,
                            ticks: snappedTicks,
                            time: snappedTicks * secondsPerTick.value,
                            value: controlChange.value
                        }
                    }).sort((a, b) => a.ticks - b.ticks)
                ]))
            ),

            endOfTrackTicks: quantizeDuration(track.endOfTrackTicks, grid),

            instrument: {
                family: track.instrument.family,
                number: track.instrument.number,
                name: track.instrument.name,
            },

            name: track.name,

            notes: track.notes.map(note => {
                const snappedTicks = quantizeStart(note.ticks, grid)
                const snappedDurationTicks = quantizeDuration(note.durationTicks, grid)

                return {
                    duration: snappedDurationTicks * secondsPerTick.value,
                    durationTicks: snappedDurationTicks,
                    midi: note.midi,
                    name: note.name,
                    ticks: snappedTicks,
                    time: snappedTicks * secondsPerTick.value,
                    velocity: note.velocity
                }
            }).sort((a, b) => a.ticks - b.ticks),

            pitchBends: track.pitchBends.map(pitchBend => {
                const snappedTicks = quantizeStart(pitchBend.ticks, grid)

                return {
                    ticks: snappedTicks,
                    time: snappedTicks * secondsPerTick.value,
                    value: pitchBend.value
                }
            }).sort((a, b) => a.ticks - b.ticks)
        }))
    };

    midiJson.value = newMidiJson;
    console.log(newMidiJson);
}

function quantizeStart(ticks, grid) {
  if (quantizeModeFloorStart.value) return quantizeFloor(ticks, grid)
  return quantizeTicks(ticks, grid) // default round
}

function quantizeDuration(ticks, grid) {
  if (quantizeModeCeilDuration.value) return quantizeCeil(ticks, grid)
  return quantizeTicks(ticks, grid) // default round
}


function quantizeTicks(ticks, grid) {
    return Math.round(ticks / grid) * grid;
}

function quantizeFloor(ticks, grid) {
    return Math.floor(ticks / grid) * grid
}

function quantizeCeil(ticks, grid) {
    return Math.ceil(ticks / grid) * grid
}


function downloadMidi() {
    emit("download-midi");
}
</script>

<template>
    <v-container fluid>
        <v-row>
            <v-col cols="2"><v-btn block @click="trim" :disabled="onlyOneTempo">Trim</v-btn></v-col>
            
            <v-col cols="1"><v-number-input v-model="newBpm" density="compact" hide-details="auto" /></v-col>
            <v-col cols="2"><v-btn block @click="updateBpm" :disabled="onlyOneTempo">Update BPM</v-btn></v-col>

            <v-col cols="1"><v-switch label="Floor Start" v-model="quantizeModeFloorStart"/></v-col>
            <v-col cols="1"><v-switch label="Ceil Duration" v-model="quantizeModeCeilDuration"/></v-col>
            <v-col cols="1"><v-autocomplete v-model="noteDivision" :items="nodeDevisionOptions" density="compact" hide-details="auto" /></v-col>
            <v-col cols="2"><v-btn block @click="quantize" :disabled="onlyOneTempo || !noteDivision">Quantize</v-btn></v-col>
            
            <v-col cols="2"><v-btn block @click="downloadMidi">Download Midi</v-btn></v-col>
        </v-row>
    </v-container>
</template>

<style scoped></style>
