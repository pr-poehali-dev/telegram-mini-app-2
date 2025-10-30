import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage sports matches - create, read, update, delete predictions
    Args: event with httpMethod, body, queryStringParameters
          context with request_id
    Returns: HTTP response with match data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    if method == 'GET':
        match_id = event.get('queryStringParameters', {}).get('id')
        
        if match_id:
            cur.execute(
                "SELECT id, league, country, match_time, match_date, team1, team1_icon, "
                "team2, team2_icon, odds, price_coins, status, prediction_text "
                "FROM t_p97532815_telegram_mini_app_2.matches WHERE id = %s AND is_active = true",
                (match_id,)
            )
            row = cur.fetchone()
            
            if row:
                match = {
                    'id': row[0], 'league': row[1], 'country': row[2],
                    'time': row[3], 'date': row[4], 'team1': row[5],
                    'team1Icon': row[6], 'team2': row[7], 'team2Icon': row[8],
                    'odds': float(row[9]), 'priceCoins': row[10],
                    'status': row[11], 'predictionText': row[12]
                }
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'match': match})
                }
        else:
            cur.execute(
                "SELECT id, league, country, match_time, match_date, team1, team1_icon, "
                "team2, team2_icon, odds, price_coins, status, prediction_text "
                "FROM t_p97532815_telegram_mini_app_2.matches WHERE is_active = true "
                "ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            
            matches = []
            for row in rows:
                matches.append({
                    'id': row[0], 'league': row[1], 'country': row[2],
                    'time': row[3], 'date': row[4], 'team1': row[5],
                    'team1Icon': row[6], 'team2': row[7], 'team2Icon': row[8],
                    'odds': float(row[9]), 'priceCoins': row[10],
                    'status': row[11], 'predictionText': row[12]
                })
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'matches': matches})
            }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        cur.execute(
            "INSERT INTO t_p97532815_telegram_mini_app_2.matches "
            "(league, country, match_time, match_date, team1, team1_icon, team2, team2_icon, "
            "odds, price_coins, status, prediction_text) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (
                body_data['league'], body_data['country'], body_data['time'],
                body_data['date'], body_data['team1'], body_data['team1Icon'],
                body_data['team2'], body_data['team2Icon'], body_data['odds'],
                body_data.get('priceCoins', 1), body_data.get('status', 'upcoming'),
                body_data.get('predictionText', '')
            )
        )
        
        match_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': match_id, 'message': 'Match created'})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        match_id = body_data.get('id')
        
        cur.execute(
            "UPDATE t_p97532815_telegram_mini_app_2.matches SET "
            "league = %s, country = %s, match_time = %s, match_date = %s, "
            "team1 = %s, team1_icon = %s, team2 = %s, team2_icon = %s, "
            "odds = %s, price_coins = %s, status = %s, prediction_text = %s "
            "WHERE id = %s",
            (
                body_data['league'], body_data['country'], body_data['time'],
                body_data['date'], body_data['team1'], body_data['team1Icon'],
                body_data['team2'], body_data['team2Icon'], body_data['odds'],
                body_data.get('priceCoins', 1), body_data.get('status', 'upcoming'),
                body_data.get('predictionText', ''), match_id
            )
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Match updated'})
        }
    
    if method == 'DELETE':
        match_id = event.get('queryStringParameters', {}).get('id')
        
        cur.execute(
            "UPDATE t_p97532815_telegram_mini_app_2.matches SET is_active = false WHERE id = %s",
            (match_id,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Match deleted'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
