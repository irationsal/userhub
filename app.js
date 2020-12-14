const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

const fetchUsers = () => {
    const USERS_URL = `${BASE_URL}/users`
    return fetchData(USERS_URL)
}

/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
    const ALBUM_URL = `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
    return fetchData(ALBUM_URL)
}

function fetchUserPosts(userId) {
    const USERS_POSTS_URL = `${ BASE_URL }/users/${ userId }/posts?_expand=user`
    return fetchData(USERS_POSTS_URL);
}
  
function fetchPostComments(postId) {
    const POST_COMMENTS_URL = `${ BASE_URL }/posts/${ postId }/comments`
    return fetchData(POST_COMMENTS_URL);
}

const fetchData = (url) => {
    return fetch(url)
        .then (function (response) {
            return response.json()
        })
        .catch(function (error) {
            console.log(error)
        })
}

function setCommentsOnPost(post) {
    // post.comments might be undefined, or an []
    // if undefined, fetch them then set the result
    // if defined, return a rejected promise
    if (post.comments) {
        return Promise.reject(null)
    }
    return fetchPostComments(post.id)
        .then(function (comments) {
            post.comments = comments;
            return post
        })
}

function renderPost(post) {
    //console.log(post)
    const div = $('<div>').addClass('post-card')
        .html(`
        <header>
            <h3>${post.title}</h3>
            <h3>--- ${post.user.username}</h3>
        </header>
        <p>${post.body}</p>
        <footer>
            <div class="comment-list"></div>
            <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
        </footer>`)
        div.data('post', post)
    return div
}

function renderPostList(postList) {
    $('#app section.active').removeClass('active')
    const list = $('#post-list')
    list.empty()
    list.addClass('active')
    postList.forEach(function (post) {
        list.append(renderPost(post))
    })
}

function renderUser(user) {
    const div = $('<div>').addClass('user-card')
        .html(
        `<header>
            <h2>${user.name}</h2>
        </header>
        <section class="company-info">
            <p><b>Contact:</b> ${user.email}</p>
            <p><b>Works for:</b> ${user.company.name}</p>
            <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
        </section>
        <footer>
            <button class="load-posts">POSTS BY ${user.username}</button>
            <button class="load-albums">ALBUMS BY ${user.username}</button>
        </footer>`)
        div.data('user', user)
    return div
}

function renderUserList(userList) {
    const list = $('#user-list')
    list.empty()
    userList.forEach((user) => {
        list.append(renderUser(user))
    })
}

/* render a single album */
function renderAlbum(album) {
    const div = $('<div>').addClass('album-card')
    .html(`
    <header>
      <h3>${album.title}, by ${album.user.username} </h3>
    </header>
    <section class="photo-list"></section>
  `)
  const list = div.find('.photo-list')
    album.photos.forEach(function (photo) {
        list.append(renderPhoto(photo))
    }) 
  return div
}

/* render a single photo */
function renderPhoto(photo) {
    const div = $('<div>').addClass('photo-card')
        .html(`
        <a href="${photo.url}" target="_blank">
          <img src="${photo.thumbnailUrl}">
          <figure>${photo.title}</figure>
        </a>
      `)
    return div
}

/* render an array of albums */
function renderAlbumList(albumList) {
    $('#app section.active').removeClass('active')
    const list = $('#album-list')
    list.empty()
    list.addClass('active')
    albumList.forEach(function (album) {
        list.append(renderAlbum(album))
    })
}

function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
  }

function bootStrap() {
    fetchUsers().then(renderUserList)
}

bootStrap()

$('#user-list').on('click', '.user-card .load-posts', function () {
    // load posts for this user
    // render posts for this user
    //console.log($('.user-card').data('user'))
    const user = $(this).closest('div').data('user')
    fetchUserPosts(user.id)
        .then(function (postList) {
            renderPostList(postList)
        })
});
  
$('#user-list').on('click', '.user-card .load-albums', function () {
    // load albums for this user
    // render albums for this user
    const user = $(this).closest('div').data('user') 
    //console.log(user.id)
    fetchUserAlbumList(user.id).then(function (albumList) {
        //console.log(albumList)
        renderAlbumList(albumList)
    })
});

$('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
    const commentList = postCardElement.find('.comment-list')

    setCommentsOnPost(post)
      .then(function (post) {
        //console.log('building comments for the first time...', post);
        commentList.empty()
        post.comments.forEach(function (comment) {
            const commentHTML = $(`<h3>${comment.body} --- ${comment.email}</h3>`)
            commentList.append(commentHTML)
        })
        toggleComments(postCardElement)
        })
      .catch(function () {
        //console.log('comments previously existed, only toggling...', post);
        toggleComments(postCardElement)
      });
  });

