module.exports = {
    devServer: {
       proxy: 'https://localhost:44351/'
    },
    pwa: {
        workboxOptions: {
            skipWaiting: true
        }
    },
    transpileDependencies: [
        'vuetify'
    ]
}
