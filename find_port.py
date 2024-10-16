import socket
import os

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

frontend_port = find_free_port()
backend_port = find_free_port()

print(f"Frontend port: {frontend_port}")
print(f"Backend port: {backend_port}")
print(f"API_BASE_URL: http://localhost:{backend_port}")

# Update .env.local file
with open('.env.local', 'w') as f:
    f.write(f"VITE_FRONTEND_PORT={frontend_port}\n")
    f.write(f"VITE_BACKEND_PORT={backend_port}\n")
    f.write(f"VITE_API_BASE_URL=http://localhost:{backend_port}\n")
