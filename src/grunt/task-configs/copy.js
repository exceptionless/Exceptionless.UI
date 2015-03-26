module.exports = {
    main: {
        files: [
            {src: ['web.config', '*.png', '*.ico', 'img/**/{*.png,*.jpg,*.ico}'], dest: 'dist/'}
        ]
    }
};