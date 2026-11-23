from loglogic_client import send_log
result = send_log('python-demo', 'info', 'Hello from Python', {'source': 'quickstart'})
print('Accepted log count', result['count'])
