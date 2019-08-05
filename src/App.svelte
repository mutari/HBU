<script>
	import Post from './Post.svelte';
  import Uppload from './PopUpp/uppload.svelte';
  import Header from './Header.svelte';
  import Loggin from './PopUpp/Loggin.svelte';
  import AddAcount from './PopUpp/NewAcount.svelte';

  //profile data
  import * as Profile from './Profile.js';

  let showUppload = false;
  let showLoggin = false;
  let showAddAcount = false;


  //user profile




  //testing
	const p = {
              user: 'PhilipJohansson',
              postericon: '../images/userProfile/profile1.jpg',
              text: 'so i took this pikture today and its of a <strong>fågel</strong>',
              postSrc: '../images/posts/bild2.jpg',
              likes: 0,
              comments: [
                  {autho: "autho", comment: "comment"}
              ],
              color: "orange"
            }

  var settings = () => console.log("open settings");
  var uppload = () => showUppload = !showUppload;
  var user = () => showLoggin = !showLoggin;
  var openCAcount = () => {
      showLoggin = false;
      showAddAcount = true;
  }
  var LogginToAcount = (event) => {
    var e = event.detail;
    Profile.Loggin(e, (res) => {
      console.log(res);
    })
    alert('data: ' + e.Username + ",  " + e.Password);
  }

</script>

<style>

  .main {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "test posts sidbar";

  }

  .posts {
    grid-area: posts;
    display: grid;
    justify-content: center;
  }

  .sidbar {
    grid-area: sidbar;
    position: sticky;
  }

  .sidbarHead {
    position: sticky;
    top: 20px;
    margin-left: 10px;
    padding: 5px;
    border-left: solid 1px gray;
  }


  /*pop upps*/

  /*background*/
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .uppload {
    /*the elements position*/
    position: fixed;
    top: 50%;
    left: 50%;
    width: 600px;
    height: 700px;
    margin-top: -350px;
    margin-left: -300px;
    
    /*style for the element*/
    background-color: gray;
    border: solid 1px black;

  }

  .loggin {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 350px;
    height: 100px;
    margin-top: -50px;
    margin-left: -175px;
  }

  .addAcount {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 350px;
    height: 200px;
    margin-top: -100px;
    margin-left: -175px;
  }

</style>

<!--    HTML     -->

{#if showUppload}
  <div class="uppload">
    <Uppload/>
  </div>
{/if}

{#if showLoggin}
  <div class="mask"></div>
  <div class="loggin">
    <Loggin on:newAcount={openCAcount} on:submit={LogginToAcount}/>
  </div>
{/if}

{#if showAddAcount}
  <div class="mask"></div>
  <div class="addAcount">
    <AddAcount on:submit={(e) => {
      Profile.CreateNewAcount(e, (res) => {
        console.log(res);
        if(res.res == 1) {
          showAddAcount = false;
          console.log("sent");
        }
      });
  }}/>
  </div>
{/if}

<div class="main">

  <div class="posts">
    <Post/>
    <Post {...p}/>
  </div>

  <div class="sidbar">
    
    <div class="sidbarHead">
      <Header on:openSettings={settings} on:openUppload={uppload} on:openUser={user}/>
    </div>  

  </div>

</div>

<svelte:head>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</svelte:head>