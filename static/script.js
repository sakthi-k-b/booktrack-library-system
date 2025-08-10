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

async function loadBorrow(route='/load-borrow') {
    const response= await fetch(route);
    const borrowed= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>Book ID</th>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let b of borrowed) {
        html += `
            <tr>
                <td>${b.bookId}</td>
                <td>${b.userId}</td>
                <td>${b.username}</td>
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

loadBorrow()

async function loadUser() {
    const response= await fetch('/load-user');
    const users= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Is Admin</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let u of users) {
        html += `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.is_admin === 1 ? 'Admin' : 'User'}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    document.querySelector('#userList').innerHTML= html;
}

loadUser()

let addBook= document.querySelector('#addBook');
addBook.addEventListener('click', async function() {
    const inputTitle= document.querySelector('#title-add').value;
    const inputCat= document.querySelector('#category-add').value;
    if (!inputTitle || !inputCat){
        document.querySelector('#msg-add-book').textContent= 'title or category feild is empty';
        setTimeout(() => {
            document.querySelector('#msg-add-book').textContent= '';
        },3000);
        return;
    }
    await fetch('/add-book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: inputTitle, category: inputCat})
    });
    document.querySelector('#title-add').value= '';
    document.querySelector('#category-add').value= '';
    loadBooks();
});

let deleteBook= document.querySelector('#deleteBook');
deleteBook.addEventListener('click', async function() {
    const inputId= document.querySelector('#id-delete').value;
    if (!inputId)
    {
        document.querySelector('#msg-delete-book').textContent= 'id field is empty';
        setTimeout(() => {
            document.querySelector('#msg-delete-book').textContent= '';
        },3000);
        return;
    }
    await fetch('/delete-book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: inputId})
    });
    document.querySelector('#id-delete').value= '';
    loadBooks();
    loadBorrow();
});

let updateBook= document.querySelector('#updateBook');
updateBook.addEventListener('click', async function() {
    const inputTitle= document.querySelector('#title-update').value;
    const inputCat= document.querySelector('#category-update').value;
    const inputId= document.querySelector('#id-update').value;
    if (!inputTitle || !inputCat || !inputId){
        document.querySelector('#msg-update-book').textContent= 'title or category or id feild is empty';
        setTimeout(() => {
            document.querySelector('#msg-update-book').textContent= '';
        },3000);
        return;
    }
    await fetch('/update-book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: inputId, title: inputTitle, category: inputCat})
    });
    document.querySelector('#title-update').value= '';
    document.querySelector('#category-update').value= '';
    document.querySelector('#id-update').value= '';
    loadBooks();
});

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

let addBorrow= document.querySelector('#addBorrow');
addBorrow.addEventListener('click', async function () {
    const bookId= document.querySelector('#add-borrow-book-id').value;
    const userId= document.querySelector('#add-borrow-user-id').value;
    const dueDate= document.querySelector('#due-date').value;
    if(!bookId || !userId || !dueDate){
        document.querySelector('#msg-add-borrow').textContent= 'book-id or user-id or due-date field is empty';
        setTimeout(() => {
            document.querySelector('#msg-add-borrow').textContent= '';
        },3000);
        return;
    }
    let response= await fetch('/add-borrow', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bookId: bookId, userId: userId, dueDate: dueDate})
    });
    const msg= await response.json()
    document.querySelector('#msg-add-borrow').textContent= msg.status
    setTimeout(() => {
        document.querySelector('#msg-add-borrow').textContent= '';
    },3000);
    document.querySelector('#add-borrow-book-id').value= '';
    document.querySelector('#add-borrow-user-id').value= '';
    document.querySelector('#due-date').value= '';
    loadBorrow();
    loadBooks();
});

let removeBorrow= document.querySelector('#removeBorrow');
removeBorrow.addEventListener('click', async function() {
    const inputId= document.querySelector('#remove-borrow-book-id').value;
    if (!inputId){
        document.querySelector('#msg-remove-borrow').textContent= 'book-id field is empty';
        setTimeout(() => {
            document.querySelector('#msg-remove-borrow').textContent= '';
        },3000);
        return;
    }
    let response= await fetch('/remove-borrow', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bookId: inputId})
    });
    let msg= await response.json()
    document.querySelector('#msg-remove-borrow').textContent= msg.status
    setTimeout(() => {
        document.querySelector('#msg-remove-borrow').textContent= '';
    },3000);
    document.querySelector('#remove-borrow-book-id').value= '';
    loadBorrow();
    loadBooks();
});

let borrowFilter= document.querySelector('#borrowFilter');
borrowFilter.addEventListener('change', async function () {
    const filter= borrowFilter.value;
    if(filter == 'all'){
        loadBorrow();
    }else if(filter == 'past'){
        loadBorrow('/load-borrow-past');
    }else if(filter == 'today'){
        loadBorrow('/load-borrow-today');
    }
});

let removeUser= document.querySelector('#removeUser');
removeUser.addEventListener('click', async function() {
    const inputId= document.querySelector('#id-remove-user').value;
    if (!inputId){
        document.querySelector('#msg-remove-user').textContent= 'id field is empty';
        setTimeout(() => {
            document.querySelector('#msg-remove-user').textContent= '';
        },3000);
        return;
    }
    let response= await fetch('/remove-user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: inputId})
    });
    let msg= await response.json();
    document.querySelector('#msg-remove-user').textContent= msg.status
    setTimeout(() => {
        document.querySelector('#msg-remove-user').textContent= '';
    },3000);
    document.querySelector('#id-remove-user').value= '';
    loadUser();
});

let searchUser= document.querySelector('#search-user');
searchUser.addEventListener('input', async function () {
    let response= await fetch('/search-user?q=' + searchUser.value);
    let users= await response.json();
    let html = `
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Is Admin</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let u of users) {
        html += `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.is_admin === 1 ? 'Admin' : 'User'}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    document.querySelector('#userList').innerHTML= html;
})