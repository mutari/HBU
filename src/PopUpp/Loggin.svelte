
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

    form {
        background-color: rgb(37, 37, 37);
        border: solid 1px black;
        padding: 15px;
    }

    a {
        color: orange;
    }

    input {
        border: 1px solid gray;
        background-color: rgb(66, 66, 66);
    }

</style>

<form action="">
    <label>UserName: <input bind:value={username} type="text"></label>
    <label>Password: <input bind:value={password} type="password"></label>
    <button on:click={submit}>Logga in</button>
    <p>You dont hav an acount? <a on:click={createAcount}>Create a acount</a> </p>
</form>