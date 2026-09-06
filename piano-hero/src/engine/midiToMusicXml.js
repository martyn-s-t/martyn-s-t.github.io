function quantiseTrack(track, divisions, subdivision = 4) {
    const step = divisions / subdivision;
    const notes = track.notes;


    notes.sort((a, b) => a.ticks - b.ticks);

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];

        const originalTick = note.ticks;
        const quantisedTick = Math.round(originalTick / step) * step;
        const startDelta = quantisedTick - originalTick;

        const originalDuration = note.durationTicks;
        const quantisedDuration = Math.round(originalDuration / step) * step;
        const durationDelta = quantisedDuration - originalDuration;

        note.ticks = quantisedTick;
        note.durationTicks = quantisedDuration;

        if (startDelta !== 0 || durationDelta !== 0) {
            for (let j = i + 1; j < notes.length; j++) {
                notes[j].ticks += startDelta + durationDelta;
            }
        }
    }

    return track;
}
function addNoteWithSplitting(note) {
    let remaining = note.duration;

    while (remaining > 0) {
        const available = measureTicks - currentMeasureTicks;

        // If measure is full, start a new one
        if (available === 0) {
            startNewMeasure();
        }

        const chunk = Math.min(available, remaining);

        const isFirstChunk = remaining === note.duration;
        const isLastChunk = remaining - chunk === 0;

        addNoteToXML({
            pitch: note.pitch,
            duration: chunk,
            tieStart: isFirstChunk && !isLastChunk,
            tieStop: isLastChunk && !isFirstChunk,
            tieContinue: !isFirstChunk && !isLastChunk,
            voice: note.voice,
            staff: note.staff
        });

        currentMeasureTicks += chunk;
        remaining -= chunk;

        if (remaining > 0 && currentMeasureTicks === measureTicks) {
            startNewMeasure();
        }
    }
}


function pitchFromNote(note) {
    const step = note.name[0];
    const alter = note.name.includes("#") ? 1 : 0;
    const octave = Number(note.name.slice(-1));
    return { step, alter, octave }
}

function createNote(note, staffNumber, isChord = false) {
    const { step, alter, octave } = pitchFromNote(note)
    return `
    <note>
        ${isChord ? "<chord/>" : ""}
        <pitch>
            <step>${step}</step>
            <alter>${alter}</alter>
            <octave>${octave}</octave>
        </pitch>
        <duration>${note.durationTicks}</duration>
        <voice>${staffNumber}</voice>
        <staff>${staffNumber}</staff>
    </note>`;
}
function createRest(duration, staffNumber) {
    return `<note>
        <rest/>
        <duration>${duration}</duration>
        <voice>${staffNumber}</voice>
        <staff>${staffNumber}</staff>
    </note>`

}
function createForward(deltaTicks) {
    return `
    <forward>
        <duration>${deltaTicks}</duration>
    </forward>`;
}
function createBackup(deltaTicks) {
    return `
    <backup>
        <duration>${deltaTicks}</duration>
    </backup>`;
}
function createAttributes(divisions) {
    return `
    <attributes>
        <divisions>${divisions}</divisions>
        <staves>2</staves>
        <clef number="1">
            <sign>G</sign>
            <line>2</line>
        </clef>
        <clef number="2">
            <sign>F</sign>
            <line>4</line>
        </clef>
    </attributes>`;
}
function createMetronome(bpm) {
    return `
    <direction placement="above">
        <direction-type>
            <metronome>
                <beat-unit>quarter</beat-unit>
                <per-minute>${bpm}</per-minute>
            </metronome>
        </direction-type>
    </direction>`;
}
function processTrack(track, ticks, staffNumber, ticksPerMeasure, measureIndex) {
    if (!ticks.length) return "";

    let xml = "";
    let lastTick = measureIndex * ticksPerMeasure;
    let finalTick = (measureIndex + 1) * ticksPerMeasure;

    for (const tick of ticks) {
        if (tick !== lastTick) {
            xml += createForward(tick - lastTick);
        }

        const notes = track[tick];
        notes.forEach((note, index) => {
            xml += createNote(note, staffNumber, index > 0);
        });
        let maxDuration = notes.reduce((cumulative, current) => Math.max(cumulative, current.durationTicks), 0);

        lastTick = tick + maxDuration;
    }

    if (finalTick - lastTick > 0)
        xml += createForward(finalTick - lastTick, staffNumber);
    return xml;
}

function buildMeasure(groupedMeasure, divisions, bpm, measureIndex, beatsPerMeasure) {
    const trebleTrack = groupedMeasure[0] ?? {};
    const bassTrack = groupedMeasure[1] ?? {};

    const trebleTicks = Object.keys(trebleTrack).map(Number).sort((a, b) => a - b);
    const bassTicks = Object.keys(bassTrack).map(Number).sort((a, b) => a - b);

    const measureDuration = divisions * beatsPerMeasure;

    let xml = "";

    
    if (measureIndex === 0)
        xml += createAttributes(divisions);
        xml += createMetronome(bpm);


    xml += processTrack(trebleTrack, trebleTicks, 1, measureDuration, measureIndex);

    if (measureDuration > 0)
        xml += createBackup(measureDuration);

    xml += processTrack(bassTrack, bassTicks, 2, measureDuration, measureIndex);

    return `<measure number="${measureIndex + 1}">${xml}</measure>`;
}

export default function midiToMusicXml(midiJson, bpm = 120, beatsPerMeasure = 4) {
    const ppq = midiJson.header.ppq;
    const divisions = ppq;
    bpm = midiJson.header.tempos[0]

    const title = midiJson.header.name || "";
    const numberOfTracks = midiJson.tracks.length;

    midiJson.tracks.forEach((track, index) => track.notes.forEach(note => {
        note.track = numberOfTracks === 2 ? index : note.midi > 60 ? 0 : 1;

    }))
    midiJson.tracks.map(track => quantiseTrack(track, divisions, 4));

    const notes = midiJson.tracks.flatMap(t => t.notes).sort((a, b) => a.ticks - b.ticks);

    const measureLengthTicks = ppq * beatsPerMeasure;
    const measures = [];
    for (const note of notes) {
        const index = Math.floor(note.ticks / measureLengthTicks);
        measures[index] ??= [];
        measures[index].push(note);
    }

    let groupedMeasures = [];
    for (const measure of measures) {
        const group = [];
        for (const note of measure) {
            group[note.track] ??= {};
            group[note.track][note.ticks] ??= [];
            group[note.track][note.ticks].push(note);
        }
        groupedMeasures.push(group);
    }

    console.log(groupedMeasures);

    const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <score-partwise version="3.1">
            <work>
                <work-title>${title}</work-title>
            </work>

            <part-list>
                <score-part id="P1">
                    <part-name>Piano</part-name>
                </score-part>
            </part-list>

            <part id="P1">
                ${groupedMeasures.map((gm, i) =>
        buildMeasure(gm, divisions, bpm, i, beatsPerMeasure)
    ).join("")}
            </part>
        </score-partwise>
    `;
    return xml;
}