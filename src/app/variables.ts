'use strict';

export let isSignedIn = false;
export function change(state: boolean) {
    isSignedIn = state;
    //console.log(isSignedIn);
}

export let jwt = "";
export function setJwt(token: string) {
    jwt = token;
}

export let username = "";
export function setUsername(name: string){
    username = name;
}

export let post_id: number;
export function setPost_id(num){
    post_id = num;
}

export let likes = [];
export function pushLike(l_id) {
    if (likes.includes(l_id)) {
        const index = likes.indexOf(l_id);
        likes.splice(index,1);
        return false;
    } else {
        likes.push(l_id);
        return true;
    }
}

export let dislikes = [];
export function pushDislike(d_id) {
    if (dislikes.includes(d_id)) {
        const index = dislikes.indexOf(d_id);
        dislikes.splice(index,1);
        return false;
    } else {
        dislikes.push(d_id);
        return true;
    }
}