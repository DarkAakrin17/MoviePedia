import flask
from flask import Flask, make_response, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, EqualTo
from flask_bcrypt import Bcrypt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from pymongo import MongoClient
from urllib.parse import quote_plus

from flask import Flask
from flask_mail import Mail, Message


app = flask.Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = 'your_secret_key_here'


login_manager = LoginManager()
login_manager.init_app(app)

bcrypt = Bcrypt()

username = 'DarkAakrin7'
password = 'Aakthivi@7'
host = 'cluster0.fysnarf.mongodb.net'
database_name = 'flask'

# Escape username and password
escaped_username = quote_plus(username)
escaped_password = quote_plus(password)

# Construct the connection string
connection_string = f'mongodb+srv://{escaped_username}:{escaped_password}@{host}/{database_name}?retryWrites=true&w=majority'

client = MongoClient(connection_string)
db = client[database_name]


class User(UserMixin):
    def __init__(self, id):
        self.id = id

    def get_id(self):
        return str(self.id)


class LoginForm(FlaskForm):
    username = StringField('USERNAME', validators=[DataRequired()],  render_kw={
        "class": "inputForm", "placeholder": "Username"})
    password = PasswordField('Password', validators=[DataRequired()],  render_kw={
        "class": "inputForm", "placeholder": "Password"})
    submit = SubmitField('Log In')


class SignupForm(FlaskForm):

    username = StringField('USERNAME', validators=[DataRequired()],  render_kw={
        "class": "inputForm", "placeholder": "Username"})
    email = StringField('E-MAIL', validators=[DataRequired()],  render_kw={
        "class": "inputForm", "placeholder": "E-Mail"})
    password = PasswordField('PASSWORD', validators=[DataRequired()],  render_kw={
        "class": "inputForm", "placeholder": "Password"})
    confirm_password = PasswordField('CONFIRM PASSWORD', validators=[
                                     DataRequired(), EqualTo('password', message='Passwords must match')],  render_kw={
        "class": "inputForm", "placeholder": "Confirm Password"})
    submit = SubmitField('Sign Up')


@login_manager.user_loader
def load_user(user_id):
    # Replace this with your own logic to load the user from the database
    user_data = db.users.find_one({"username": user_id})
    if user_data:
        user = User(user_data['username'])
        return user
    return None


df2 = pd.read_csv('tmdb.csv')

tfidf = TfidfVectorizer(stop_words='english', analyzer='word')

# Construct the required TF-IDF matrix by fitting and transforming the data
tfidf_matrix = tfidf.fit_transform(df2['soup'])
print(tfidf_matrix.shape)

# construct cosine similarity matrix
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
print(cosine_sim.shape)

df2 = df2.reset_index()
indices = pd.Series(df2.index, index=df2['title']).drop_duplicates()

# create array with all movie titles
all_titles = [df2['title'][i] for i in range(len(df2['title']))]


def get_recommendations(title):
    # Get the index of the movie that matches the title
    idx = indices[title]
    # Get the pairwise similarity scores of all movies with that movie
    sim_scores = list(enumerate(cosine_sim[idx]))
    # Sort the movies based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    # Get the scores of the 10 most similar movies
    sim_scores = sim_scores[1:11]
    # print similarity scores
    print("\n movieId      score")
    for i in sim_scores:
        print(i)

    # Get the movie indices
    movie_indices = [i[0] for i in sim_scores]

    # return list of similar movies
    return_df = pd.DataFrame(columns=['Title', 'Homepage'])
    return_df['Title'] = df2['title'].iloc[movie_indices]
    return_df['Homepage'] = df2['homepage'].iloc[movie_indices]
    return_df['ReleaseDate'] = df2['release_date'].iloc[movie_indices]
    return return_df


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()

    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        email = form.email.data

        # Check if the username already exists in the database
        existing_user = db.users.find_one({"username": username})
        if existing_user:
            flash('Username already exists. Please choose a different username.', 'error')
            return redirect(url_for('signup'))

        user_mail = db.users.find_one({"email": email})
        if user_mail:
            flash('Username already exists. Please choose a different username.', 'error')
            return redirect(url_for('signup'))

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(
            password).decode('utf-8')

        # Create a new user in the database
        db.users.insert_one(
            {"username": username, "password": hashed_password, "email": email})
        flash('Mail Sent!! Account created successfully. You can now log in.', 'success')
        return redirect(url_for('login_view'))

    return render_template('signup.html', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login_view():
    form = LoginForm()

    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        # Fetch the user from the database based on the username
        user_data = db.users.find_one({"username": username})
        if user_data:
            # Verify the password using check_password_hash
            if bcrypt.check_password_hash(user_data['password'], password):
                user = User(user_data['username'])
                login_user(user)
                return redirect(url_for('index'))

        flash('Invalid username or password', 'error')

    return render_template('login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/', methods=['GET', 'POST'])
def main():
    if flask.request.method == 'GET':
        return flask.render_template('index.html')

    if flask.request.method == 'POST':
        m_name = " ".join(flask.request.form['movie_name'].title().split())
        if m_name not in all_titles:
            return flask.render_template('notFound.html', name=m_name)
        else:
            result_final = get_recommendations(m_name)
            names = []
            homepage = []
            releaseDate = []
            for i in range(len(result_final)):
                names.append(result_final.iloc[i][0])
                releaseDate.append(result_final.iloc[i][2])
                if len(str(result_final.iloc[i][1])) > 3:
                    homepage.append(result_final.iloc[i][1])
                else:
                    homepage.append("#")

            return flask.render_template('found.html', movie_names=names, movie_homepage=homepage, search_name=m_name, movie_releaseDate=releaseDate)


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)
    # app.run()
