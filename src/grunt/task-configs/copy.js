module.exports = {
    main: {
        files: [
            {src: ['app_data/**', 'app.config.js', 'web.config', '*.png', '*.ico', 'img/**/{*.png,*.jpg,*.ico}'], dest: 'dist/'}
        ]
    }
};
