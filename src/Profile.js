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

  let h = new Headers();
  h.append('Accept', 'application/json');

  let fd = new FormData();
  fd.append('Username', e.Username);
  fd.append('Password', e.Password);

  let req = new Request('http://localhost/Loggin', {
    method: 'POST',
    headers: h,
    mode: 'no-cors',
    body: fd
  })

  fetch(req)
        .then( (res) => {
          return res.json()
        })
        .then( (res) => {
          _callback(res);
        })
        .catch( (err) => {
          console.log('ERROR:', err.message);
        }); 

}


/*
  Create a new acount
  Try to send alla the acount info to the server and get a uppdate respons of the server
*/
export function CreateNewAcount(event, _callback) {
    var e = event.detail;

    console.table(e);

    let h = new Headers();
    h.append('Accept', 'application/json');

    let fd = new FormData();
    fd.append('Username', e.Username);
    fd.append('Name', e.Name);
    fd.append('Email', e.Email);
    fd.append('Password', e.Password);

    let req = new Request('http://localhost/CreateAcount', {
      method: 'POST',
      headers: h,
      mode: 'no-cors',
      body: fd
    });

    fetch(req)
          .then( (res) => {
            return res.json();
          })
          .then( (res) => {
            _callback(res);
          })
          .catch( (err) => {
            console.log('ERROR:', err.message);
          });
           
  }


/*
  uppload a profile image
*/
export function Uppload(file, _callback) {

  let h = new Headers();
  //h.append('Accept', 'application/json');

  let fd = new FormData();

  fd.append('profile', window.localStorage.getItem('loggedin'));

  console.log('file ::: ', file);
  fd.append('icone', file, 'icone.jpg');

  let req = new Request('/ImageUppload', {
    method: 'POST',
    headers: {},
    mode: 'no-cors',
    body: fd
  })

  fetch(req)
        .then( (res) => {
          return res.json();
        })
        .then( (res) => {
          console.log("anser");
          _callback(res);
        })
        .catch( (err) => {
          console.log('ERROR:', err.message);
        });

}