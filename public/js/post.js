	// collect user input
    const title = document.querySelector('title').value;
    const text =  document.querySelector('text').value;

    console.log(title,text)
console.log()

const signupFormHandler = async (event) => {
	event.preventDefault();

	const response = await fetch('/api/posts/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
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

document
.querySelector('#new-post')
.addEventListener('submit', signupFormHandler);
