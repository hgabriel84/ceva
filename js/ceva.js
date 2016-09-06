//create all the variables
var score;
var cardsmatched;

var uiWrapper = $("#wrapper");
var uiIntro = $("#gameIntro");
var uiStats = $("#gameStats");
var uiCards = $("#cards");
var uiStop = $("#stop");
var uiPlay = $("#gamePlay");
var uiTop = $("#top");
var uiModal = $("#modal");
var uiModalConfig = $("#modalConfig");
var uiPairs = $("#nrPairs");
var uiScore = $(".gameScore");
var uiCardsWrapper = $("#cardsWrapper");
var uiConfigPassword = $("#modalConfigPassword");
var uiConfigInner = $("#modalConfigInner");
var uiConfigHighscores = $("#configHighscores");
var inForm = $("#form");
var inFormPairs = $("#formPairs");
var inFormPassword = $("#inFormPassword");
var inName = $("#inputName");
var inCAMV = $("#inputCAMV");
var inAddress = $("#inputAddress");
var inEmail = $("#inputEmail");
var inPhone = $("#inputPhone");
var inNif = $("#inputNif");
var inNrPairs = $("#inNrPairs");
var inSave = $("#save");
var inPassword = $("#inPassword");
var btSetNrPairs = $("#btSetPairs");
var btExportCSV = $("#btExportCSV");
var btReset = $("#btReset");
var btConfig = $("#btConfig");
var btPassword = $("#btPassword");
var btClose = $("#btClose");

//create deck array
var matchingGame = {};

//on document load the lazy way
$(function() {
  init();
  config();
});

//initialise game
function init() {

  //set localStorage
  if (!localStorage.highscores) {
    localStorage.highscores = JSON.stringify([]);
  }
  if (!localStorage.contacts) {
    localStorage.contacts = JSON.stringify([]);
  }
  if (!localStorage.pairs) {
    localStorage.pairs = 15;
  }

  // init global variables
  playGame = false;
  uiCardsWrapper.hide();
  uiPairs.html(localStorage.pairs);
  uiStats.show();

  // show highscores
  if(localStorage.highscores) {
    // top text will only show the 3 best scores
    var cnt = 3;
    
    var topText = "";
    var topScoresConfig = "<br/>";

    var highscores = JSON.parse(localStorage["highscores"]);

    $.each(highscores, function(key, value) {
      var timeText = getFriendlyTime(value.time);
      if (cnt > 0) {
        topText += (key + 1) + "º " + value.name + " " + timeText + " | ";
      }
      topScoresConfig += (key + 1) + "º " + value.name + " " + timeText + "<br/>";
      --cnt;
    });

    uiTop.html(topText);
    uiConfigHighscores.html(topScoresConfig);
  }

  // set gameIntro container height
  uiIntro.css({
    "height": uiWrapper.height() - uiStats.height() - 70
  });

  // modal init
  uiModal.modal({
    backdrop: 'static',
    keyboard: false
  });
  uiModal.modal('hide');

  // save user data
  inSave.click(function(e) {
    e.preventDefault();
    save();
  });

  // start game
  uiPlay.click(function(e) {
    e.preventDefault();
    uiIntro.hide();
    btConfig.hide();
    startGame();
  });

  // stop game
  uiStop.click(function(e) {
    e.preventDefault();
    stopGame();
  });

  // show config modal
  btConfig.click(function(e) {
    e.preventDefault();
    uiModalConfig.modal('show');
    uiConfigPassword.show();
    uiConfigInner.hide();
  });

  // validate password and show config interface
  btPassword.click(function(e) {
    e.preventDefault();
    inFormPassword.submit();
    var password = inPassword.val();
    if(password == "ceva") {
      uiConfigInner.show();
      uiConfigPassword.hide();
    }
    inPassword.val("");
  });
}

function config() {
  //set number of pairs needed to win game
  btSetNrPairs.click(function(e) {
    inFormPairs.submit();
    var nr = inNrPairs.serialize();
    nr = nr.substring(nr.indexOf('=') + 1);
    localStorage.pairs = nr;
  });

  //export contacts to csv file
  btExportCSV.click(function(e) {
    if (localStorage.contacts) {
      JSONToCSVConvertor(localStorage.contacts, "contactos", true);
    }
  });

  // delete data
  btReset.click(function(e) {
    localStorage.highscores = JSON.stringify([]);
    localStorage.contacts = JSON.stringify([]);
    localStorage.pairs = 15;
  });

  // close config modal, refresh page to reflect changes
  btClose.click(function(e) {
    e.preventDefault();
    location.reload();
  });
}

// prevent submit of form with user data
inForm.submit(function(event) {
  event.preventDefault();
});

// prevent submit form with number of pairs
inFormPairs.submit(function(event) {
  event.preventDefault();
});

//start game and create cards from deck array
function startGame() {
  matchingGame.deck = ['pair01', 'pair01', 'pair02', 'pair02', 'pair03', 'pair03', 'pair04', 'pair04', 'pair05', 'pair05', 'pair06', 'pair06', 'pair07', 'pair07', 'pair08', 'pair08', 'pair09', 'pair09', 'pair10', 'pair10', 'pair11', 'pair11', 'pair12', 'pair12', 'pair13', 'pair13', 'pair14', 'pair14', 'pair15', 'pair15', ];
  uiStats.hide();
  uiCardsWrapper.show();
  uiCards.html("<div class='card'><div class='face front'></div><div class='face back'></div></div>");
  score = new Date().getTime();
  cardsmatched = 0;

  if (playGame == false) {
    // set global variable
    playGame = true;

    // set cards container height
    uiCards.css({
      "height": (uiWrapper.height() - 60)
    });

    // shuffle cards and show them
    matchingGame.deck.sort(shuffle);
    for (var i = 0; i < 29; i++) {
      $(".card:first-child").clone().appendTo("#cards");
    }

    // default values, they'll be override
    var cardWidth = 150;
    var cardHeight = 150;

    // portrait mode
    if(uiCards.height() > uiCards.width()) {
      cardWidth = uiCards.width()/ 6;
      cardHeight = cardWidth;
      var vpad = (uiCards.height() - (5 * cardWidth)) / 6;
      var hpad = 0;
    } else {
      // landscape mode
      cardHeight = uiCards.height() / 5;
      cardWidth = cardHeight;
      var hpad = (uiCards.width() - (6 * cardWidth)) / 7;
      var vpad = 0;
    }

    // initialize each card's position
    uiCards.children().each(function(index) {
      // align the cards to be 5x6 ourselves.
      $(this).css({
        "width": cardWidth,
        "height": cardHeight,
        "left": (cardWidth + hpad) * (index % 6) + hpad,
        "top": (cardHeight + vpad) * Math.floor(index / 6) + vpad
      });

      // get a pattern from the shuffled deck
      var pattern = matchingGame.deck.pop();
      
      // visually apply the pattern on the card's back side.
      $(this).find(".back").addClass(pattern);
      
      // embed the pattern data into the DOM element.
      $(this).attr("data-pattern", pattern);
      
      // listen the click event on each card DIV element.
      $(this).click(selectCard);
    });
  };
}

// shuffle cards
function shuffle() {
  return 0.5 - Math.random();
}

// onclick function add flip class and then check to see if cards are the same
function selectCard() {
  // we do nothing if there are already two cards flipped.
  if ($(".card-flipped").size() > 1) {
    return;
  }
  $(this).addClass("card-flipped");
  // check the pattern of both flipped card 0.7s later.
  if ($(".card-flipped").size() == 2) {
    setTimeout(checkPattern, 700);
  }
}

// if pattern is same remove cards otherwise flip back
function checkPattern() {
  if (isMatchPattern()) {
    $(".card-flipped").removeClass("card-flipped").addClass("card-removed");
    if (document.webkitTransitionEnd) {
      $(".card-removed").bind("webkitTransitionEnd", removeTookCards);
    } else {
      removeTookCards();
    }
  } else {
    $(".card-flipped").removeClass("card-flipped");
  }
}

// put 2 flipped cards in an array then check the image to see if it's the same.
function isMatchPattern() {
  var cards = $(".card-flipped");
  var pattern = $(cards[0]).data("pattern");
  var anotherPattern = $(cards[1]).data("pattern");
  return (pattern == anotherPattern);
}

// check to see if all cardmatched variable is less than N pairs if so remove card only otherwise remove card and end game
function removeTookCards() {
  if (++cardsmatched < localStorage.pairs) {
    $(".card-removed").remove();
  } else {
    // game over, no more cards to flip
    $(".card-removed").remove();
    score = new Date().getTime() - score;
    uiScore.html(getFriendlyTime(score));
    playGame = false;
    uiCardsWrapper.hide();
    uiModal.modal('show');
  }
}

// save user data in cookie with json. if top10 it'll go to highscores
function save() {
  inForm.submit();
  if (inForm.valid()) {
    //input user data
    var name = inName.val();
    name = name.substring(name.indexOf('=') + 1);
    var camv = inCAMV.val();
    camv = camv.substring(camv.indexOf('=') + 1);
    var address = inAddress.val();
    address = address.substring(address.indexOf('=') + 1);
    var phone = inPhone.val();
    phone = phone.substring(phone.indexOf('=') + 1);
    var email = inEmail.val();
    email = email.substring(email.indexOf('=') + 1);
    var nif = inNif.val();
    nif = nif.substring(nif.indexOf('=') + 1);
    var time = score;

    //save current score
    var currentScore = new Object();
    currentScore.name = name;
    currentScore.time = time;

    //save user data
    var contact = new Object();
    contact.name = name;
    contact.email = email;
    contact.phone = phone;
    contact.address = address;
    contact.camv = camv;
    contact.nif = nif;
    contact.score = getFriendlyTime(time);

    //check if is highscore and save it
    var highscores = JSON.parse(localStorage["highscores"]);
    highscores.push(currentScore);
    highscores.sort(function(a, b) {
      return parseFloat(a.time) - parseFloat(b.time);
    });

    // has 11 highscores, time to let go the worst score
    if(highscores.length > 10) {
      highscores.pop();
    }

    // top text will show highscores at the bar
    var topText = "";

    // top text will only show the 3 best scores
    var cnt = 3;

    // top scores config will show highscores at the config page
    var topScoresConfig = "<br/>";

    $.each(highscores, function(key, value) {
      var timeText = getFriendlyTime(value.time);
      if (cnt > 0) {
        topText += (key + 1) + "º " + value.name + " " + timeText + " | ";
      }
      --cnt;

      topScoresConfig += (key + 1) + "º " + value.name + " " + timeText + "<br/>";
    });
    // save highscores in localstorage
    localStorage["highscores"] = JSON.stringify(highscores);

    var contacts = JSON.parse(localStorage["contacts"]);
    contacts.push(contact);
    // save contacts in localstorage
    localStorage["contacts"] = JSON.stringify(contacts);

    //clear input data
    inName.val("");
    inCAMV.val("");
    inAddress.val("");
    inPhone.val("");
    inEmail.val("");
    inNif.val("");

    uiModal.modal('hide');
    uiTop.html(topText);
    uiConfigHighscores.html(topScoresConfig);
    uiStats.show();
    uiIntro.show();
    btConfig.show();
  }
}

inForm.validate({
  rules: {
    inputName: {
      required: true
    },
    inputCAMV: {
      required: true
    },
    inputAddress: {
      required: true
    },
    inputEmail: {
      required: true
    },
    inputPhone: {
      required: true
    },
    inputNif: {
      required: true
    },
  },
  messages: {
    inputName: "Insira nome",
    inputCAMV: "Insira CAMV",
    inputAddress: "Insira morada",
    inputEmail: "Insira email",
    inputPhone: "Insira telefone",
    inputNif: "Insira NIF"
  },
  highlight: function(element) {
    $(element).closest('.form-group').addClass('has-error');
  },
  unhighlight: function(element) {
    $(element).closest('.form-group').removeClass('has-error');
  },
  errorElement: 'span',
  errorClass: 'help-block',
  errorPlacement: function(error, element) {
    if (element.parent('.input-group').length) {
      error.insertAfter(element.parent());
    } else {
      error.insertAfter(element);
    }
  }
});

// stops game, shows intro and hides cards
function stopGame() {
  playGame = false;
  uiCardsWrapper.hide();
  uiIntro.show();
  uiStats.show();
  btConfig.show();
}

// gets millis in friendly format (mm ss dd)
function getFriendlyTime(time) {
  var mins = Math.floor(time / 60000);
    var secs = Math.floor((time % 6e4) / 1000);
    var decs = time.toString().substring(time.toString().length - 3, time.toString().length - 1);
    if (mins > 0)
    {
      return mins + "m" + secs + "s" + decs;
    } else {
      return secs + "s" + decs;
    }
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
  // If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
  var CSV = '';

  //Set Report title in first row or line
  CSV += ReportTitle + '\r\n\n';

  //This condition will generate the Label/Header
  if (ShowLabel) {
    var row = "";

    //This loop will extract the label from 1st index of on array
    for (var index in arrData[0]) {
      //Now convert each value to string and comma-seprated
      row += index + ',';
    }
    row = row.slice(0, -1);

    //append Label row with line break
    CSV += row + '\r\n';
  }

  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
    var row = "";

    //2nd loop will extract each column and convert it in string comma-seprated
    for (var index in arrData[i]) {
      row += '"' + arrData[i][index] + '",';
    }

    row.slice(0, row.length - 1);

    //add a line break after each row
    CSV += row + '\r\n';
  }

  if (CSV == '') {
    alert("Invalid data");
    return;
  }

  //Generate a file name
  var fileName = ReportTitle;

  //Initialize file format you want csv or xls
  var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
  window.location.href = uri;
  // Now the little tricky part.
  // you can use either>> window.open(uri);
  // but this will not work in some browsers
  // or you will not get the correct file extension

  //this trick will generate a temp <a /> tag
  // var link = document.createElement("a");
  // link.href = uri;

  //set the visibility hidden so it will not effect on your web-layout
  // link.style = "visibility:hidden";
  // link.download = fileName + ".csv";

  //this part will append the anchor tag and remove it after automatic click
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
}
