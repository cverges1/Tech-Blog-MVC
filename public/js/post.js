const postFormHandler = async (event) => {
  event.preventDefault();

  const title = document.querySelector("#title").value;
  const text = document.querySelector("#text").value;

  const response = await fetch("/api/posts/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      text: text,
    }),
  });

  if (response.ok) {
    document.location.replace("/");
  } else {
    alert(response.statusText);
  }
};

const postUpdateHandler = async (event) => {
  event.preventDefault();

  const url = window.location.pathname;
  const postId = url.substring(url.lastIndexOf("/") + 1);
  const title = document.querySelector("#update-title").value;
  const text = document.querySelector("#update-text").value;

  console.log('postID', postId);
  console.log('title', title);
  console.log('text', text);


  const response = await fetch(`/api/posts/${postId}`, {
  	method: 'PUT',
  	headers: { 'Content-Type': 'application/json' },
  	body: JSON.stringify({
		// postId: postId,
  		title: title,
  		text: text,
  	}),
  });

  if (response.ok) {
  	document.location.replace('/');
  } else {
  	alert(response.statusText);
  }
};

const postDeleteHandler = async (event) => {
	event.preventDefault();
  
	const url = window.location.pathname;
	const postId = url.substring(url.lastIndexOf("/") + 1);
  
  
	const response = await fetch(`/api/posts/${postId}`, {
		method: 'DELETE',
	});
  
	if (response.ok) {
		document.location.replace('/');
	} else {
		alert(response.statusText);
	}
  };

document.querySelector("#new-post").addEventListener("submit", postFormHandler);
document.querySelector("#update-post").addEventListener("submit", postUpdateHandler);
document.querySelector("#delete-btn").addEventListener("click", postDeleteHandler);