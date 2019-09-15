<script>


    //this shitt dos not work att all new to fix the resiver of the dispatch and the server sid 
    //det borde vara samma som profileImage uppload så bara kopiera det

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var uppload = () => dispatch('uppload', {
        file: files[0]
    });

    var files = [new Blob()];
    let file;

    let reader = new FileReader();
    reader.onload = (e) => { file = e.target.result; }
    $: reader.readAsDataURL(files[0]);

    function getFile2(){
        document.getElementById("upfile").click();
    }

</script>

<style>
* {
    margin: 0;
    padding: 0;
}

#formUpload {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

img {
    border: solid 1px black;
    width: 600px;
    height: 660px;
}

input[type="button"] {
    justify-content: center;
    max-height: 30px;
}

</style>

<form id="formUpload" action="/api/images" method="POST" encType="multipart/form-data">
    <img src={file} alt="" on:click={getFile2} style="cursor: pointer;">
    <!-- this is your file input tag, so i hide it!-->
    <div style='height: 0px;width:0px; overflow:hidden;'><input id="upfile" name="profileImage" type="file" bind:files={files}/></div>
    <!-- here you can have file submit button or you can write a simple script to upload the file automatically-->
    <input type="textarea" placeholder="Write somthing">
    <input type="button" on:click={uppload} value='uppload'>
</form>