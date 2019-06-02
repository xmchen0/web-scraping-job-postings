/*------------*\
|* INDEX PAGE *|
\*------------*/

// When scrape button is clicked
$("#scrape").on("click", function () {
    // Make a GET request to require the scraped data
    $.ajax({
        method: "GET",
        url: "/scrape",
        // Once received data
    }).done(function (data) {
        // console.log(data)
        // Populate each field with the attribute of href on the index page
        $(location).attr("href", "/");
    });
});

// When nav option is clicked set to active
$(".navbar-nav li").click(function () {
    $(".navbar-nav li").removeClass("active");
    $(this).addClass("active");
});

// When save button is clicked for Article
$(".save").on("click", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    // Run a POST request to save the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
        // Once received data
    }).done(function (data) {
        // Populate each field with the attribute of href on the index page
        $(location).attr("href", "/");
    })
});

/*------------*\
|* SAVED PAGE *|
\*------------*/

// When delete button is clicked to remove Article
$(".delete").on("click", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    // Run a POST request to delete the note
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
        // Once received data
    }).done(function (data) {
        // Populate each field with the attribute of href on the index page
        $(location).attr("href", "/");
    })
});

// When save button is clicked
$(".saveNote").on("click", function (event) {
    // Cancel any unforseen event
    event.preventDefault();
    // Create an empty object and assign to variable
    var note = {};
    // Grab the id associated with the article from the submit button
    id = $(this).attr("data-id");
    // Only becomes clickable after we've put something in an input field
    note.body = $("#noteText").val().trim();
    // console.log("noteText");
    // If there's no text input in the article
    if (!$("#noteText").val()) {
        alert("please enter a note to save")
        // Otherwise
    } else {
        // console.log("note id: " + id)
        // Add the note information to the note body
        $.post("/notes/save/" + id, { body: note.body }).then(function (data) {
            // Log the response
            console.log(data);
            // Clear note box
            $("#noteText").val("");
            $(".modalNote").modal("hide");
            // Populate each field with the attribute of href on the saved page
            $(location).attr("href", "/saved");
        });
    }
});

// When delete note button is clicked
$(".deleteNote").on("click", function () {
    // Grab the id associated with the article from the submit button
    var noteId = $(this).attr("data-note-id");
    // Make an ajax call for the notes
    $.ajax({
        method: "GET",
        url: "/notes/delete/" + noteId
        // Once received data
    }).done(function (data) {
        $(".modalNote").modal("hide");
        // Populate each field with the attribute of href on the saved page
        $(location).attr("href", "/saved");
    });
});
