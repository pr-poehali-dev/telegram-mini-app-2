import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage banner settings - get and update banner URL
    Args: event with httpMethod, body
          context with request_id
    Returns: HTTP response with banner settings
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute(
            "SELECT banner_url FROM t_p97532815_telegram_mini_app_2.banner_settings "
            "WHERE is_active = true ORDER BY id DESC LIMIT 1"
        )
        row = cur.fetchone()
        
        banner_url = row[0] if row else 'https://example.com'
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'banner_url': banner_url})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        banner_url = body_data.get('banner_url', 'https://example.com').replace("'", "''")
        
        query = f"UPDATE t_p97532815_telegram_mini_app_2.banner_settings SET banner_url = '{banner_url}', updated_at = CURRENT_TIMESTAMP WHERE is_active = true"
        
        cur.execute(query)
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Banner URL updated', 'banner_url': banner_url})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
