// src/engine/useGameEngine.js
import { ref } from "vue";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

export default function useGameEngine() {
    const notes = ref([]);
    const fallingNotes = ref([]);

    const activeNotes = ref({});
    const requestedNotes = ref([]);
    const recordedNotes = ref([]);

    const duration = ref(0);
    const totalSeconds = ref(0);
    const elapsedSeconds = ref(0);
    const progressPercentage = ref(0);

    const isPlaying = ref(false);
    const isSeeking = ref(false);
    const isRecording = ref(false);

    const hasRecording = ref(false);

    const startTime = ref(0);
    const recordStartTime = ref(0);
    const pausedAt = ref(0);

    const requireHoldAllKeys = ref(localStorage.getItem("requireHoldAllKeys") === "true");
    const keyPressLeeway = ref(Number(localStorage.getItem("keyPressLeeway") || 0));

    const midiInputDeviceId = ref(localStorage.getItem("midiInputDevice"));
    const midiOutputDeviceId = ref(localStorage.getItem("midiOutputDevice"));
    const midiInputDevice = ref(null);
    const midiOutputDevice = ref(null);

    const midiInputDevices = ref([]);
    const midiOutputDevices = ref([]);

    const timeToFall = ref(3);
    const playbackSpeed = ref(1.0);
    const ppq = ref(384);

    const SAMPLE_URLS = {
        A1: "A1.mp3",
        C3: "C3.mp3",
        C4: "C4.mp3",
        A4: "A4.mp3"
    };

    const voices = {};
    let sampler = null;

    async function initMidiDevices() {
        const access = await navigator.requestMIDIAccess();

        midiInputDevices.value = []; midiOutputDevices.value = [];
        access.inputs.forEach(input => midiInputDevices.value.push(input));
        access.outputs.forEach(output => midiOutputDevices.value.push(output));

        midiInputDevice.value = midiInputDevices.value.find(midiInputDevice => midiInputDevice.id === midiInputDeviceId.value);
        midiOutputDevice.value = midiOutputDevices.value.find(midiOutputDevice => midiOutputDevice.id === midiOutputDeviceId.value);

        if (midiInputDevice.value)
            midiInputDevice.value.onmidimessage = handleMIDIMessage;
    }

    async function initAudio() {
        switch (midiOutputDeviceId.value) {
            case null:
            case undefined:
            case "":
                return;
            case "system-output":
                sampler = new Tone.Sampler({
                    urls: SAMPLE_URLS,
                    release: 1,
                    baseUrl: "/piano-hero/dist/samples/piano/"
                }).toDestination();

                return await Tone.loaded();
            default:
        }
    }

    function createVoice() {
        const voice = new Tone.Sampler({
            urls: SAMPLE_URLS,
            release: 1,
            baseUrl: "/piano-hero/dist/samples/piano/"
        }).toDestination();

        voice._buffers = sampler._buffers;
        return voice;
    }

    function handleMIDIMessage(event) {
        console.log(event);
        const [status, note, data2] = event.data;

        const command = status & 0xF0; // message type
        const channel = status & 0x0F; // channel number

        switch (command) {
            case 0x90: // Note On
                if (data2 > 0) {
                    onKeyDown(note);
                } else {
                    onKeyUp(note);
                }
                break;
            case 0x80: // Note Off
                onKeyUp(note);
                break;
            case 0xB0: // Control Change
                break;
            default:
            // console.log(`Other MIDI message: ${event.data}`);
        }
    }

    function noteOn(midi, velocity = 0.8) {
        const now = getNow();

        activeNotes.value[midi] ??= { count: 0, pressedAt: now, velocity: 0 };
        const entry = activeNotes.value[midi];

        entry.count++;
        entry.pressedAt = now;
        entry.velocity = velocity;

        playNote(midi, velocity)
    }

    function noteOff(midi) {
        const entry = activeNotes.value[midi];
        if (!entry) return;

        entry.count--;
        if (entry.count <= 0) delete activeNotes.value[midi];

        stopNote(midi);
    }

    function playNote(midi, velocity) {
        switch (midiOutputDeviceId.value) {
            case null:
            case undefined:
            case "":
                return;
            case "system-output":
                const noteName = Tone.Frequency(midi, "midi").toNote();
                const voice = createVoice();

                voices[midi] ??= [];
                voices[midi].push(voice);

                voice.triggerAttack(noteName);
                return;
            default:
                if (midiOutputDevice.value) {
                    const vel = Math.floor((velocity ?? 0.8) * 127);

                    // Note On: 0x90 + channel (0)
                    midiOutputDevice.value.send([0x90, midi, vel]);
                    return;
                }
        }
    }
    function stopNote(midi) {
        switch (midiOutputDeviceId.value) {
            case null:
            case undefined:
            case "":
                return;
            case "system-output":
                const noteName = Tone.Frequency(midi, "midi").toNote();
                if (!voices[midi] || voices[midi].length === 0) return;
                const voice = voices[midi].shift();
                voice.triggerRelease(noteName);
            default:
                if (midiOutputDevice.value) {
                    midiOutputDevice.value.send([0x80, midi, 0]);
                    return;
                }
        }
    }

    function onKeyDown(midi, velocity = 1) {
        noteOn(midi, velocity);

        // Learn mode: mark requested notes as pressed
        if (mode === "learn") {
            for (const req of requestedNotes.value) {
                if (req.midi === midi) req.pressed = true;
            }

            const pass = requestedNotes.value.every(req => {
                if (!requireHoldAllKeys.value) return req.pressed;

                const entry = activeNotes.value[req.midi];
                return entry && entry.count > 0;
            });

            if (pass) {
                requestedNotes.value = [];
                play();
            }
        }
    }

    function onKeyUp(midi) {
        if (mode === "free") {
            if (isRecording.value) {
                const entry = activeNotes.value[midi];
                if (entry) {
                    const duration = getNow() - entry.pressedAt;
                    const start = entry.pressedAt - recordStartTime.value;
                    const note = {
                        "duration": duration,
                        "durationTicks": Math.round(duration * ppq.value),
                        "midi": midi,
                        "name": Tone.Frequency(midi, "midi").toNote(),
                        "ticks": Math.round(start * ppq.value),
                        "time": start,
                        "velocity": entry.velocity
                    }
                    recordedNotes.value.push(note);
                };
            }
        }
        noteOff(midi);
    }

    function requestedNoteOn(note) {
        const midi = note.midi;
        const now = getNow();
        const entry = activeNotes.value[midi];
        const noteDuration = note.duration * 1000 / playbackSpeed.value

        if (mode === "listen") {
            noteOn(note.midi);
            setTimeout(() => noteOff(note.midi), noteDuration);
            return;
        }

        if (mode === "learn") {
            if ((note.hand === hand) || hand === "both") {
                if (entry) {
                    const age = now - entry.pressedAt;
                    if (age <= keyPressLeeway.value) {
                        requestedNotes.value.push({
                            midi: midi,
                            pressed: true,
                            hand: note.hand,
                        });
                        return;
                    }
                }
                requestedNotes.value.push({
                    midi: note.midi,
                    pressed: false,
                    hand: note.hand
                });

                pause();
            } else {
                noteOn(note.midi);
                setTimeout(() => noteOff(note.midi), noteDuration);
            }
            return;
        }

        if (mode === "play") {
            // scoring logic goes here
        }
    }


    function getNow() {
        return Tone.now();
    }

    async function play() {
        if (isPlaying.value) return;

        await Tone.start();

        if (pausedAt.value) {
            startTime.value = getNow() - pausedAt.value;
        } else {
            startTime.value = getNow();
        }

        isPlaying.value = true;
    }

    function pause() {
        if (!isPlaying.value) return;

        pausedAt.value = getNow() - startTime.value;
        isPlaying.value = false;
    }

    function stop() {
        isPlaying.value = false;
        pausedAt.value = 0;
        startTime.value = 0;

        fallingNotes.value.forEach(note => note.hasPlayed = false);
        activeNotes.value = {};
        requestedNotes.value = [];
    }
    async function start() {
        stop();
        await play();
    }

    function seekTo(seconds) {
        const clamped = Math.max(0, Math.min(seconds, totalSeconds.value));

        elapsedSeconds.value = clamped;
        pausedAt.value = clamped;

        if (isPlaying.value) {
            startTime.value = getNow() - (clamped / playbackSpeed.value);
        } else {
            startTime.value = 0;
        }

        requestedNotes.value = [];
        activeNotes.value = {};

        fallingNotes.value.forEach(n => {
            n.hasPlayed = n.triggerTime <= clamped;
            n.yPosition = -n.height;
        });
    }
    function setPlaybackSpeed(value) {
        playbackSpeed.value = Math.max(0.1, Math.min(2.0, value));
    }

    function recOn() {
        recordedNotes.value = [];
        recordStartTime.value = getNow();
        isRecording.value = true;
    }
    function recOff() {
        isRecording.value = false;
        hasRecording.value = Boolean(recordedNotes.value.length);
    }

    function saveRec() {
        const midi = new Midi();
        const track = midi.addTrack();
        recordedNotes.value.forEach(note => track.addNote(note));


        const bytes = midi.toArray();
        const blob = new Blob([bytes], { type: "audio/midi" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `Recording-${Date.now()}.mid`;
        a.click();

        URL.revokeObjectURL(url);
    }

    let mode = "listen";
    let hand = "both";

    function startFreePlay() {
        mode = "free";
        stop();

        fallingNotes.value = [];
    }
    function startListen() {
        mode = "listen";
        play();
    }

    function startLearn(selectedHand) {
        mode = "learn";
        hand = selectedHand;
        play();
    }

    function startPlay(selectedHand) {
        mode = "play";
        hand = selectedHand;
        play();
    }


    function loadMidi(midi) {
        const left = midi.tracks[1]?.notes || [];
        const right = midi.tracks[0]?.notes || [];

        notes.value = [...left.map(n => ({ ...n, hand: "left" })),
        ...right.map(n => ({ ...n, hand: "right" }))];

        duration.value = ticksToSeconds(
            midi.tracks.reduce((max, track) => {
                return Math.max(max, track.endOfTrackTicks)
            }, 0), midi);
        totalSeconds.value = duration.value + timeToFall.value;

        prepareFallingNotes();
    }

    function prepareFallingNotes() {
        fallingNotes.value = notes.value.map(note => {
            return {
                midi: note.midi,
                hand: note.hand,

                startTime: note.time,
                endTime: note.time + note.duration + timeToFall.value,
                duration: note.duration,
                triggerTime: note.time + timeToFall.value,

                yPosition: 0,
                height: 0,
                speed: 0,

                hasPlayed: false
            };
        });
    }

    function updateNoteTriggers() {
        const time = elapsedSeconds.value;

        for (const note of fallingNotes.value) {
            if (!note.hasPlayed && time >= note.triggerTime) {
                requestedNoteOn(note);
                note.hasPlayed = true;
            }
        }
    }

    function tick() {
        const now = getNow();
        if (isPlaying.value && !isSeeking.value) {
            elapsedSeconds.value = isPlaying.value ? Math.min((now - startTime.value) * playbackSpeed.value, totalSeconds.value) : pausedAt.value;
            progressPercentage.value = elapsedSeconds.value / totalSeconds.value;
            updateNoteTriggers();
        }
        requestAnimationFrame(tick);
    }

    function ticksToSeconds(ticks, midi) {
        const ppq = midi.header.ppq;
        const tempos = midi.header.tempos;

        if (tempos.length === 0) {
            addBpmFromFirstNote(midi);
        }

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

    function addBpmFromFirstNote(midi) {
        const bpm = bpmFromNote(midi.tracks[0].notes[0], midi.header.ppq);
        midi.header.tempos.push({ bpm, ticks: 0 });
    }

    function bpmFromNote(note, ppq) {
        const secondsPerTick = note.duration / note.durationTicks;
        const secondsPerQuarter = secondsPerTick * ppq;
        return 60 / secondsPerQuarter;
    }

    tick();
    return {
        // state
        notes,
        fallingNotes,
        activeNotes,
        requestedNotes,

        duration,

        totalSeconds,
        elapsedSeconds,
        progressPercentage,

        isPlaying,
        isSeeking,
        isRecording,
        hasRecording,
        playbackSpeed,

        startTime,
        pausedAt,
        timeToFall,

        // input
        handleMIDIMessage,
        onKeyDown,
        onKeyUp,

        // playback
        play,
        pause,
        stop,
        start,
        seekTo,
        setPlaybackSpeed,

        // recording
        recOn,
        recOff,
        saveRec,

        // modes
        startFreePlay,
        startListen,
        startLearn,
        startPlay,

        // midi
        loadMidi,
        initMidiDevices,
        initAudio,

        // timing
        getNow,
        tick,

        // logic
        requestedNoteOn,
        prepareFallingNotes
    };
}