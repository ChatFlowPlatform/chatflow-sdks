"""AI Chat Python SDK"""

from .client import AIChatClient
from .errors import (
    AIChatError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    NetworkError,
    NotFoundError,
)
from .types import (
    User,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    Message,
    Conversation,
    Workspace,
)

__version__ = "1.0.0"
__all__ = [
    "AIChatClient",
    "AIChatError",
    "AuthenticationError",
    "ValidationError",
    "RateLimitError",
    "NetworkError",
    "NotFoundError",
    "User",
    "RegisterRequest",
    "LoginRequest",
    "AuthResponse",
    "Message",
    "Conversation",
    "Workspace",
]
