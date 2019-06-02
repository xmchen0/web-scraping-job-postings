// Delete a comment
$(document).on("click", ".delete-comment", function() {
    // Get the id of the comment
    const commentId = $(this).attr("comment-id");
    
    // Now make an ajax call for the comment
    $.ajax({
      method: "DELETE",
      url: "/comment/" + commentId
    })
      .then(function(data) {
        console.log(data);
        window.location.reload();
      });
  });

  // Delete a job
  $(document).on("click", ".delete-jobs", function() {
    // Get the id of the article
    const articleId = $(this).attr("jobs-id");
    
    // Now make an ajax call for the comment
    $.ajax({
      method: "DELETE",
      url: "/api/jobs/" + articleId
    })
      .then(function(data) {
        console.log(data);
        window.location.reload();
      });
  });
