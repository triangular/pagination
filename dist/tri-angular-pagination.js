(function (ng, triNgPagination, _baseConfig) {
    'use strict';

    // shortcuts
    var _ext = ng.extend;
    var _isArr = ng.isArray;
    var _isFunc = ng.isFunction;
    var _isNum = ng.isNumber;
    var _isObj = ng.isObject;
    var _bind = ng.bind;

    // shortcuts to avoid cyclomatic complexity
    var _getObjOrElse = function (value, otherwise) {
        return _isObj(value) ? value : otherwise;
    };
    var _getNumOrElse = function (value, otherwise) {
        return _isNum(value) ? value : otherwise;
    };
    var _getArrOrElse = function (value, otherwise) {
        return _isArr(value) ? value : otherwise;
    };

    //////////////////////////////
    // Nav elements view-model ///
    //////////////////////////////
    var TriNgPaginationNavListFactory = function () {
        /* jshint -W071 */
        /* jshint -W074 */
        return function (pagination) { // TODO: split into several steps/methods

            pagination.navList.splice(0);

            var wrap = pagination.navWrap;
            var range = 2 * wrap + 1;
            var splitModeBorder = range + 6;
            var minForSplit = wrap + 1;
            var maxForSplit = pagination.pageCount - minForSplit;
            var index = 0;
            var maxIndex = pagination.pageCount;
            var maxRangeStart = pagination.pageCount - 1 - range;

            if (splitModeBorder > maxIndex) {
                do {
                    pagination.navList.push({
                        index: index,
                        selected: index === pagination.currentPage
                    });
                } while (++index < maxIndex);
            } else {
                pagination.navList.push({
                    index: 0,
                    selected: pagination.currentPage === 0
                });

                if (pagination.currentPage > minForSplit) {

                    index = pagination.currentPage - wrap;

                    /* jshint -W073 */
                    if (index > maxRangeStart) {
                        index = maxRangeStart;
                    }

                    pagination.navList.push({
                        splitter: true,
                        index: index - 1
                    });

                } else {
                    index = 1;
                }

                if (pagination.currentPage < maxForSplit) {
                    maxIndex = pagination.currentPage + wrap;
                    /* jshint -W073 */
                    if (maxIndex < range) {
                        maxIndex = range;
                    }
                } else {
                    maxIndex -= 2;
                }

                do {
                    pagination.navList.push({
                        index: index,
                        selected: index === pagination.currentPage
                    });
                } while (index++ < maxIndex);

                if (pagination.currentPage < maxForSplit) {
                    pagination.navList.push({
                        splitter: true,
                        index: maxIndex + 1
                    });
                }

                pagination.navList.push({
                    index: pagination.pageCount - 1,
                    selected: pagination.currentPage === pagination.pageCount - 1
                });
            }

            return pagination.navList;
        };
    };


    //////////////////////////////
    // Paginated model wrapper ///
    //////////////////////////////
    var TriNgPaginationFactory = function ($q, $log, evoPaginationNavList) {
        // just cunstructor
        var TriNgPagination = function TriNgPagination(totalCount, pageLength, hookFn, extended) {
            return this._reset()._init(totalCount, pageLength)._setHook(hookFn, (extended || true)).update();
        };

        // all paginated share some functions, so:
        _ext(TriNgPagination.prototype, {

            ///////////////////////////
            // Private methods      ///
            ///////////////////////////

            _getPageCount: function (totalCount, pageLength) {
                var lastPageLength = totalCount % pageLength;
                return (totalCount - lastPageLength) / pageLength + (lastPageLength > 0 ? 1 : 0);
            },

            _reset: function () {
                return _ext(this, _baseConfig, {
                    reloading: false,
                    reloadingPromise: null
                });
            },

            _init: function (totalCount, pageLength) {
                // Where argument named 'totalCount' may be also an array holding 'fullList'
                // of items to be paginated. In that case 'pagination' entity will work in
                // 'syncUpdate' mode.
                var fullList = null;

                if (_isArr(totalCount)) {
                    fullList = totalCount;
                    totalCount = fullList.length;
                    this._updateMode = '_updateSync';
                    this.currentList = fullList.slice(0, pageLength);
                }

                if (!_isNum(totalCount)) {
                    $log.error(new TypeError('totalCount should be a Number but got ' + (typeof totalCount)));
                }

                if (!_isNum(pageLength)) {
                    $log.error(new TypeError('pageLength should be a Number but got ' + (typeof pageLength)));
                }

                return _ext(this, {
                    fullList: fullList,
                    totalCount: totalCount,
                    pageLength: pageLength,
                    pageCount: this._getPageCount(totalCount, pageLength)
                });
            },

            _setHook: function (hookFn, extended) {
                if (_isFunc(hookFn)) {
                    return _ext(this, {
                        _hook: hookFn
                    });
                }
                if (_isFunc(extended[hookFn])) {
                    return _ext(this, extended, {
                        _hook: extended[hookFn]
                    });
                }
                if (extended !== true) {
                    $log.error(new TypeError('Got ' + (typeof hookFn) + ' but expected Function.'));
                }
                return this;
            },

            _updateAsync: function (pageNumber) {
                // using $q when to be sure that returned object is thenable
                var promise = $q.when(this._hook(pageNumber, this.pageLength, this));

                this.reloading = true;

                promise['finally'](_bind(this, function () {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.reloading = false;
                }));

                return _ext(this, {
                    reloadingPromise: promise.then(_bind(this, this._updatePreCounted, pageNumber), $q.reject)
                });
            },

            _updateSync: function (pageNumber) {
                return this._updatePreCounted(pageNumber, {
                    currentList: this.fullList.slice(pageNumber * this.pageLength, (pageNumber + 1) * this.pageLength)
                });
            },

            _updatePreCounted: function (pageNumber, cfg) {
                var pageLength;
                cfg = _getObjOrElse(cfg, {});
                pageLength = _getNumOrElse(cfg.pageLength, this.pageLength);
                if (_isNum(cfg.totalCount) && cfg.totalCount !== this.totalCount) {
                    _ext(this, {
                        totalCount: cfg.totalCount,
                        pageCount: this._getPageCount(cfg.totalCount, pageLength)
                    });
                }
                return _ext(this, {
                    currentPage: _getNumOrElse(cfg.currentPage, pageNumber),
                    currentList: _getArrOrElse(cfg.currentList, this.currentList),
                    pageLength: pageLength
                })._updateNavList();
            },

            _updateNavList: function () {
                return _ext(this, {
                    navList: evoPaginationNavList(this)
                });
            },

            ///////////////////////////
            // Public API           ///
            ///////////////////////////

            update: function (pageNumber) {
                pageNumber = _getNumOrElse(pageNumber, this.currentPage);
                return this[this._updateMode](pageNumber);
            },

            hasNext: function () {
                return this.currentPage < this.pageCount - 1;
            },

            hasPrev: function () {
                return this.currentPage > 0;
            },

            isFirst: function () {
                return !this.hasPrev();
            },

            isLast: function () {
                return !this.hasNext();
            },

            nth: function (num) {
                var pageNumber = parseInt(num, 10);
                if (isNaN(pageNumber)) {
                    $log.error(new TypeError('nth(num) -> num should be a Number, but got ' + num + '  [ ' + (typeof num) + '].'));
                    return this;
                }
                return pageNumber < 0 ? this.first() :
                    pageNumber > this.pageCount - 1 ? this.last() :
                        this.update(pageNumber);
            },

            next: function () {
                if (this.hasNext()) {
                    return this.update(this.currentPage + 1);
                }
                return this;
            },

            prev: function () {
                if (this.hasPrev()) {
                    return this.update(this.currentPage - 1);
                }
                return this;
            },

            first: function () {
                if (this.isFirst()) {
                    return this;
                }
                return this.update(0);
            },

            last: function () {
                if (this.isLast()) {
                    return this;
                }
                return this.update(this.pageCount - 1);
            }
        });

        ///////////////////////////
        // Pagination factory   ///
        ///////////////////////////

        return function (extendOrTotalCount, hookOrPageLength, hookFn) {
            if (_isObj(extendOrTotalCount) && _isFunc(extendOrTotalCount[hookOrPageLength])) {
                return function (totalCount, pageLength) {
                    return new TriNgPagination(totalCount, pageLength, hookOrPageLength, extendOrTotalCount);
                };
            }
            return new TriNgPagination(extendOrTotalCount, hookOrPageLength, hookFn);
        };
    };

    ///////////////////////////
    // Make it angular      ///
    ///////////////////////////

    triNgPagination
        .factory('triNgPaginationNavList', ['$log', TriNgPaginationNavListFactory])
        .provider('triNgPagination', function () {
            return {
                setConfig: function (cfg) {
                    return _ext(_baseConfig, cfg);
                },
                $get: ['$q', '$log', 'triNgPaginationNavList', TriNgPaginationFactory]
            };
        });

}(angular, angular.module('triNgPagination', ['ng']), { // initial set of fields
    fullList: null,
    currentList: [],
    pageLength:  null,
    totalCount: null,
    pageCount: null,
    navWrap: 2,
    currentPage: 0, // 0 based
    navList: [],
    _hook: null,
    _updateMode: '_updateAsync'
}));