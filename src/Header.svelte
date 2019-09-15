<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var settingsEvent = () => dispatch('openSettings');
    var upploadEvent = () => dispatch('openUppload');
    var userEvent = () => {
        if(loggedIn) dispatch('loggOut');
        else dispatch('loggIn');
    };
    var imageEvent = () => dispatch('upploadProfileImage');

    export var user;

    var loggedIn;

    $: loggedIn = user != null;

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
        display: flex;
        margin: 10px 0 10px 0;
    }

    .image {
        display: flex;
        flex: 1;
        justify-content: center;
        align-content: center;
        max-width: 32px; min-width: 32px;
        max-height: 32px; min-height: 32px;
        position: relative;
    }

    img, #imgtag {
        padding: 0;
        margin: 0;
        border: solid 1px gray;
        border-radius: 50%;
        max-width: 32px; min-width: 32px;
        max-height: 32px; min-height: 32px;
    }

    p {
        padding: 5px;
        display: flex;
        flex: 5;
        width: 70%;
        align-content: center;
    }

</style>

<div class="header">

    <h1 class="title">HBU</h1>

    {#if loggedIn}
        <div class="profileDisplay">
            <div class="image" >
                {#if user.Usericon != null}
                    <img src="{user.Usericon}" alt="">
                {:else}
                    <p id="imgtag" on:click={imageEvent}>add</p>
                {/if}
            </div>
            <p>{user.Username}</p>
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