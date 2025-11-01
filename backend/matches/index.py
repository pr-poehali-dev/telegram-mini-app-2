import json
import os
import psycopg2
from typing import Dict, Any

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
        match_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
        
        if match_id:
            query = f"SELECT id, league, country, match_time, match_date, team1, team1_icon, team2, team2_icon, odds, price_coins, status, prediction_text, confidence_percent FROM t_p97532815_telegram_mini_app_2.matches WHERE id = {int(match_id)} AND is_active = true"
            cur.execute(query)
            row = cur.fetchone()
            
            if row:
                match = {
                    'id': row[0], 'league': row[1], 'country': row[2],
                    'time': row[3], 'date': row[4], 'team1': row[5],
                    'team1Icon': row[6], 'team2': row[7], 'team2Icon': row[8],
                    'odds': float(row[9]), 'priceCoins': row[10],
                    'status': row[11], 'predictionText': row[12],
                    'confidence': row[13]
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
                "team2, team2_icon, odds, price_coins, status, prediction_text, confidence_percent "
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
                    'status': row[11], 'predictionText': row[12],
                    'confidence': row[13]
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
        
        league = body_data.get('league', '').replace("'", "''")
        country = body_data.get('country', '').replace("'", "''")
        time_val = body_data.get('time', '').replace("'", "''")
        date_val = body_data.get('date', '').replace("'", "''")
        team1 = body_data.get('team1', '').replace("'", "''")
        team1_icon = body_data.get('team1Icon', '').replace("'", "''")
        team2 = body_data.get('team2', '').replace("'", "''")
        team2_icon = body_data.get('team2Icon', '').replace("'", "''")
        odds = float(body_data.get('odds', 2.0))
        price_coins = int(body_data.get('priceCoins', 1))
        status = body_data.get('status', 'upcoming').replace("'", "''")
        prediction_text = body_data.get('predictionText', '').replace("'", "''")
        confidence = int(body_data.get('confidence', 75))
        
        query = f"""
        INSERT INTO t_p97532815_telegram_mini_app_2.matches 
        (league, country, match_time, match_date, team1, team1_icon, team2, team2_icon, 
        odds, price_coins, status, prediction_text, confidence_percent) 
        VALUES ('{league}', '{country}', '{time_val}', '{date_val}', '{team1}', '{team1_icon}', 
        '{team2}', '{team2_icon}', {odds}, {price_coins}, '{status}', '{prediction_text}', {confidence})
        RETURNING id
        """
        
        cur.execute(query)
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
        match_id = int(body_data.get('id', 0))
        
        league = body_data.get('league', '').replace("'", "''")
        country = body_data.get('country', '').replace("'", "''")
        time_val = body_data.get('time', '').replace("'", "''")
        date_val = body_data.get('date', '').replace("'", "''")
        team1 = body_data.get('team1', '').replace("'", "''")
        team1_icon = body_data.get('team1Icon', '').replace("'", "''")
        team2 = body_data.get('team2', '').replace("'", "''")
        team2_icon = body_data.get('team2Icon', '').replace("'", "''")
        odds = float(body_data.get('odds', 2.0))
        price_coins = int(body_data.get('priceCoins', 1))
        status = body_data.get('status', 'upcoming').replace("'", "''")
        prediction_text = body_data.get('predictionText', '').replace("'", "''")
        confidence = int(body_data.get('confidence', 75))
        
        query = f"""
        UPDATE t_p97532815_telegram_mini_app_2.matches SET 
        league = '{league}', country = '{country}', match_time = '{time_val}', match_date = '{date_val}', 
        team1 = '{team1}', team1_icon = '{team1_icon}', team2 = '{team2}', team2_icon = '{team2_icon}', 
        odds = {odds}, price_coins = {price_coins}, status = '{status}', prediction_text = '{prediction_text}', 
        confidence_percent = {confidence} 
        WHERE id = {match_id}
        """
        
        cur.execute(query)
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Match updated'})
        }
    
    if method == 'DELETE':
        match_id = event.get('queryStringParameters', {}).get('id') if event.get('queryStringParameters') else None
        
        if match_id:
            query = f"UPDATE t_p97532815_telegram_mini_app_2.matches SET is_active = false WHERE id = {int(match_id)}"
            cur.execute(query)
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