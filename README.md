Pagination
==========

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Angular driven sync/async pagination model

* [Triangular](http://triangular.io)
* [Demo](http://jsfiddle.net/ulfryk/9m338rpm/)

***

Install
-------

```
bower install tri-angular-pagination
```

***

Usage
-----

*Async pagination*

```
var paginatedModel = triNgPagination(totalItemsCount, singlePageLength, hookFn);
```

where `hookFn` should be:

```
function hookFn(newPageNumber, singlePageLength, paginatedModel) {
    // get items for newPageNumber'th page
    return promise;
}
```

promise should be resolved with config:

```
var cfg = {
    totalCount: (Number),   // optional
    currentPage: (Number),  // optional
    currentList: (Array)    // must be
}
```

and `paginatedModel` is:

```
{
    fullList: null,         // only for sync
    currentList: [],        // current list to render
    pageLength:  null,      // length of single page
    totalCount: null,       // total items count
    pageCount: null,        // number of all pages
    navWrap: 2,             // how many navs should be visible before and after current page
    currentPage: 0,         // 0 based currently chosen page
    navList: [],            // navs
    
    nth: function (pageNumber) {}, // pageNumber is required
    next: function () { .. },
    prev: function () { .. },
    first: function () { .. },
    last: function () { .. },
    
    update: function (pageNumber) { .. },   // pageNumber defaults to 0
    hasNext: function () { .. },
    hasPrev: function () { .. },
    isFirst: function () { .. },
    isLast: function () { .. }
}
````

example:

```
var paginatedModel = triNgPagination(142, 20, function hookFn(newPageNumber, singlePageLength) {
    return SomeResource.query({
        limit: singlePageLength,
        offset: singlePageLength * newPageNumber
    }).then(function (list) {
        return {currentList: list};
    }, $q.reject);
});
```

