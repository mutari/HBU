<script>
    export let user = 'null';
    export let postericon = '../images/userProfile/profile1.jpg';
    export let title = 'title';
    export let text = 'this is an exampel';
    export let postSrc = '../images/posts/bild1.jpg';
    export let likes = 0;
    export let liked = false;
    export let comments = [
        {autho: "autho", comment: "comment"}
    ]
    export let color = "gray";


    var likeButton = () => {
        liked = !liked;
    }

</script>

<style>

    .post {
        border-radius: 15px;
        overflow: hidden;
        width: 600px;
        margin-bottom: 20px;
    }
    .postBar {
        width: 100%;
        height: 15px;
    }

    .poster {
    }

    .poster .postHeader {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding-left: 9px;
        margin-bottom: 15px;
    }

    .poster .postHeader img {
        border-radius: 50%;
        border: solid 1px black;
        max-width: 32px;
        max-height: 32px;
    }

    .poster .postHeader .username {
        margin-left: 12px;
    }

    .poster .postBody {
        max-width: 600px;
        max-height: 660px;
        overflow: hidden;
    }

    .poster .postBody img {
        width: 100%;
    }

    .poster .postFooter {
        display: flex;
        flex-direction: column;
        margin: -4px 5px 10px 5px;
    }

    .poster .postFooter .icon {
        display: flex;
        flex-direction: row;
    }

    .poster .postFooter .icon button {
        margin: 3px;
        padding: 0;
    }

    .poster .postFooter .text {
        margin: 0 10px 10px 10px;
    }

    button {
        background-color: Transparent;
        background-repeat:no-repeat;
        border: none;
        cursor:pointer;
        overflow: hidden;
        outline:none;
        font-size: 30px;
    }

</style>

<div class="{color} post">
    <div class="postBar"></div>

    <div class="poster">
        <div class="postHeader">
            <img src={postericon} alt="">
            <p class="username">{user}</p>
        </div>
        <div class="postBody">
            <img src={postSrc} alt="">
        </div>
        <div class="postFooter">
            <div class="icon">
                <button>✑</button>
                <button class:like="{liked === true}" on:click={likeButton}>♥</button>
            </div>
            <div class="text">
                <span>
                    {@html text}
                </span>
            </div>
        </div>
    </div>
</div>