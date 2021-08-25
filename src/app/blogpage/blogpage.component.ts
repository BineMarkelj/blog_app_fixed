import { variable } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, forwardRef, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import * as myVariables from '../variables'
import { AmplifyService } from 'aws-amplify-angular'; 

import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { Console } from 'console';
import { Observable } from 'rxjs';
import { Server } from 'http';


@Component({
  selector: 'app-blogpage',
  templateUrl: './blogpage.component.html',
  styleUrls: ['./blogpage.component.scss']
})
export class BlogpageComponent implements OnInit {

  getBlogsUrl = 'https://79y8rfvibh.execute-api.eu-central-1.amazonaws.com/dev/blogs';
  getCommentsUrl = 'https://79y8rfvibh.execute-api.eu-central-1.amazonaws.com/dev/comments';
  postBlogUrl = 'https://ip90xwfmm1.execute-api.eu-central-1.amazonaws.com/dev/blog';
  postCommentUrl = 'https://ip90xwfmm1.execute-api.eu-central-1.amazonaws.com/dev/comment';
  likeUrl = 'https://ip90xwfmm1.execute-api.eu-central-1.amazonaws.com/dev/likes';
  like_bUrl = 'https://ip90xwfmm1.execute-api.eu-central-1.amazonaws.com/dev/likes/blog_likes';
  getCChainUrl = 'https://79y8rfvibh.execute-api.eu-central-1.amazonaws.com/dev/comments/chain';
  postCChainUrl = 'https://ip90xwfmm1.execute-api.eu-central-1.amazonaws.com/dev/comment/chain';

  getResultBlogs: any = {};
  getResultBlog: any = {};
  getResultLikes: any = {};
  getResultDis: any = {};
  modalEl: any;
  modalEl1: any;
  getResultComments: any = {};
  username: any;
  dislikeStatus: any;
  rr: any;
  getResultCChains: any = {};

  show() {
    if (myVariables.isSignedIn === true) {
      return true;
    } 
    return false;
  }

  constructor(private http: HttpClient, private _router: Router, private amplifyService:AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyService.authStateChange$
      .subscribe(authState => {
        if (authState.state === 'signedIn') {
       //   console.log("AUTHENTICATED USER");
          myVariables.change(true);
          getToken();

          async function getToken(this: any) {
            const user = await Auth.currentAuthenticatedUser();
          // console.log(user);
            const token = user.signInUserSession.idToken.jwtToken;
          //  console.log(token);
            const username = user.username;
            myVariables.setJwt(token);
            myVariables.setUsername(username);
          }
        } else {
        //  console.log("GUEST USER");
        }
      });
  }

///API CALL TO LOAD AND SORT BLOGS
  doGetBlogs() {
    this.http.get(this.getBlogsUrl).subscribe(
      res => { this.getResultBlogs = res; 
      
      (this.getResultBlogs.blogs).sort(function(a,b){
        let c:any;
        let d:any;
        c = new Date(a.blog_time);
        d = new Date(b.blog_time);
        return  d-c;
      })
    //  console.log(this.getResultBlogs.blogs);
    },
      err => { console.log("Error occured: " + err.message);}
    );
  }

///API CALL TO LOAD AND SORT COMMENTS
  doGetComments(post_id: string) {
    this.http.get(this.getCommentsUrl + '?post_id=' + post_id).subscribe(
      res => { this.getResultComments = res; this.getResultComments=this.getResultComments.comments;
      (this.getResultComments.Items).sort(function(a,b){
        let c:any;
        let d:any;
        c = new Date(a.comment_time);
        d = new Date(b.comment_time);
        return  c-d;
      });

      this.doGetCChain(post_id);
      
    },
      err => { console.log("Error occured: " + err.message);}
    );
  }


  // API CALL TO GET CHAIN COMMENTS - REPLYS
  doGetCChain(post_id) {
    this.http.get(this.getCChainUrl + '?post_id=' + post_id).subscribe(
      res => { this.getResultCChains = res; this.getResultCChains = (this.getResultCChains.chains); 
      (this.getResultCChains.Items).sort(function(a,b){
       // console.log("SORTING");
        let c:any;
        let d:any;
        c = new Date(a.cchain_time);
        d = new Date(b.cchain_time);
        return  c-d;
      }); 
  }, err => {console.log(err.message);})}



///API CALL TO POST BLOG
  doPostBlog() {

    if(myVariables.jwt === "") {
      alert("Sign in to post a blog!")
      return;
    }

    const postBlogTitle = ((document.getElementById("posttitle") as HTMLInputElement).value);
    const postBlogText = ((document.getElementById("posttext") as HTMLInputElement).value);

    if (postBlogText==="" || postBlogTitle==="") {
      alert("No fields can be empty");
      return;
    }

    const now = new Date();
    let month = now.getMonth() +1;
    let monthStr = "";
    if (month < 10) { monthStr = "0"+month.toString()} else{monthStr = month.toString()}
    let minutes = now.getMinutes();
    let minutesStr = "";
    if (minutes < 10) { minutesStr = "0"+minutes.toString()} else {minutesStr = minutes.toString()}
    const time = (now.getFullYear()+"-"+monthStr+"-"+now.getDate()+"  "+now.getHours()+":"+minutesStr+ ":" +now.getSeconds())

    const id = time + myVariables.username;
    let hashId = this.hashCode(id);

    const PK = "POST#" + hashId;
    const SK = "BLOG#" + hashId;

      const body = {
        "PK": PK,
        "SK": SK,
        "type": "BLOG",
        "post_id": hashId.toString(),
        "blog_id": hashId.toString(),
        "blog_author": myVariables.username,
        "blog_title": postBlogTitle,
        "blog_text": postBlogText,
        "blog_likes": 0,
        "blog_dislikes": 0,
        "blog_time": time
      }

    //let header1 = new HttpHeaders().set("Authorization", 'bearer '+ myVariables.jwt);
    //console.log(params.headers);
    
    this.http.post(this.postBlogUrl, body).subscribe(
      res => {this.doGetBlogs(); 
      (document.getElementById("posttitle") as HTMLInputElement).value = "";
      (document.getElementById("posttext") as HTMLInputElement).value = "";

    },
      err => {console.log("Error occured: " + err.message);}
    );
  }


///API CALL TO POST COMMENT
  doPostComment() {

    if(myVariables.jwt === "") {
      alert("Sign in to post a comment!")
      return;
    }

    const postCommentText = ((document.getElementById("commenttext") as HTMLInputElement).value);
    
    const PK = "POST#" + myVariables.post_id;

    if (postCommentText==="") {
      alert("No fields can be empty");
      return;
    }

    const now = new Date();
    const time = (now.getFullYear()+"-"+ (now.getMonth()+1)+"-"+now.getDate()+"  "+now.getHours()+":"+now.getMinutes()+ ":" +now.getSeconds());

    const id = time + myVariables.username;
    const hashId = this.hashCode(id);
    const SK = "COMMENT#" + hashId;
    //console.log(post_id);

      const body = {
        "PK": PK,
        "SK": SK,
        "type": "COMMENT",
        "post_id": myVariables.post_id,
        "comment_id": hashId,
        "comment_author": myVariables.username,
        "comment_text": postCommentText,
        "comment_time": time
      }

    this.http.post(this.postCommentUrl, body).subscribe(
      res => {this.btnComment(body.post_id); 
      (document.getElementById("commenttext") as HTMLInputElement).value = ""},
      err => {console.log("Error occured: " + err.message);}
    );
  }


///API CALL TO LOAD SPECIFIC BLOG - EDIT PURPOSES
  doGetBlog(post_id: string, post_author: any) {
    //console.log(this.postBlogUrl+"?post_id="+post_id)
    if(post_author !== myVariables.username) {
      alert("You can edit only your own posts!");
      return;
    }
    this.http.get(this.postBlogUrl+"?post_id="+post_id).subscribe(
      res => { this.getResultBlog = res; this.getResultBlog=this.getResultBlog.blog.Items[0] ;this.btnEdit(post_id);},
      err => { console.log("Error occured: " + err.message);}
    );
  }


///API CALL PATCH BLOG - EDIT
  doEditBlog() {
   // console.log(this.getResultBlog);
   const editBlogText = ((document.getElementById("edittext") as HTMLInputElement).value);

    const body = {
      "PK": this.getResultBlog.PK,
      "SK": this.getResultBlog.SK,
      "updateKey": "blog_text",
      "updateValue": editBlogText,
    }
    //console.log(body);

    this.http.patch(this.postBlogUrl,body).subscribe(
      res => {this.modalEl1.style.display = "none";this.doGetBlogs();},
      err => { console.log("Error occured: " + err.message);}
    );

  }

///API CALL TO DELETE COMMENT
  doDeleteComment(PK: any, SK: any, author: string, post_id) {
    //console.log(PK + " "+ SK+" "+ author);
    if (myVariables.username !== author) {
      alert("You can delete only your own comments!");
      return;
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        "PK": PK,
        "SK": SK,
      },
    };

    this.http.delete(this.postCommentUrl, options).subscribe(
      res => { this.btnComment(post_id)},
      err => { console.log("Error occured: " + err.message);}
    );
  }


///API CALL TO PATCH COMMENT -EDIT
  doEditComment(result, edit) {
    const body = {
      "PK": result.PK,
      "SK": result.SK,
      "updateKey": "comment_text",
      "updateValue": edit,
    }

    //console.log(body);

    this.http.patch(this.postCommentUrl,body).subscribe(
      res => {this.btnComment(result.post_id);},
      err => { console.log("Error occured: " + err.message);}
    );
  }

///API CALL TO PATCH - EDIT BLOG LIKE ATTRIBUTE
doLike(result, resLikes) {

  //console.log(result);
  //console.log(resLikes);

  if(myVariables.jwt === "") {
    alert("Sign in to dislike a post!")
    return;
  }

   if (resLikes.like.Items.length === 0) {
    //POST NEW LIKE 
  const now = new Date();
  const time = (now.getFullYear()+"-"+ (now.getMonth()+1)+"-"+now.getDate()+"  "+now.getHours()+":"+now.getMinutes())

  const id = time + myVariables.username;
  const hashId = this.hashCode(id);
  const SK = "LIKE#" + hashId;

    const body = {
      "PK": result.PK,
      "SK": SK,
      "post_id": result.post_id,
      "type": "LIKE",
      "like_author": myVariables.username,
      "liked": true,
      "disliked": false,
    }


      this.http.post(this.likeUrl, body).subscribe(
        res => {},
        err => {console.log(err.message);}
      )

      //UPDATE LIKE COUNT ON BLOG COMPONENT
      const bodyBlog = {
        "PK": result.PK,
        "SK": result.SK,
        "updateKey": "blog_likes",
        "updateValue": result.blog_likes+1,
      }
  
      this.http.patch(this.like_bUrl,bodyBlog).subscribe(
        res => {this.doGetBlogs();},
        err => { console.log("Error: "+ err.message);});
   } else {
    //PATCH LIKE 

    const liked = resLikes.like.Items[0].liked;

    const bodyLike = {
      "PK": resLikes.like.Items[0].PK,
      "SK": resLikes.like.Items[0].SK,
      "updateKey": "liked",
      "updateValue": !liked,
    }

    this.http.patch(this.likeUrl, bodyLike).subscribe(
      res => {},
      err => {console.log(err.message);}
    );

    //UPDATE DISLIKELIKE COUNT ON BLOG COMPONENT

    var update = 1; 
    if (liked) {
      update = -1;
    }

    const bodyBlog = {
      "PK": result.PK,
      "SK": result.SK,
      "updateKey": "blog_likes",
      "updateValue": result.blog_likes+update,
    }

    this.http.patch(this.like_bUrl,bodyBlog).subscribe(
      res => {this.doGetBlogs();},
      err => { console.log("Error: "+ err.message);});
   }
}






///API CALL TO PATCH - EDIT BLOG DISLIKE ATTRIBUTE
  doDislike(result, resLikes) {

    //console.log(result);
    //console.log(resLikes);

    if(myVariables.jwt === "") {
      alert("Sign in to dislike a post!")
      return;
    }

     if (resLikes.like.Items.length === 0) {
      //POST NEW DISLIKELIKE 
    const now = new Date();
    const time = (now.getFullYear()+"-"+ (now.getMonth()+1)+"-"+now.getDate()+"  "+now.getHours()+":"+now.getMinutes())

    const id = time + myVariables.username;
    const hashId = this.hashCode(id);
    const SK = "LIKE#" + hashId;

      const body = {
        "PK": result.PK,
        "SK": SK,
        "post_id": result.post_id,
        "type": "LIKE",
        "like_author": myVariables.username,
        "liked": false,
        "disliked": true,
      }


        this.http.post(this.likeUrl, body).subscribe(
          res => {},
          err => {console.log(err.message);}
        )

        //UPDATE DISLIKELIKE COUNT ON BLOG COMPONENT
        const bodyBlog = {
          "PK": result.PK,
          "SK": result.SK,
          "updateKey": "blog_dislikes",
          "updateValue": result.blog_dislikes+1,
        }
    
        this.http.patch(this.like_bUrl,bodyBlog).subscribe(
          res => {this.doGetBlogs();},
          err => { console.log("Error: "+ err.message);});
     } else {
      //PATCH DISLIKELIKE 

      const disliked = resLikes.like.Items[0].disliked;

      const bodyDislike = {
        "PK": resLikes.like.Items[0].PK,
        "SK": resLikes.like.Items[0].SK,
        "updateKey": "disliked",
        "updateValue": !disliked,
      }

      this.http.patch(this.likeUrl, bodyDislike).subscribe(
        res => {},
        err => {console.log(err.message);}
      );

      //UPDATE DISLIKELIKE COUNT ON BLOG COMPONENT

      var update = 1; 
      if (disliked) {
        update = -1;
      }

      const bodyBlog = {
        "PK": result.PK,
        "SK": result.SK,
        "updateKey": "blog_dislikes",
        "updateValue": result.blog_dislikes+update,
      }
  
      this.http.patch(this.like_bUrl,bodyBlog).subscribe(
        res => {this.doGetBlogs();},
        err => { console.log("Error: "+ err.message);});
     }
  }


doDislikePrecall(result) {
  if(myVariables.jwt === "") {
    alert("Sign in to dislike a post!")
    return;
  }

  this.http.get(this.likeUrl+"?post_id="+result.post_id).subscribe(
    res => {this.getResultLikes=res; this.doDislike(result, this.getResultLikes)},
    err => {console.log(err.message);}
  );
}

doLikePrecall(result) {
  if(myVariables.jwt === "") {
    alert("Sign in to dislike a post!")
    return;
  }

  this.http.get(this.likeUrl+"?post_id="+result.post_id).subscribe(
    res => {this.getResultLikes=res; this.doLike(result, this.getResultLikes)},
    err => {console.log(err.message);}
  );
}



///API CALL DELETE BLOG 
  doDeleteBlog(PK: any, SK: any, author: string) {
    //console.log(PK + " "+ SK+" "+ author);
    if (myVariables.username !== author) {
      alert("You can delete only your own posts!");
      return;
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        "PK": PK,
        "SK": SK,
      },
    };

    this.http.delete(this.postBlogUrl, options).subscribe(
      res => {this.doGetBlogs()},
      err => { console.log("Error occured: " + err.message);}
    );
  }




  
  doPostCChain(result, cchain) {
  
    if (cchain==="") {
      alert("No fields can be empty");
      return;
    }

    const now = new Date();
    const time = (now.getFullYear()+"-"+ (now.getMonth()+1)+"-"+now.getDate()+"  "+now.getHours()+":"+now.getMinutes()+ ":"+now.getSeconds())

    const id = time + myVariables.username;
    const hashId = this.hashCode(id);
    const SK = "CCHAIN#" + hashId;
    //console.log(post_id);

      const body = {
        "PK": result.PK,
        "SK": SK,
        "type": "CCHAIN",
        "post_id": result.post_id,
        "cchain_id": hashId,
        "cchain_author": myVariables.username,
        "cchain_text": cchain,
        "cchain_time": time,
        "og_comment_id": result.comment_id.toString()
      }

    this.http.post(this.postCChainUrl, body).subscribe(
      res => {this.btnComment(body.post_id);},
      err => {console.log("Error occured: " + err.message);}
    );
  }




//////// OTHER METHODS ////////////

  btnEditComment(result) {
    if (result.comment_author !== myVariables.username) {
      alert("You can only edit your own comments!");
      return;
    }

    let input = prompt("Edited comment:", result.comment_text);

    if (input != null) {
      const edit = input;
      //console.log(edit);
      this.doEditComment(result, edit);
    }
    
  }

  //HASH CODER - UNIQUE ID's
  hashCode(str: string) {
    return str.split('').reduce((prevHash, currVal) =>
      (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
  }


  goToHome() {
    myVariables.change(false);
    myVariables.setJwt("");
    myVariables.setUsername("");
    Auth.signOut({ global: true })
    .then(data => {
      this._router.navigate(['home']);
    })
    .catch(err => console.log(err));
  }




  logOut() {
    myVariables.change(false);
    myVariables.setJwt("");
    myVariables.setUsername("");
    Auth.signOut({ global: true })
    .then(data => {
      this._router.navigate(['auth']);
    })
    .catch(err => console.log(err));
  }




  btnComment(post_id: any) {
    //console.log(post_id);
    myVariables.setPost_id(post_id);
    this.modalEl = document.getElementById("myModal");
    //console.log(this.modalEl);
    this.modalEl.style.display = "block";

    
    this.doGetComments(post_id);
  }

  spanComment() {
    myVariables.setPost_id(null);
    this.modalEl = document.getElementById("myModal");
    //console.log("span");
    this.getResultCChains = {};
    this.modalEl.style.display = "none";
  }




  btnEdit(post_id: any) {
    //console.log(post_id);
    myVariables.setPost_id(post_id);
    this.modalEl1 = document.getElementById("editModal");
    //console.log(this.modalEl);
    this.modalEl1.style.display = "block";

    
    
  }

  spanEdit() {
    myVariables.setPost_id(null);
    this.modalEl1 = document.getElementById("editModal");
    //console.log("span");
    this.modalEl1.style.display = "none";
  }


  replyChain(result) {
    if(myVariables.jwt === "") {
      alert("Sign in to post a comment!")
      return;
    }

    //console.log(result);

    let input = prompt("Reply comment:");

    if (input != null) {
      const cchain = input;
      //console.log(edit);
      this.doPostCChain(result, cchain);
    }
  }


  async ngOnInit() {
    this.doGetBlogs();

    this.username = myVariables.username;
    if (myVariables.isSignedIn === false) {
      console.log("GUEST USER");
    } else {
      console.log("AUTHENTICATED USER");
    }
  }

}


