<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var submit = () => {

        if(password1 !== password2) {
            Class = "error";
        } else {
            Class = "";

            dispatch('submit', {
                Username: username,
                Name: name,
                Email: email,
                Password: password1,
            });
        }
    }

    var username = "";
    var name = "";
    var email = "";
    var password1 = "";
    var password2 = "";
    var profileImage = [new Blob()];

    let Class = "";

</script>

<style>

    * {
        color: lightgray;
    }

    div {
        background-color: rgb(37, 37, 37);
        border: solid 1px black;
        padding: 15px;
    }

    input {
        border: 1px solid gray;
        background-color: rgb(66, 66, 66);
        width: 180px;
    }

    .error {
        border: solid 1px red;
    }

    h1 {
        padding-bottom: 10px;
        margin: 0;
    }

    label {
        display: flex;
        justify-content: space-between;
        align-content: center;
    }

    button {
        color: lightgray;
        border: 1px solid gray;
        background-color: rgb(66, 66, 66);
    }

</style>

<div class="{Class}">
    <h1>Create a new acount</h1>
    <label>UserName: <input bind:value={username} type="text"></label>
    <label>Name: <input bind:value={name} type="text"></label>
    <label>E-post: <input bind:value={email} type="text"></label>
    <label>Password: <input bind:value={password1} type="password"></label>
    <label>Password: <input bind:value={password2} type="password"></label>
    <button on:click={submit}>Create acount</button>
</div>