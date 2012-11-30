/* Handles saving and loading bookmarked locations */
// Expects these globals to be pre-defined - serverUrl, bookmarkServerUrl, userId
var Bookmarks = {
    $lat: $('#latitude'),
    $lng: $('#longitude'),
    $location: $('#location'),
    /*$coordinateSource: $('#coordinateSource'),
    $datum: $('#datum'),
    $physicalMap: $('#physicalMapScale'),
    $otherSource: $('#otherSource'),*/
    $locationBookmarks: $('#locationBookmarks'),
    $dialogBookmarksList: $('#bookmarksList'),
    $dlg: $('#manageBookmarksDialog'),
    listenersDisabled: false,
    init: function () {
        var that = this,
            dlg;

        // initialise list of bookmarks from web service
        this.load();

        // listen for external changes to location so we can clear the current bookmark
        mainMap.addListener({handler: function () {
            if (!that.listenersDisabled) {that.selectNoBookmark(); } }});
        screenLocation.addListener({handler: function () {
            if (!that.listenersDisabled) {that.selectNoBookmark(); } }});

        // handle selection of a bookmark
        $('#locationBookmarks').change(function() {
            that.applyBookmark(this);
        });

        // wire 'save' button
        $('#saveBookmarkButton').click(function () {
            that.saveBookmarkHandler();
        });

        // wire 'manage' button
        $('#manageBookmarksButton').click(function () {
            that.manageBookmarksHandler();
        });

        // configure manage dialog
        dlg = $('#manageBookmarksDialog').dialog({
            autoOpen: false,
            modal: true,
            width: 600,
            draggable: true,
            show: {effect: 'slide'},
            beforeClose: function(event, ui) {
                dlg.effect('transfer', {
                    to: '#manageBookmarksButton',
                    className: 'ui-effects-transfer'
                }, 300, null);
                return true; // to close it
            },
            buttons: {
                Done: function () {
                    $(this).dialog('close');
                }
            },
            open: function() {
                $(this).parent().find('.ui-dialog-buttonpane button:eq(0)').focus();
            }
        });

        // wire 'delete all' button in dialog
        $('#deleteAllBookmarksButton').click(function () {
            that.requestDeleteAll();
        });
    },
    load: function () {
       // alert( bookmarkServerUrl + "user/" + userId);
        var that = this;
        $.ajax({
            url: bookmarkServerUrl + "user/" + userId,
            dataType: 'jsonp',
            success: function (data) {
                that.injectBookmarksIntoLists(data.locations);
            }
        });
    },
    // builds lists of bookmarks - currently:
    //  1. bookmark select widget
    //  2. manage bookmarks dialog list
    injectBookmarksIntoLists: function (list) {
        var option, that = this;
        // clear all options apart from the 'no choice' option
        this.$locationBookmarks.find('option[value!="null"]').remove();
        // add each in list
        $.each(list, function (i, obj) {
            // select
            option = $("<option value='" + obj.id + "'>" + obj.locality + "</option>");
            option.data('location', obj);
            that.$locationBookmarks.append(option);
        });
        // build dialog list
        this.createDialogBookmarksList(list);
    },

    // puts a selected bookmark to the screen as the current location
    // @param element - the bookmark html select element (= this.$locationBookmarks[0])
    applyBookmark: function (element) {
        var opt = element.options[element.selectedIndex],
        data = $(opt).data('location'),
        loc = new Location();
        loc.loadFromBookmark(data);
        // disable listeners so we don't pick up our own change
        this.listenersDisabled = true;
        loc.putToScreen({autoLookup:false});
        this.listenersDisabled = false;
    },

    // checks that the current location is valid before saving
    saveBookmarkHandler: function () {
        // check for valid data and save if ok
        if (this.$lat.val() === "" || this.$lng.val() === "") {
            alert("You must enter a latitude and longitude first.");
        } else if (this.$location.val() === "") {
            alert("A bookmark needs a name. Please enter something in the location field.");
        } else {
            this.saveBookmark();
        }
    },

    // saves the current location as a new bookmark
    saveBookmark: function () {
        // collect bookmark data
        var bkm = new Location().loadFromScreen(),
            bookmark = bkm.makeBookmark(),
            that = this;
        $.ajax({
            url: serverUrl + "/proxy/submitLocationBookmark",
            dataType: 'json',
            type: 'POST',
            data: bookmark,
            success: function (data) {
                if (data.error) {
                    Dialogs.message("Bookmark could not be saved - " + data.error, 'Error');
                } else {
                    // reload bookmarks
                    that.load();
                    //set the drop down to the currently selected bookmark


                }
            }
        });
    },

    // resets the bookmark select widget so no bookmark is shown as currently selected
    selectNoBookmark: function () {
        this.$locationBookmarks.val("null");
    },

    // pops up a dialog to confirm deletion of a bookmark
    requestDelete: function (data) {
        Dialogs.confirm('Are you sure you want to delete the bookmark "' + data.locality + '"?',
                'Confirm delete', {label: 'Delete', handler: this.delete, context: this, params: [data.id]});
    },

    // deletes a bookmark
    delete: function (id) {
        var that = this;
        $.ajax({
            url: serverUrl + "/proxy/deleteLocationBookmark?id=" + id,
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if (data.code !== '200') {
                    Dialogs.message("Failed to delete bookmark - response code = " + data.code, 'Error');
                } else {
                    // reload bookmarks
                    that.load();
                }
            }
        });
    },
    requestDeleteAll: function () {
        Dialogs.confirm('Are you sure you want to delete all your location bookmarks?',
                'Confirm delete', {label: 'Delete all', handler: this.deleteAll, context: this});
    },
    deleteAll: function () {
        var that = this;
        $.ajax({
            url: serverUrl + "/proxy/deleteAllLocationBookmarks",
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                if (data.code !== '200') {
                    alert("Failed to delete bookmarks - response code = " + data.code);
                } else {
                    // reload bookmarks
                    that.load();
                }
            }
        });
    },
    createDialogBookmarksList: function (list) {
        // inject current bookmarks
        var that = this,
            // use the select options to tell us whether the bookmarks have been loaded
            bookmarkOptions = this.$locationBookmarks.get(0).options,
            // create a delete element that removes the bookmark
            $deleteLink = $('<img src="' + deleteImageUrl + '" alt="delete"/>')
                .click(function() {
                    that.requestDelete($(this).parent().data('location'));
                }),
            $item;

        // clear out any existing items
        this.$dialogBookmarksList.empty();

        // check whether bookmarks have loaded
        if (bookmarkOptions.length === 2 && $(bookmarkOptions[1]).val() === 'loading') {
            // bookmarks have not been successfully loaded
            $dialogBookmarksList.append($('<li>Bookmarks could not be loaded.</li>'));
        // check whether there are any bookmarks
        } else if (list.length === 0) {
            // no bookmarks
            this.$dialogBookmarksList.append($('<li>You have not yet saved any location bookmarks.</li>' +
                    '<li class="mild">Use the "Bookmark current location" button on the main form to save a location that you have entered.</li>'));
        } else {
            $.each(list, function (i, loc) {
                var latLng, desc;
                latLng = "(" + loc.decimalLatitude + "," + loc.decimalLongitude + ")";
                desc = loc.locality + " " + latLng;
                $item = $("<li title='" + latLng + "' id='" + loc.id + "'></li>")
                        .append($deleteLink.clone(true))
                        .append(desc)
                        .appendTo(that.$dialogBookmarksList)
                        .data({location: loc});
            });
        }
    },
    manageBookmarksHandler: function () {
        this.$dlg.dialog('open');
    }
},

Dialogs = {
    // param text - to display in the dialog
    // param title - of the dialog
    // param ok - object specifying the ok action
    //              context: the 'this' context for the call
    //              handler: the function to call
    //              params: array of params to pass
    // param cancel - object specifying the cancel action (same structure as ok)
    confirm: function (text, title, ok, cancel) {
        var oLabel = (ok && ok.label) ? ok.label : 'Ok',
            cLabel = (cancel && cancel.label) ? cancel.label : 'Cancel',
            buttonOptions = {};
        buttonOptions[cLabel] = function() {
            $( this ).dialog( "close" );
            if (cancel && (cancel.handler !== undefined)) { cancel.handler.apply(cancel.context, cancel.params); }
        };
        buttonOptions[oLabel] = function() {
            $( this ).dialog( "close" );
            if (ok && (ok.handler !== undefined)) { ok.handler.apply(ok.context, ok.params); }
        };
        $('#confirmationDialog p').html(text);
        $('#confirmationDialog').dialog({
            title: title,
            open: function() {
                $(this).parent().find('.ui-dialog-buttonpane button:eq(1)').focus();
            },
            buttons: buttonOptions
        });
    },
    message: function (text, title) {
        $('#messageDialog p').html(text);
        $('#messageDialog').dialog({
            title: title,
            buttons: {Ok: function () {
                $( this ).dialog( "close" );
            }}
        });
    }
};

$(function() {
    Bookmarks.init();
});

