import XMLBuilder from "fast-xml-builder";

export default function midiToMusicXml(midiJson, bpm = 120, beatsPerMeasure = 4) {
    const ppq = midiJson.header.ppq;
    const divisions = ppq;

    const title = midiJson.header.name || "";

    const track = midiJson.tracks[0];
    const notes = track.notes;

    const qNotes = notes.map(n => ({
        midi: n.midi,
        name: n.name,
        ticks: Math.round(n.ticks),
        durationTicks: Math.round(n.durationTicks)
    }));

    const measureLengthTicks = ppq * beatsPerMeasure;
    const measures = [];

    for (const n of qNotes) {
        const index = Math.floor(n.ticks / measureLengthTicks);
        measures[index] ??= [];
        measures[index].push(n);
    }

    const xmlObj = {
        "score-partwise": {
            "@version": "3.1",

            work: {
                "work-title": title
            },

            "part-list": {
                "score-part": {
                    "@id": "P1",
                    "part-name": "Piano"
                }
            },
            part: {
                "@id": "P1",
                measure: measures.map((measureNotes, i) => ({
                    "@number": i + 1,
                    attributes: {
                        divisions,
                        key: { fifths: 0 },
                        time: { beats: beatsPerMeasure, "beat-type": 4 },
                        clef: { sign: "G", line: 2 }
                    },
                    direction: {
                        "@placement": "above",
                        "direction-type": {
                            metronome: {
                                "beat-unit": "quarter",
                                "per-minute": bpm
                            }
                        }
                    },
                    note: measureNotes.map(n => {
                        const step = n.name[0];
                        const alter = n.name.includes("#") ? 1 : 0;
                        const octave = Number(n.name.slice(-1));

                        return {
                            pitch: { step, alter, octave },
                            duration: n.durationTicks,
                            voice: 1,
                            type: "quarter"
                        };
                    })
                }))
            }
        }
    };

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@",
        format: true
    });

    const xmlBody = builder.build(xmlObj);

    // ⭐ REQUIRED FOR OSMD
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
}
