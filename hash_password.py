import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode('utf-8')

# Hash the password
password = "testpassword123"
hashed = hash_password(password)
print(hashed)
