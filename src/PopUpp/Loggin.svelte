
<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var createAcount = () => dispatch('newAcount');
    var submit = () => dispatch('submit', {
        Username: username,
        Password: password
    });

    export var username = '';
    export var password = '';

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

    label {
        display: flex;
        justify-content: space-between;
        align-content: center;
    }

    h1 {
        padding-bottom: 10px;
        margin: 0;
    }

    a {
        color: orange;
    }

    input {
        border: 1px solid gray;
        background-color: rgb(66, 66, 66);
    }

</style>

<div>
    <h1>Logga in</h1>
    <label>UserName: <input bind:value={username} type="text"></label>
    <label>Password: <input bind:value={password} type="password"></label>
    <button on:click={submit}>Logga in</button>
    <p>You dont hav an acount? <a on:click={createAcount}>Create a acount</a> </p>
</div>