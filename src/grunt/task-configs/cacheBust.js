module.exports = {
    assets: {
        files: [{
            src: ['dist/index.html']
        }]
    },
    options: {
        deleteOriginals: true,
        ignorePatterns: ['touch-icon-ipad']
    }
};
