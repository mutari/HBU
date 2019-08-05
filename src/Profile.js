/*
  profile data 
  local storage for testing 
 */
export var profile = {
    username: "",
    name: "",
    icone: ""
}


/*

*/

export function Loggin(event, _callback) {
  var e = event.detail;

  jQuery.ajax({
    type: 'POST',
    url: "/Loggin",
    contentType: "application/json",
    data: JSON.stringify({Event: e}),
    headers: {
      Authorization: "..."
    }
  }).done((response) => {
    _callback(response);
  }).fail((data) => {
    if(data.responseText != '') console.log("error:   " + data.responseText);
    else console.log('error:   Oops! An error occured and your message could not be sent.');
  }); 
}




/*
  Create a new acount
  Try to send alla the acount info to the server and get a uppdate respons of the server
*/
export function CreateNewAcount(event, _callback) {
    var e = event.detail;

    jQuery.ajax({
      type: 'POST',
      url: "/CreateAcount",
      contentType: "application/json",
      data: JSON.stringify({Event: e}),
      headers: {
          Authorization: "..."
      }
    }).done(function(response) {
      _callback(response)
    }).fail(function(data) {
        if(data.responseText != '') console.log("error:   " + data.responseText);
        else console.log('error:   Oops! An error occured and your message could not be sent.');
    });
  }