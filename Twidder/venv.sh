virtualenv .env && source .env/bin/activate && pip install -r requirements.txt
echo "*" > .env/.gitignore
alias runserver="gunicorn -b localhost:5000 --workers 1 --threads 100 server:app --reload"