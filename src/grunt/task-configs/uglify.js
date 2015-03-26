module.exports = {
    options: {
        sourceMap: true,
        sourceMapIncludeSources: false,
        mangle: {
            except: ['$super']
        }
    },
    main: {
        src: 'dist/app.js',
        dest: 'dist/app.min.js'
    }
};