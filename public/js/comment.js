const commentFormHandler = async (event) => {
	event.preventDefault();

  const url = window.location.pathname;
  const postId = url.substring(url.lastIndexOf('/')+1);
  const text =  document.querySelector('.text').value;

  console.log("POST ID",postId);

	const response = await fetch('/api/comments/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			postId: postId,
			text: text,
		}),
	});

	if (response.ok) {
		location.reload();
	} else {
		alert(response.statusText);
	}
};

document
.querySelector('#new-comment')
.addEventListener('submit', commentFormHandler);