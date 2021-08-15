module.exports = {
    //devServer: {
    //    proxy: 'http://localhost:48459/'
    //},
    pwa: {
        workboxOptions: {
            skipWaiting: true
        }
    },
    transpileDependencies: [
        'vuetify'
    ]
}
