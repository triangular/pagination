/**
 * Copy
 */
module.exports = function(grunt) {

    grunt.config.set('copy', {
        main: {
            files: [
                {src: ['src/tri-angular-pagination.js'], dest: 'demo/lib/tri-angular-pagination/tri-angular-pagination.js'},
                {src: ['src/tri-angular-pagination.js'], dest: 'dist/tri-angular-pagination.js'}
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
