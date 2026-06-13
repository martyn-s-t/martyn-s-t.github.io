

<template >
    <v-row style="width:100vw; height:5vh" justify="center">
        <v-col class="d-flex justify-center">
            <v-btn @click="$emit('init-midi')"><v-icon size="x-large">mdi-piano</v-icon></v-btn>
            <v-btn-group variant="outlined" divided>
                 <v-btn @click="$emit('play')"><v-icon size="x-large">mdi-play</v-icon></v-btn>
                 <v-btn @click="$emit('pause')"><v-icon size="x-large">mdi-pause</v-icon></v-btn>
                 <v-btn @click="$emit('stop')"><v-icon size="x-large">mdi-stop</v-icon></v-btn>
            </v-btn-group>
        </v-col>
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