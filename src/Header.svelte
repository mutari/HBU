<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var settingsEvent = () => dispatch('openSettings');
    var upploadEvent = () => dispatch('openUppload');
    var userEvent = () => dispatch('openUser');

    export var loggedIn = false;
    export var name = "";
    export var image = "";

</script>

<style>

    ul {
        list-style-type: none;
        margin-left: 10px;
    }

    button {
        background-color: transparent;
        background-repeat: no-repeat;
        padding: 5px 10px 5px 10px;
    }

    button:hover {
        font-weight: bold;
        box-shadow: 0 0 5px gray;
    }

    .profileDisplay {
        border: solid 1px black;
    }

</style>

<div class="header">

    <h1 class="title">HBU</h1>
    
    {#if loggedIn}
        <div class="profileDisplay">
            <img src="{image}" alt="">
            <p>{name}</p>
        </div>
    {/if}

    <ul>
        <li><button on:click={settingsEvent}>Settings</button></li>
        <li><button on:click={upploadEvent}>Uppload</button></li>
        <li><button on:click={userEvent}>
            {#if !loggedIn}
                LoggIn
            {:else}
                LoggOut
            {/if}
        </button></li>
    </ul>

</div>