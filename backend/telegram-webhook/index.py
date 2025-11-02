import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle Telegram payment webhooks and credit coins to user
    Args: event with httpMethod, body (Telegram update)
          context with request_id
    Returns: Success response
    '''
    method: str = event.get('httpMethod', 'POST')
    
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
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    if 'pre_checkout_query' in body_data:
        query_id = body_data['pre_checkout_query']['id']
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
        import urllib.request
        import urllib.parse
        
        answer_url = f"https://api.telegram.org/bot{bot_token}/answerPreCheckoutQuery"
        answer_data = urllib.parse.urlencode({'pre_checkout_query_id': query_id, 'ok': 'true'}).encode()
        
        req = urllib.request.Request(answer_url, data=answer_data, method='POST')
        urllib.request.urlopen(req)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    if 'message' in body_data and 'successful_payment' in body_data['message']:
        payment = body_data['message']['successful_payment']
        payload_str = payment.get('invoice_payload', '{}')
        payload = json.loads(payload_str)
        
        user_id = payload.get('userId')
        coins = payload.get('coins', 0)
        bonus = payload.get('bonus', 0)
        total_coins = coins + bonus
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE users SET balance = balance + %s WHERE telegram_id = %s",
            (total_coins, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'coins_added': total_coins}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }
