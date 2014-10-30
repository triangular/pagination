/**
 * JSHint
 */
module.exports = function(grunt) {

    grunt.config.set('jshint', {
        options: {
            "camelcase": true,
            "curly": true,
            "expr": true,
            "eqeqeq": true,
            "freeze": true,
            "globalstrict": true,
            "globals": {
                "angular": false
            },
            "immed": true,
            "indent": 4,
            "latedef": true,
            "maxdepth": 2,
            "maxstatements": 12,
            "maxcomplexity": 5,
            "noarg": true,
            "noempty": true,
            "nonew": true,
            "quotmark": true,
            "strict": true,
            "trailing": true,
            "undef": true,
            "unused": true,
            "white": true
        },
        default: [
            'src/**/*.js'
        ]
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
};
