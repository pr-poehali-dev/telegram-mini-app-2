import json
import os
import random
import string
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def serialize_datetime(obj):
    '''Convert datetime objects to string for JSON serialization'''
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def generate_referral_code(length: int = 8) -> str:
    '''Generate unique referral code'''
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage referral system - create users, track referrals, get stats
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with user data and referral stats
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Telegram-Id',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            telegram_id = body_data.get('telegram_id')
            username = body_data.get('username', '')
            first_name = body_data.get('first_name', '')
            referred_by = body_data.get('referred_by')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT * FROM users WHERE telegram_id = %s",
                    (telegram_id,)
                )
                user = cur.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'user': dict(user),
                            'message': 'User already exists'
                        }, default=serialize_datetime)
                    }
                
                referral_code = generate_referral_code()
                while True:
                    cur.execute(
                        "SELECT id FROM users WHERE referral_code = %s",
                        (referral_code,)
                    )
                    if not cur.fetchone():
                        break
                    referral_code = generate_referral_code()
                
                initial_balance = 0
                if referred_by:
                    cur.execute(
                        "SELECT telegram_id FROM users WHERE referral_code = %s",
                        (referred_by,)
                    )
                    referrer = cur.fetchone()
                    
                    if referrer:
                        cur.execute(
                            "UPDATE users SET balance = balance + 1 WHERE referral_code = %s",
                            (referred_by,)
                        )
                
                cur.execute(
                    """
                    INSERT INTO users (telegram_id, username, first_name, balance, referral_code, referred_by)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                    """,
                    (telegram_id, username, first_name, initial_balance, referral_code, referred_by)
                )
                new_user = cur.fetchone()
                
                if referred_by:
                    cur.execute(
                        "SELECT telegram_id FROM users WHERE referral_code = %s",
                        (referred_by,)
                    )
                    referrer = cur.fetchone()
                    if referrer:
                        cur.execute(
                            """
                            INSERT INTO referrals (referrer_telegram_id, referred_telegram_id)
                            VALUES (%s, %s)
                            """,
                            (referrer['telegram_id'], telegram_id)
                        )
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'user': dict(new_user),
                        'message': 'User created successfully'
                    }, default=serialize_datetime)
                }
        
        if method == 'GET':
            telegram_id = event.get('queryStringParameters', {}).get('telegram_id')
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'telegram_id required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT * FROM users WHERE telegram_id = %s",
                    (telegram_id,)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'User not found'})
                    }
                
                cur.execute(
                    "SELECT COUNT(*) as count FROM referrals WHERE referrer_telegram_id = %s",
                    (telegram_id,)
                )
                referral_count = cur.fetchone()['count']
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'user': dict(user),
                        'referral_count': referral_count
                    }, default=serialize_datetime)
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()