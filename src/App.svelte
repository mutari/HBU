<script>
	import Post from './Post.svelte';
  import Uppload from './uppload.svelte';
  import Header from './Header.svelte';

  let showUppload = false;

	const p = {
              user: 'PhilipJohansson',
              postericon: '../images/userProfile/profile1.jpg',
              title: 'title',
              text: 'so i took this pikture today and its of a <strong>fågel</strong>',
              postSrc: '../images/posts/bild2.jpg',
              likes: 0,
              comments: [
                  {autho: "autho", comment: "comment"}
              ],
              color: "orange"
            }

  var settings = () => {
    console.log("open settings");
  }

  var uppload = () => {
    showUppload = !showUppload;
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
    border-left: solid 1px gray;
  }

</style>

<!--    HTML     -->

{#if showUppload}
  <Uppload/>
{/if}

<div class="main">

  <div class="posts">
    <Post/>
    <Post {...p}/>
  </div>

  <div class="sidbar">
    
    <div class="sidbarHead">
      <Header on:openSettings={settings} on:openUppload={uppload}/>
    </div>  

  </div>

</div>

