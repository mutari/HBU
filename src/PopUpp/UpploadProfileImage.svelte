<script>

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

    function getFile(){
        document.getElementById("upfile").click();
    }
</script>

<style>

    form {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row;
    }

    img {
        width: 32px;
        height: 32px;
        border: solid 1px black;
        border-radius: 50%;
    }

    #yourBtn {
        display: flex;
        max-height: 25px;
        font-family: calibri;
        border: 1px dashed #BBB;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #DDD;
        cursor: pointer;
        border-radius: 15px;
    }

    input[type="button"] {
        display: flex;
        max-height: 25px;
        font-family: calibri;
        border: 1px dashed #BBB;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #DDD;
        cursor: pointer;
        border-radius: 15px;
    }

</style>

<form id="formProfile" action="/api/images" method="POST" encType="multipart/form-data">
        <img src={file} alt="">
        <div id="yourBtn" style="height: 50px; width: 100px;border: 1px dashed #BBB; cursor:pointer;" on:click={getFile}>Choose a file</div>
        <!-- this is your file input tag, so i hide it!-->
        <div style='height: 0px;width:0px; overflow:hidden;'><input id="upfile" name="profileImage" type="file" bind:files={files}/></div>
        <!-- here you can have file submit button or you can write a simple script to upload the file automatically-->
        <input type="button" on:click={uppload} value='uppload'>
</form>