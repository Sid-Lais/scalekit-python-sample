from pydantic import BaseModel, EmailStr


# Request to send passwordless email
class EmailRequest(BaseModel):
    email: EmailStr
    template: str = "SIGNIN"
    state: str = None
    expires_in: int = 300
    magiclink_auth_uri: str = None
    template_variables: dict = None


# Request to verify OTP
from pydantic import Field


class OTPVerifyRequest(BaseModel):
    code: str
    auth_request_id: str = Field(..., alias="authRequestId")

    model_config = {
        "populate_by_name": True
    }


# Request to verify magic link
class MagicLinkVerifyRequest(BaseModel):
    link_token: str
    auth_request_id: str = None


# Response from sending passwordless email
class PasswordlessSendResponse(BaseModel):
    auth_request_id: str
    expires_at: int
    expires_in: int
    passwordless_type: str


# Response from verification
class PasswordlessVerifyResponse(BaseModel):
    email: EmailStr
    state: str = None
    template: str = None
    passwordless_type: str = None
