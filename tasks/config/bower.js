/**
 * Install bower dependencies
 */
module.exports = function(grunt) {

    grunt.config.set('bower', {
        install: {
            options: {
                targetDir: 'demo/vendor',
                verbose: true,
                cleanTargetDir: true,
                cleanBowerDir: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
};
