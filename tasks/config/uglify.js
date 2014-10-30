/**
 * Uglify
 */
module.exports = function(grunt) {

    grunt.config.set('uglify', {
        options: {
            report: 'min',
            sourceMap: true,
            sourceMapName: 'dist/tri-angular-pagination.min.js.map',
            preserveComments: 'some'
        },
        my_target: {
            files: {
                'dist/tri-angular-pagination.min.js': ['src/tri-angular-pagination.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
