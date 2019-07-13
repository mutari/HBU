<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    var settingsEvent = () => dispatch('openSettings');
    var upploadEvent = () => dispatch('openUppload');

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

</style>

<div class="header">

    <h1 class="title">HBU</h1>
    
    <ul>
        <li><button on:click={settingsEvent}>Settings</button></li>
        <li><button on:click={upploadEvent}>Uppload</button></li>
    </ul>

</div>