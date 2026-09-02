// src/engine/useGameEngine.js
import { ref } from "vue";
import * as Tone from "tone";

export default function useGameEngine() {
    const notes = ref([]);
    const fallingNotes = ref([]);

    const activeNotes = ref({});
    const requestedNotes = ref([]);

    const currentTime = ref(0);
    const duration = ref(0);

    const isPlaying = ref(false);
    const startTime = ref(0);
    const pausedAt = ref(0);
    const isSeeking = ref(false);

    const requireHoldAllKeys = ref(localStorage.getItem("requireHoldAllKeys") === "true");
    const keyPressLeeway = ref(Number(localStorage.getItem("keyPressLeeway") || 0));
    const timeToFall = ref(3);

    const SAMPLE_URLS = {
        A1: "A1.mp3",
        C3: "C3.mp3",
        C4: "C4.mp3",
        A4: "A4.mp3"
    };

    const voices = {};
    let sampler = null;

    async function initAudio() {
        sampler = new Tone.Sampler({
            urls: SAMPLE_URLS,
            release: 1,
            baseUrl: "/piano-hero/dist/samples/piano/"
        }).toDestination();

        await Tone.loaded();
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

    function noteOn(midi) {
        const now = getNow();

        activeNotes.value[midi] ??= { count: 0, pressedAt: now };
        const entry = activeNotes.value[midi];

        entry.count++;
        entry.pressedAt = now;

        const noteName = Tone.Frequency(midi, "midi").toNote();
        const voice = createVoice();

        voices[midi] ??= [];
        voices[midi].push(voice);

        voice.triggerAttack(noteName);
    }

    function noteOff(midi) {
        const entry = activeNotes.value[midi];
        if (!entry) return;

        entry.count--;
        if (entry.count <= 0) delete activeNotes.value[midi];

        const noteName = Tone.Frequency(midi, "midi").toNote();

        if (!voices[midi] || voices[midi].length === 0) return;

        const voice = voices[midi].shift();
        voice.triggerRelease(noteName);
    }

    function onKeyDown(midi, velocity = 100) {
        noteOn(midi);

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
        noteOff(midi);
    }

    function requestedNoteOn(note) {
        const midi = note.midi;
        const now = getNow();
        const entry = activeNotes.value[midi];

        if (mode === "listen") {
            noteOn(note.midi);
            setTimeout(() => noteOff(note.midi), note.duration * 1000);
            return;
        }

        if (mode === "learn") {
            if (entry) {
                const age = now - entry.pressedAt;
                if (age <= keyPressLeyway.value) {
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

        activeNotes.value = {};
        requestedNotes.value = {};
    }


    function seekTo(seconds) {
        const total = duration.value + timeToFall.value;
        const clamped = Math.max(0, Math.min(seconds, total));

        pausedAt.value = clamped;
        if (isPlaying.value) {
            startTime.value = getNow() - clamped;
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



    let mode = "listen";
    let hand = "both";

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
        console.log(midi);
        const left = midi.tracks[0]?.notes || [];
        const right = midi.tracks[1]?.notes || [];

        notes.value = [...left.map(n => ({ ...n, hand: "left" })),
        ...right.map(n => ({ ...n, hand: "right" }))];

        duration.value = ticksToSeconds(
            midi.tracks.reduce((max, track) => {
                return Math.max(max, track.endOfTrackTicks)
            }, 0), midi);

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
        const t = currentTime.value;

        for (const note of fallingNotes.value) {
            if (!note.hasPlayed && t >= note.triggerTime) {
                requestedNoteOn(note);
                note.hasPlayed = true;
            }
        }
    }

    function tick() {
        if (isPlaying.value && !isSeeking.value) {
            currentTime.value = getNow() - startTime.value;
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
        currentTime,
        duration,
        isPlaying,
        startTime,
        pausedAt,
        timeToFall,
        isSeeking,

        // input
        onKeyDown,
        onKeyUp,

        // playback
        play,
        pause,
        stop,
        seekTo,

        // modes
        startListen,
        startLearn,
        startPlay,

        // midi
        loadMidi,
        initAudio,

        // timing
        getNow,
        tick,

        // logic
        requestedNoteOn,
        prepareFallingNotes
    };
}