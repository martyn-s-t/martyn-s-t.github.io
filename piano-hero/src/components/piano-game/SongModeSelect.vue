<script setup>
const emit = defineEmits(["navigate"]);

const selectedSong = defineModel("selectedSong");
const selectedMode = defineModel("selectedMode");
const selectedHand = defineModel("selectedHand");

function startListen() {
    selectedMode.value = "listen";
    selectedHand.value = "both";
    emit("navigate", "game");
}

function startLearn(hand) {
    selectedMode.value = "learn";
    selectedHand.value = hand;
    emit("navigate", "game");
}

function startPlay(hand) {
    selectedMode.value = "play";
    selectedHand.value = hand;
    emit("navigate", "game");
}

</script>

<template>
    <v-container class="pa-4">
        <v-row>
            <v-col cols="1" class="d-flex justify-center">
                <v-btn block color="error" @click="$emit('navigate', 'song-manager')">
                    <v-icon size="x-large">mdi-chevron-left</v-icon>
                </v-btn>
            </v-col>
            <v-col>
                <h2 class="mb-6">{{ selectedSong.name }}</h2>
            </v-col>
        </v-row>

        <!-- LISTEN -->
        <v-card class="mb-6 pa-4">
            <h3 class="mb-4">Listen</h3>

            <v-btn block color="primary" @click="startListen">
                Listen to Song
            </v-btn>
        </v-card>

        <!-- LEARN -->
        <v-card class="mb-6 pa-4">
            <h3 class="mb-4">Learn</h3>

            <v-row>
                <v-col cols="6">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startLearn('left')">
                            Learn Left Hand
                        </v-btn>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startLearn('right')">
                            Learn Right Hand
                        </v-btn>
                    </v-card>
                </v-col>

                <v-col cols="12" class="mt-4">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startLearn('both')">
                            Learn Both Hands
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>

        <!-- PLAY -->
        <v-card class="mb-6 pa-4">
            <h3 class="mb-4">Play</h3>
            <v-row>
                <v-col cols="6">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startPlay('left')">
                            Play Left Hand
                        </v-btn>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startPlay('right')">
                            Play Right Hand
                        </v-btn>
                    </v-card>
                </v-col>

                <v-col cols="12" class="mt-4">
                    <v-card class="pa-4 text-center">
                        <v-btn block color="primary" @click="startPlay('both')">
                            Play Both Hands
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </v-container>

</template>

<style scoped></style>