// Handle Scrape button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        $(location).attr("href","/");
    })
});

// Set clicked nav option to active
$(".navbar-nav li").click(function() {o
   $(".navbar-nav li").removeClass("active");
   $(this).addClass("active");
});

// Save Article button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        $(location).attr("href","/");
    })
});

// Delete Article button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).done(function(data) {
        $(location).attr("href","/");
    })
});

// Save Note button
$(".saveNote").on("click", function(event) {
    event.preventDefault();
    var note = {};
    id = $(this).attr("data-id");
    note.body =$("#noteText").val().trim();
    console.log("noteText");
    // note.body =$("data-noteid").val().trim();
    console.log("note:"+ note.body);
    if (!$("#noteText").val()) {
        alert("please enter a note to save")
    }else {
        console.log("note id: "+id)
      $.post("/notes/save/" + id,  { body: note.body}).then(function(data) {
              // Log the response
              console.log(data);
            //   clear note box
              $("#noteText").val("");
              $(".modalNote").modal("hide");
              $(location).attr("href","/saved");
          });
        }    
});

// Handle Delete Note button
$(".deleteNote").on("click", function() {
//   var articleId = $(this).attr("data-id");
var noteId = $(this).attr("data-note-id");
 // console.log(articleId);
 
    $.ajax({
        method: "GET",
        url: "/notes/delete/" + noteId
    }).done(function(data) {
       
        $(".modalNote").modal("hide");
        $(location).attr("href","/saved");
    })
});