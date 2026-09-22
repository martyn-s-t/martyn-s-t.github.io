

function pitchFromNote(note) {
    const step = note.name[0];
    const alter = note.name.includes("#") ? 1 : 0;
    const octave = Number(note.name.slice(-1));
    return { step, alter, octave }
}
function getNoteType(duration, divisions) {
    const quarter = divisions;

    const lookup = [
        { duration: quarter * 4, type: "whole", dots: 0 },
        { duration: quarter * 3, type: "half", dots: 1 },
        { duration: quarter * 2, type: "half", dots: 0 },

        { duration: quarter * 1.5, type: "quarter", dots: 1 },
        { duration: quarter, type: "quarter", dots: 0 },

        { duration: quarter * 0.75, type: "eighth", dots: 1 },
        { duration: quarter / 2, type: "eighth", dots: 0 },

        { duration: quarter * 0.375, type: "16th", dots: 1 },
        { duration: quarter / 4, type: "16th", dots: 0 },

        { duration: quarter / 8, type: "32nd", dots: 0 }
    ];

    return lookup.find(x => x.duration === duration);
}


function createNote(note, staffNumber, divisions, isChord = false) {
    const { step, alter, octave } = pitchFromNote(note);
    const notation = getNoteType(note.durationTicks, divisions);

    const typeXml = notation ? `<type>${notation.type}</type>` : "";
    const dotsXml = notation ? "<dot/>".repeat(notation.dots) : "";
    const tieXml = `${note.endsTie ? '<tie type="start"/>' : ''} ${note.startsTie ? '<tie type="stop"/>' : ''}`;

    const notationXml = note.startsTie || note.endsTie ? ` <notations> ${note.endsTie ? '<tied type="start"/>' : ''} ${note.startsTie ? '<tied type="stop"/>' : ''} </notations>` : '';

    return `
    <note>
        ${isChord ? '<chord/>' : ''}
        <pitch>
            <step>${step}</step>
            ${alter ? `<alter>${alter}</alter>` : ''}
            <octave>${octave}</octave>
        </pitch>
        ${tieXml}
        <duration>${note.durationTicks}</duration>
        ${typeXml}
        ${dotsXml}
        <voice>${staffNumber}</voice>
        <staff>${staffNumber}</staff>
        ${notationXml}
    </note>`;
}


function createRest(durationTicks, staffNumber, divisions) {
    return `
    <note>
        <rest/>
        <duration>${durationTicks}</duration>
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
function createAttributes(divisions, beatsPerMeasure, beatUnit) {
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
        <time>
            <beats>${beatsPerMeasure}</beats>
            <beat-type>${beatUnit}</beat-type>
        </time>
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
function processTrack(track, ticks, staffNumber, ticksPerMeasure, measureIndex, division) {
    if (!ticks.length) return "";

    let xml = "";
    let lastTick = measureIndex * ticksPerMeasure;
    let finalTick = (measureIndex + 1) * ticksPerMeasure;

    for (const tick of ticks) {
        if (tick !== lastTick) {
            const remainingTicks = tick - lastTick;
            if (remainingTicks)
                xml += createRest(remainingTicks, staffNumber, division);
            // xml += createForward(tick - lastTick);
        }

        const notes = track[tick];
        notes.forEach((note, index) => {
            xml += createNote(note, staffNumber, division, index > 0);
        });
        let maxDuration = notes.reduce((cumulative, current) => Math.max(cumulative, current.durationTicks), 0);

        lastTick = tick + maxDuration;
    }

    if (finalTick - lastTick > 0)
        xml += createForward(finalTick - lastTick, staffNumber);
    return xml;
}

function buildMeasure(groupedMeasure, divisions, bpm, measureIndex, beatsPerMeasure, beatUnit) {
    const trebleTrack = groupedMeasure[0] ?? {};
    const bassTrack = groupedMeasure[1] ?? {};

    const trebleTicks = Object.keys(trebleTrack).map(Number).sort((a, b) => a - b);
    const bassTicks = Object.keys(bassTrack).map(Number).sort((a, b) => a - b);

    const measureDuration = divisions * beatsPerMeasure * (4 / beatUnit);

    let xml = "";

    if (measureIndex === 0) {
        xml += createAttributes(divisions, beatsPerMeasure, beatUnit);
        xml += createMetronome(bpm);
    }


    xml += processTrack(trebleTrack, trebleTicks, 1, measureDuration, measureIndex, divisions);

    if (measureDuration > 0)
        xml += createBackup(measureDuration);

    xml += processTrack(bassTrack, bassTicks, 2, measureDuration, measureIndex);

    return `<measure number="${measureIndex + 1}">${xml}</measure>`;
}
function splitNoteAcrossMeasures(note, measureLengthTicks) {
    const result = [];

    let currentStart = note.ticks;
    const noteEnd = note.ticks + note.durationTicks;

    let first = true;

    while (currentStart < noteEnd) {
        const measureEnd =
            (Math.floor(currentStart / measureLengthTicks) + 1) *
            measureLengthTicks;

        const partEnd = Math.min(measureEnd, noteEnd);

        result.push({
            ...note,
            ticks: currentStart,
            durationTicks: partEnd - currentStart,

            startsTie: !first,
            endsTie: false
        });

        currentStart = partEnd;
        first = false;
    }

    if (result.length > 1) {
        result.forEach((fragment, index) => {
            fragment.startsTie = index > 0;
            fragment.endsTie = index < result.length - 1;
        });
    }

    return result;
}


export default function midiToMusicXml(midiJson, bpm = 120) {
    const timeSignature = midiJson.header.timeSignatures?.[0]?.timeSignature ?? [4, 4];
    const [beatsPerMeasure, beatUnit] = timeSignature;

    const ppq = midiJson.header.ppq;
    const divisions = ppq;
    bpm = bpm || midiJson.header.tempos[0].bpm;

    const title = midiJson.header.name || "";
    const numberOfTracks = midiJson.tracks.length;

    midiJson.tracks.forEach((track, index) => track.notes.forEach(note => {
        note.track = numberOfTracks === 2 ? index : note.midi > 60 ? 0 : 1;

    }))

    const measureLengthTicks = ppq * beatsPerMeasure * (4 / beatUnit);
    const notes = midiJson.tracks.flatMap(t => t.notes.flatMap(note => splitNoteAcrossMeasures(note, measureLengthTicks))).sort((a, b) => a.ticks - b.ticks);

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
                ${groupedMeasures.map((groupedMeasure, i) => buildMeasure(groupedMeasure, divisions, bpm, i, beatsPerMeasure, beatUnit)).join("")}
            </part>
        </score-partwise>
    `;
    return xml;
}