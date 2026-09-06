<script setup>
import { ref, onMounted, watch } from "vue";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

const props = defineProps({
    musicXml: String,
    elapsedSeconds: Number,
    timeToFall: Number,
    duration: Number
});

const osmdContainer = ref(null);
const scrollWrapper = ref(null);
const indicator = ref(null);
const stripWrapper = ref(null);

const svg = ref(null);
const viewBox = ref(null);

const startOffset = 90;
const endOffset = 140;

let osmd = null;

async function renderOsmd() {
    if (!props.musicXml) return;
    osmd = new OpenSheetMusicDisplay(osmdContainer.value, {
        backend: "svg",
        autoResize: false,
        drawTitle: false,
        drawComposer: false,
        drawPartNames: false,
    });

    osmd.setOptions({
        renderSingleHorizontalStaffline: true,
    });

    window.musicXml = props.musicXml;
    await osmd.load(props.musicXml);

    const rules = osmd.EngravingRules;

    rules.PageTopMargin = 0;
    rules.PageBottomMargin = 0;
    rules.FixedMeasureWidth = true;

    osmd.zoom = 1;

    osmd.render();

    svg.value = osmdContainer.value.querySelector("svg");
    viewBox.value = svg.value.viewBox.baseVal;

    updateScroll(props.elapsedSeconds);
}

function updateScroll() {
    const total = props.duration;
    const timeToFall = props.timeToFall;
    const elapsedSeconds = props.elapsedSeconds;

    if (total <= 0) return;

    const visualTime = elapsedSeconds - timeToFall;
    const wrapperWidth = stripWrapper.value.clientWidth;
    const fullWidth = viewBox.value.width;
    const visibleWidth = wrapperWidth;

    const centerX = visibleWidth / 2;

    const stage1Distance = centerX - startOffset;
    const stage2Distance = fullWidth - visibleWidth - startOffset;
    const stage3Distance = visibleWidth - centerX + endOffset;


    // separate stage fractions
    const percentageStage1 = stage1Distance / fullWidth;
    const percentageStage2 = stage2Distance / fullWidth;
    const percentageStage3 = stage3Distance / fullWidth;

    const sum = percentageStage1 + percentageStage2 + percentageStage3;

    const stage1Duration = total * percentageStage1;
    const stage2Duration = total * percentageStage2;
    const stage3Duration = total * percentageStage3;

    // --- Stage 0 ---
    if (visualTime <= 0) {
        return stage0(startOffset);
    }

    // --- Stage 1 ---
    if (visualTime <= stage1Duration) {
        return stage1(visualTime, stage1Duration, startOffset, centerX);
    }


    // --- Stage 2 ---
    if (visualTime <= stage1Duration + stage2Duration) {
        return stage2(visualTime, stage1Duration, stage2Duration, fullWidth, visibleWidth, centerX);
    }

    if (visualTime <= total) {
        return stage3(visualTime, stage1Duration, stage2Duration, stage3Duration, visibleWidth, centerX, fullWidth);
    }
}


function stage0(startOffset) {
    indicator.value.style.transform = `translateX(${startOffset}px)`;
    viewBox.value.x = 0;
}
function stage1(visualTime, stage1Duration, startOffset, centerX) {
    const p = visualTime / stage1Duration;
    const indicatorX = startOffset + (centerX - startOffset) * p;
    indicator.value.style.transform = `translateX(${indicatorX}px)`;
    viewBox.value.x = 0;
}


function stage2(visualTime, stage1Duration, stage2Duration, fullWidth, visibleWidth, centerX) {
    const scrollableContent = fullWidth - visibleWidth;

    const stage2Time = visualTime - stage1Duration;
    let p = stage2Time / stage2Duration;
    p = Math.min(Math.max(p, 0), 1);

    const viewBoxX = scrollableContent * p;

    indicator.value.style.transform = `translateX(${centerX}px)`;
    viewBox.value.x = viewBoxX;
}

function stage3(visualTime, stage1Duration, stage2Duration, stage3Duration, visibleWidth, centerX, fullWidth) {
    const stage3Time = visualTime - stage1Duration - stage2Duration;
    let p = stage3Time / stage3Duration;
    p = Math.min(Math.max(p, 0), 1);

    const indicatorX = centerX + (visibleWidth - centerX) * p;

    indicator.value.style.transform = `translateX(${indicatorX}px)`;
    viewBox.value.x = fullWidth - visibleWidth;
}




onMounted(() => {
    renderOsmd();
});

watch(() => props.musicXml, () => {
    renderOsmd();
});

watch(() => props.elapsedSeconds, (t) => {
    updateScroll(t);
});
</script>

<template>
    <div class="sheet-strip-wrapper" ref="stripWrapper">
        <div class="sheet-indicator" ref="indicator"></div>
        <div class="sheet-strip-scroll" ref="scrollWrapper">
            <div ref="osmdContainer" class="osmd-container"></div>
        </div>
    </div>
</template>

<style scoped>
.sheet-strip-wrapper {
    position: absolute;
    top: 10vh;
    height: 30vh;
    width: 100vw;
    overflow: hidden;
    pointer-events: none;
    z-index: 5;
}

.sheet-strip-scroll {
    background: white;
}

.sheet-strip-wrapper svg {
    height: auto;
    width: auto;
}

.sheet-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: red;
    z-index: 10;
    pointer-events: none;
    transform: translateX(0px);
}
</style>
