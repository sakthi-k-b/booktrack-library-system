from flask import Flask, render_template, jsonify, request, session, redirect
import sqlite3
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

admin_user = os.getenv('ADMIN_USER')
admin_pass = hash_password(os.getenv('ADMIN_PASS'))
secret_key = os.getenv('SECRET_KEY')

app= Flask(__name__)
app.secret_key= secret_key

def get_db_connection():
    conn= sqlite3.connect('library.db')
    conn.execute('PRAGMA foreign_keys = ON')
    conn.row_factory= sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            availability INTEGER NOT NULL DEFAULT 1
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 0
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS borrowed (
            book_id INTEGER UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            due_date DATE NOT NULL,
            FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    c.execute('SELECT * FROM users WHERE is_admin = 1')
    admin= c.fetchone()
    if not admin:
        c.execute('INSERT INTO users (username, password, is_admin) VALUES (?,?,?)',
                  (admin_user, admin_pass, 1))
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register-page')
def register_page():
    return render_template('register_page.html')

@app.route('/login-page')
def login_page():
    return render_template('login_page.html')

@app.route('/register',methods=['POST'])
def register():
    username= request.form['username']
    password= hash_password(request.form['password'])
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password, is_admin) VALUES (?,?,?)',
                  (username, password, 0))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return render_template('reg_fail.html',username=username)
    conn.close()
    return render_template('reg_success.html',username=username)

@app.route('/login',methods=['POST'])
def login():
    username= request.form['username']
    password= hash_password(request.form['password'])
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, is_admin FROM users WHERE username=? AND password=?',
              (username, password))
    user= c.fetchone()
    conn.close()

    if user:
        if user[1] == 1:
            session['admin_id']= user[0]
            session['admin_username']= username
            return render_template('admin.html',admin_username=session.get('admin_username'))
        else:
            session['user_id']= user[0]
            session['username']= username
            return render_template('user.html',username=session.get('username'))
    return render_template('login_fail.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')
    
@app.route('/load-books')
def load_books():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM books')
    books = c.fetchall()
    conn.close()
    return jsonify([{'id':b[0], 'title':b[1], 'category': b[2], 'availability':b[3]} for b in books])

@app.route('/add-book', methods=['POST'])
def add_book():
    newBook= request.json
    title= newBook.get('title')
    category= newBook.get('category')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO books (title,category) VALUES (?,?)',(title,category))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-book', methods=['POST'])
def delete_book():
    input= request.json
    id= input.get('id')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM books WHERE id = ?',(id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/update-book', methods=['POST'])
def update_book():
    input= request.json
    id= input.get('id')
    title= input.get('title')
    category= input.get('category')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE books SET title = ? , category = ? WHERE id = ?',(title, category, id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/search-book')
def search_book():
    query= request.args.get('q')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM books WHERE title LIKE ? OR category LIKE ?',('%'+query+'%' ,'%'+query+'%'))
    books = c.fetchall()
    conn.close()
    return jsonify([{'id':b[0], 'title':b[1], 'category': b[2], 'availability' : b[3]} for b in books])

@app.route('/load-borrow')
def load_borrow():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''SELECT book_id, user_id, username, due_date 
              FROM borrowed b  JOIN users u ON b.user_id = u.id
              ''')
    borrowed = c.fetchall()
    conn.close()
    return jsonify([{'bookId':b[0], 'userId':b[1], 'username':b[2], 'dueDate':b[3]} for b in borrowed])

@app.route('/load-borrow-past')
def load_borrow_past():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''SELECT book_id, user_id, username, due_date 
              FROM borrowed b  JOIN users u ON b.user_id = u.id
              WHERE due_date < DATE('now')
              ''')
    borrowed = c.fetchall()
    conn.close()
    return jsonify([{'bookId':b[0], 'userId':b[1], 'username':b[2], 'dueDate':b[3]} for b in borrowed])

@app.route('/load-borrow-today')
def load_borrow_today():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''SELECT book_id, user_id, username, due_date 
              FROM borrowed b  JOIN users u ON b.user_id = u.id
              WHERE due_date = DATE('now')
              ''')
    borrowed = c.fetchall()
    conn.close()
    return jsonify([{'bookId':b[0], 'userId':b[1], 'username':b[2], 'dueDate':b[3]} for b in borrowed])

@app.route('/add-borrow', methods=['POST'])
def add_borrow():
    input= request.json
    bookId= input.get('bookId')
    userId= input.get('userId')
    dueDate= input.get('dueDate')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT availability FROM books WHERE id=?',(bookId,))
    book= c.fetchone()
    if not book:
        c.close()
        return jsonify({'status':'bookId does not exist'})
    if book[0] == 0:
        c.close()
        return jsonify({'status': 'cannot borrow'})
    try:
        c.execute('INSERT INTO borrowed (book_id, user_id, due_date) VALUES (?,?,?)',(bookId,userId,dueDate))
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'status': 'invalid user_id'})
    c.execute('UPDATE books SET availability=? WHERE id=?', (0,bookId))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/remove-borrow', methods=['POST'])
def remove_borrow():
    input= request.json
    id= input.get('bookId')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM borrowed WHERE book_id=?',(id,))
    book= c.fetchone()
    if not book:
        c.close()
        return jsonify({'status':'invalid bookId'})
    c.execute('DELETE FROM borrowed WHERE book_id = ?',(id,))
    c.execute('UPDATE books SET availability=? WHERE id=?', (1,id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/user-load-borrow')
def user_load_borrow():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''SELECT book_id, title, due_date 
              FROM borrowed b  JOIN users u ON b.user_id = u.id
              JOIN books bk ON b.book_id = bk.id
              WHERE b.user_id=?
              ''',(session.get('user_id'), ))
    borrowed = c.fetchall()
    conn.close()
    return jsonify([{'bookId':b[0], 'title':b[1], 'dueDate':b[2]} for b in borrowed])

@app.route('/load-user')
def load_user():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, username, is_admin FROM users')
    users = c.fetchall()
    conn.close()
    return jsonify([{'id':u[0], 'username':u[1], 'is_admin': u[2]} for u in users])

@app.route('/remove-user', methods=['POST'])
def remove_user():
    input= request.json
    id= input.get('id')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM borrowed WHERE user_id = ?',(id,))
    users= c.fetchall()
    if users:
        conn.close()
        return jsonify({'status': 'user has not returned borrowed books'})
    c.execute('DELETE FROM users WHERE id = ?',(id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/search-user')
def search_user():
    query= request.args.get('q')
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id LIKE ? OR username LIKE ?',('%'+query+'%' ,'%'+query+'%'))
    users = c.fetchall()
    conn.close()
    return jsonify([{'id':u[0], 'username':u[1], 'is_admin': u[2]} for u in users])

if __name__ == '__main__':
    app.run(debug=True)