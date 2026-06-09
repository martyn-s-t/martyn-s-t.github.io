

<template >
    <v-row style="width:100vw; height:5vh" justify="center">
        <v-col class="d-flex justify-center">
             <v-btn-group variant="outlined" divided>
                 <v-btn @click="$emit('play')"><v-icon>mdi-play</v-icon></v-btn>
                 <v-btn @click="$emit('pause')"><v-icon>mdi-pause</v-icon></v-btn>
                 <v-btn @click="$emit('stop')"><v-icon>mdi-stop</v-icon></v-btn>
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