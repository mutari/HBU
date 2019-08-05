<script>

    let files = [new Blob()];
    let file; // the image file data 

    let reader = new FileReader();
    reader.onload = (e) => { file = e.target.result; }
    $: reader.readAsDataURL(files[0]);

</script>

<style>
    .uppload {
        border: solid 1px black; 
    }
</style>

<div class="uppload">
    <label>
        chose a file:
        <input type="file" bind:files={files}>
    </label>

    <div class="display">
        <img src={file} alt="" width="100px" height="100px">
    </div>
</div>