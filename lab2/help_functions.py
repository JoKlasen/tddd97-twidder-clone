import re
import random

email_regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')

PSW_MIN_LEN = 4
PSW_MAX_LEN = 100
FIRSTNAME_MIN_LEN = 1
FIRSTNAME_MAX_LEN = 100
LASTNAME_MIN_LEN = 1
LASTNAME_MAX_LEN = 100
CITY_MIN_LEN = 1 
CITY_MAX_LEN = 100
COUNTRY_MIN_LEN = 1
COUNTRY_MAX_LEN = 100

def is_valid_email(email):
    return re.fullmatch(email_regex, email)

def is_within_range(data, min, max):
    return len(data) >= min and len(data) <= max

def is_valid_sign_up(body):
    
    
    if  'email' not in body or      \
        'password' not in body or   \
        'firstname' not in body or  \
        'familyname' not in body or \
        'gender' not in body or     \
        'city' not in body or       \
        'country' not in body:
        return False
    
    if not is_valid_email(body['email']):
        return False

    if not is_within_range(body['password'], PSW_MIN_LEN, PSW_MAX_LEN):
        return False

    if not is_within_range(body['firstname'], FIRSTNAME_MIN_LEN, FIRSTNAME_MAX_LEN):
        return False

    if not is_within_range(body['familyname'], LASTNAME_MIN_LEN, LASTNAME_MAX_LEN):
        return False

    if not is_within_range (body['city'], CITY_MIN_LEN, CITY_MAX_LEN):
        return False 
        
    if not is_within_range(body['country'], COUNTRY_MIN_LEN, COUNTRY_MAX_LEN):
        return False 

    if not (body['gender'] == 'Male' or body['gender'] == 'Female' or body['gender'] == 'Other'):   
        return False
   
    return True


def generate_token():
    letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(36):
        token += random.choice(letters)
    return token


def print_except(e):
    print("Något gick snett till :/")
    print(e)