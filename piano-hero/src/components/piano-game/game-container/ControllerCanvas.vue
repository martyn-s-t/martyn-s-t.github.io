<script setup>
const emit = defineEmits(["navigate", "play", "pause", "stop"]);
</script>

<template>
    <v-row style="width:100%; height:5vh" justify="center" class="align-center">

        <v-col cols="1" class="d-flex justify-center h-100">
            <v-btn block color="error" @click="$emit('navigate')">
                <v-icon size="x-large">mdi-chevron-left</v-icon>
            </v-btn>
        </v-col>

        <v-col cols="3" class="d-flex justify-center h-100">
            <v-btn-group variant="outlined" divided>
                <v-btn @click="$emit('play')">
                    <v-icon size="x-large">mdi-play</v-icon>
                </v-btn>

                <v-btn @click="$emit('pause')">
                    <v-icon size="x-large">mdi-pause</v-icon>
                </v-btn>

                <v-btn @click="$emit('stop')">
                    <v-icon size="x-large">mdi-stop</v-icon>
                </v-btn>
            </v-btn-group>
        </v-col>

        <!-- Spacer -->
        <v-col cols="8"></v-col>

    </v-row>
</template>

<style scoped>
.v-btn-group {
    height: 100%;
}

.v-btn {
    height: 100%;
}
</style>
