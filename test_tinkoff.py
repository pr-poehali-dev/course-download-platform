import hashlib
import json

TINKOFF_TERMINAL_KEY = '1763583059270DEMO'
TINKOFF_PASSWORD = 'lsvm4_ae1IliD9RM'

def generate_tinkoff_token(params):
    """Генерация токена для подписи запроса к Тинькофф"""
    token_params = {k: str(v) for k, v in params.items() if k != 'Token' and k != 'DATA' and k != 'Receipt'}
    token_params['Password'] = TINKOFF_PASSWORD
    
    sorted_values = [str(token_params[k]) for k in sorted(token_params.keys())]
    concatenated = ''.join(sorted_values)
    
    print(f"Token params: {token_params}")
    print(f"Sorted keys: {sorted(token_params.keys())}")
    print(f"Concatenated: {concatenated}")
    
    return hashlib.sha256(concatenated.encode('utf-8')).hexdigest()

# Тест
token_params = {
    'TerminalKey': TINKOFF_TERMINAL_KEY,
    'Amount': 50000,
    'OrderId': 'order_1000015_100_test',
    'Description': 'Покупка 120 баллов'
}

token = generate_tinkoff_token(token_params)
print(f"\nGenerated token: {token}")
print(f"Token length: {len(token)}")
