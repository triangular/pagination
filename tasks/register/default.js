module.exports = function (grunt) {
    grunt.registerTask('default', [
        'jshint',
        'uglify',
        'copy'
    ]);
};
