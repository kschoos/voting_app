var currentPage = localStorage.currentPage || "home";

$(document).ready(function(){
  $.ajax({
    url: "/"+currentPage,
    method: "POST",
    success(data){
      $(".panel-heading").text(data.header);
      $(".content").html(data.content);
    }
  })
})
