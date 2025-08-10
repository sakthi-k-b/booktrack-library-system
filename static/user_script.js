async function loadBooks() {
    const response= await fetch('/load-books');
    const books= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Availability</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let book of books) {
        html += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.category}</td>
                <td>${book.availability === 1 ? 'Available' : 'Borrowed'}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;
    document.querySelector('#list').innerHTML= html;
}

loadBooks()

async function userLoadBorrow() {
    const response= await fetch('/user-load-borrow');
    const borrowed= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>Book ID</th>
                    <th>Title</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let b of borrowed) {
        html += `
            <tr>
                <td>${b.bookId}</td>
                <td>${b.title}</td>
                <td>${b.dueDate}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    document.querySelector('#borrowList').innerHTML= html;
}

userLoadBorrow()

let search= document.querySelector('#search');
search.addEventListener('input', async function () {
    let response= await fetch('/search-book?q=' + search.value);
    let books= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Availability</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let book of books) {
        html += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.category}</td>
                <td>${book.availability === 1 ? 'Available' : 'Borrowed'}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;
    document.querySelector('#list').innerHTML= html;
})