import json
import os
from typing import Dict, Any
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create Telegram Stars invoice for coin purchases
    Args: event with httpMethod, body (coins, stars, bonus, userId)
          context with request_id
    Returns: Invoice link for Telegram Stars payment
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    coins = body_data.get('coins', 0)
    stars = body_data.get('stars', 0)
    bonus = body_data.get('bonus', 0)
    user_id = body_data.get('userId', 0)
    
    total_coins = coins + bonus
    title = f"{total_coins} монет для Sportify AI"
    description = f"{coins} монет" + (f" + {bonus} бонус" if bonus > 0 else "")
    
    payload_data = {
        'coins': coins,
        'bonus': bonus,
        'userId': user_id
    }
    
    telegram_api_url = f"https://api.telegram.org/bot{bot_token}/createInvoiceLink"
    
    invoice_params = {
        'title': title,
        'description': description,
        'payload': json.dumps(payload_data),
        'currency': 'XTR',
        'prices': json.dumps([{'label': description, 'amount': stars}])
    }
    
    data = urllib.parse.urlencode(invoice_params).encode('utf-8')
    req = urllib.request.Request(telegram_api_url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        
        if result.get('ok'):
            invoice_link = result['result']
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'invoiceLink': invoice_link}),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to create invoice', 'details': result}),
                'isBase64Encoded': False
            }
