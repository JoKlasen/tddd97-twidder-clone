import re

email_regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')

def is_valid_email(email):
    if re.fullmatch(email_regex, email):
      return True
    else:
      return False


def is_valid_sign_up(body):
    
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

    if len(body['password']) < PSW_MIN_LEN or len(body['password']) > PSW_MAX_LEN:
        return False 

    if len(body['firstname']) < FIRSTNAME_MIN_LEN or len(body['firstname']) > FIRSTNAME_MAX_LEN:
        return False 
        
    if len(body['familyname']) < LASTNAME_MIN_LEN or len(body['familyname']) > LASTNAME_MAX_LEN:
        return False 

    if len(body['city']) < CITY_MIN_LEN or len(body['city']) > CITY_MAX_LEN:
        return False 
        
    if len(body['country']) < COUNTRY_MIN_LEN or len(body['country']) > COUNTRY_MAX_LEN:
        return False 

    if not (body['gender'] == 'Male' or body['gender'] == 'Female' or body['gender'] == 'Other'):   
        return False
   
    return True