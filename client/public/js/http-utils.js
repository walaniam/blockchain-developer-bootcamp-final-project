function getUrlParam(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
  }
  return false;
};

function epochTimeOf(localDateTime) {
    return new Date(localDateTime).getTime() / 1000;
}

function formatDateOf(timestamp) {
    // console.log("timestamp: " + timestamp);
    try {
        return new Date(timestamp * 1000).toLocaleString();
    } catch(err) {
        console.log(err);
    }
}

function defaultDateTime(plusDays) {
    var now = new Date();
    now.setDate(now.getDate() + plusDays);
    now.setHours(12);
    now.setMinutes(0);
    now.setMilliseconds(0);
    var offset = now.getTimezoneOffset() * 60000;
    var adjustedDate = new Date(now.getTime() - offset);
    var formattedDate = adjustedDate.toISOString().substring(0,16); // For minute precision
    return formattedDate;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}