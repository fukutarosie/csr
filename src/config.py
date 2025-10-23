"""
Configuration management for the application
"""
import json
import os

def load_config():
    """Load configuration from config.json"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Use development config by default
    env_config = config['development']
    
    # Generate CORS origins from configuration
    origins = []
    for port in env_config['frontendPorts']:
        origins.append(f"http://{env_config['backendHost']}:{port}")
    
    return {
        'CORS_ORIGINS': origins,
        'BACKEND_PORT': env_config['backendPort'],
        'BACKEND_HOST': env_config['backendHost']
    }