# Save as project/middleware.py and replace project with your Django package.
from loglogic_client import send_log

class LogLogicMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        route = getattr(getattr(request, 'resolver_match', None), 'route', 'unmatched')
        try:
            send_log('django-demo', 'info', 'Request completed',
                     {'route': route, 'method': request.method, 'status': response.status_code})
        except Exception:
            # Preserve the application's response. Monitor transport failures separately.
            pass
        return response
