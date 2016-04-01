var lastVisitedPage = localStorage.lastVisitedPage || "allpolls";

$(function () {
  google.charts.load('current', {'packages':['corechart']});

  $('[data-toggle="popover"]').popover()
  if(!authed) lastVisitedPage = localStorage.lastVisitedPage = "allpolls";
  showLastVisitedPage();
})

function showLastVisitedPage(){
  switch(lastVisitedPage){
    case "allpolls":
      showAllPolls();
      break;
    case "mypolls":
      showMyPolls();
      break;
    case "createpoll":
      createNewPoll();
      break;
  }
}

function drawChart(name, choices){
  var data = new google.visualization.DataTable();
  data.addColumn("string", "name");
  data.addColumn("number", "count");
  choices = choices.map(function(obj){
    var arr = [];
    arr.push(obj.name);
    arr.push(obj.count);
    return arr;
  })
  data.addRows(choices);
  var options = {'title': name, 'width': 500, 'height': 400};

// Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}


function setNavbarActiveState($current){
  $(".navbar-right li").each(function(li){
    $(this).removeClass("active");
  })
  $current.addClass("active");
}

function showMyPolls(){
  $.ajax({
    url: "/mypolls",
    type: "post",
    success(data){
      setNavbarActiveState($(".mypolls-btn"));
      $(".panel-heading").text("My Polls");
      $(".content-header h1").text("My Polls"); // Set the header text
      $(".content-header h4").text("These are my polls. There are many like them, but these ones are mine.");
      
      $(".content").text(""); // Clear the content

      $("<div>").appendTo($(".content")).addClass("list-group"); // Create the poll list
      data.polls.map(function(poll){
        $("<a>").appendTo($(".content div")).attr("href", "javascript:showPoll('"+ poll._id +"')").addClass("list-group-item").text(poll.name);
      });
      localStorage.lastVisitedPage = "mypolls";
    }
  })
}

function showAllPolls(){
  $.ajax({
    url: "/allpolls",
    type: "post",
    success(data){
      setNavbarActiveState($(".home-btn"));
      $(".panel-heading").text("Home");
      $(".content-header h1").text("All Polls"); // Set the header text
      $(".content-header h4").text("Polls are polls are polls are polls.");
      
      $(".content").text(""); // Clear the content

      $("<div>").appendTo($(".content")).addClass("list-group"); // Create the poll list
      data.polls.map(function(poll){
        $("<a>").appendTo($(".content div")).attr("href", "javascript:showPoll('"+ poll._id +"')").addClass("list-group-item").text(poll.name);
      });
      localStorage.lastVisitedPage = "allpolls";
    }
  })
}

function createNewPoll(){
  setNavbarActiveState($(".createpoll-btn"));
  $(".panel-heading").text("Create Poll");
  $(".content-header h1").text("Create a new Poll"); // Set the header text
  $(".content-header h4").text("'Creativity takes courage.' ― Henri Matisse")
                         .append("<br>")
                         .append("'That's why I like copy-pasting quotes.' - Myself");
  $(".content").text("");

  $("<form>").appendTo($(".content"))
    .on("submit", sendPoll);


  $("<div>").appendTo($(".content form")).addClass("form-group").append("Title:");
  $("<input>").appendTo($(".content .form-group")).addClass("form-control form-control-lg").attr("type", "text")
    .attr("data-toggle", "popover")
    .attr("data-trigger", "focus")
    .attr("data-placement", "left")
    .attr("title", "Title")
    .attr("name", "title")
    .attr("data-content", "Tell me your name and I tell you who you are.")
    .on("mouseover", function(e){
      $(this).popover();
    });
  $(".content .form-group").append("Choices:") ;
  $("<textarea>").appendTo($(".content .form-group"))
    .addClass("form-control")
    .css("resize", "vertical")
    .attr("data-toggle", "popover")
    .attr("data-trigger", "focus")
    .attr("data-placement", "left")
    .attr("title", "Choices")
    .attr("name", "choices")
    .attr("data-content", "Add the choices for your poll and seperate them by new lines! Also take note of all the beautiful exclamation marks!")
    .on("mouseover", function(e){
      $(this).popover();
    });
  $("<input>").appendTo($(".content .form-group"))
    .attr("type", "submit")
    .addClass("btn btn-default btn-custom");

  localStorage.lastVisitedPage = "createpoll";
}

function sendPoll(e){
  var title = $(e.target.title).val();
  var choices = $(e.target.choices).val().split("\n");
  var dataobj = {title: title, choices: choices};
  e.preventDefault();

  $.ajax({
    url: "/submitpoll",
    type: "post",
    data: dataobj,
    success(data){
      console.log(data);
    }
  })
}

function showPoll(id){
  var dataobj = {_id: id};
  $.ajax({
    url: "/getpoll",
    type: "post",
    data: dataobj,
    success(poll){
      $(".panel-heading").text("Poll");
      $(".content-header h1").text(poll.name.split("").map(function(letter, i){ return i === 0 ? letter.toUpperCase() : letter }).join("")); // Set the header text
      $(".content-header h4").text("Polls are polls are polls are polls.");
      
      $(".content").text(""); // Clear the content

      $("<form class='choice-form'>").appendTo($(".content")).on("submit", function(e){
        e.preventDefault();
        dataobj.choice = e.target["choices-radio"].value;
        poll.choices = poll.choices.map(function(choice){
          console.log(choice.name + ", " + dataobj.choice);
          if(choice.name === dataobj.choice) choice.count++;
          return choice;
        })
        drawChart(poll.name, poll.choices);

        $.ajax({
          url: "/submitchoice",
          type: "post",
          data: dataobj,
          success(newPoll){
            poll.choices = newPoll.value.choices;
            poll.name = newPoll.value.name;
          }
        })
      });

      $(".content form").append("<div class='radio'>");
      poll.choices.forEach(function(choice, i){
        var label = $("<label>").appendTo(".radio").text(choice.name);
        $("<input>").prependTo(label).attr("type", "radio").attr("name", "choices-radio").attr("value", choice.name).addClass("radio-inline");
      })
      $(".content form").append("<input class='btn btn-default btn-custom' type='submit' value='Choose!'>");
      $(".content").append("<div id='chart_div'>");
      drawChart(poll.name, poll.choices);
      
      $("<a>").appendTo($(".content")).attr("href", "#").addClass("btn btn-default btn-custom twitter-button").append("<i class='fa fa-twitter fa-2x'>");
    }
  }) 
}
