import socket

def find_free_port(start_port, max_port):
    for port in range(start_port, max_port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('', port))
                return port
            except OSError:
                continue
    return None

if __name__ == "__main__":
    frontend_port = find_free_port(3000, 4000)
    backend_port = find_free_port(5000, 6000)
    
    if frontend_port and backend_port:
        print(f"VITE_PORT={frontend_port}")
        print(f"FLASK_RUN_PORT={backend_port}")
        print(f"VITE_API_BASE_URL=http://localhost:{backend_port}")
        print(f"FRONTEND_URL=http://localhost:{frontend_port}")
    else:
        print("Error: Could not find available ports.")
        exit(1)