
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.core.scalekit import (resend_passwordless_email,
                               send_passwordless_email,
                               verify_passwordless_email)
from app.models.auth import (EmailRequest, MagicLinkVerifyRequest,
                             OTPVerifyRequest, PasswordlessSendResponse,
                             PasswordlessVerifyResponse)

router = APIRouter()

# Send passwordless email (magic link or OTP)
@router.post("/send-passwordless")
async def send_passwordless(req: EmailRequest):
    try:
        magiclink_auth_uri = req.magiclink_auth_uri or "http://localhost:3000/passwordless/verify"
        resp = await send_passwordless_email(
            email=req.email,
            template=req.template,
            state=req.state,
            expires_in=req.expires_in,
            magiclink_auth_uri=magiclink_auth_uri,
            template_variables=req.template_variables
        )
        print("[SDK RAW RESPONSE]", resp, type(resp))
        return {
            "sdk_response": str(resp),
            "sdk_response_type": str(type(resp)),
            "sdk_response_repr": repr(resp)
        }
    except Exception as e:
        import traceback
        print("[ERROR] Exception in send_passwordless:", e)
        traceback.print_exc()
        return {
            "error": str(e),
            "error_type": str(type(e)),
            "traceback": traceback.format_exc()
        }

# Resend passwordless email
@router.post("/resend-passwordless")
async def resend_passwordless(auth_request_id: str):
    try:
        resp = await resend_passwordless_email(auth_request_id)
        print("[SDK RAW RESPONSE]", resp, type(resp))
        return {
            "sdk_response": str(resp),
            "sdk_response_type": str(type(resp)),
            "sdk_response_repr": repr(resp)
        }
    except Exception as e:
        import traceback
        print("[ERROR] Exception in resend_passwordless:", e)
        traceback.print_exc()
        return {
            "error": str(e),
            "error_type": str(type(e)),
            "traceback": traceback.format_exc()
        }

# Verify OTP
@router.post("/verify-otp")
async def verify_otp(req: OTPVerifyRequest):
    # Defensive: check for missing auth_request_id
    if not req.auth_request_id:
        return {
            "error": "Missing required field: auth_request_id. You must send both 'code' and 'auth_request_id' in the request body. Example: { 'code': '123456', 'auth_request_id': 'YOUR_AUTH_REQUEST_ID' }",
            "error_type": "validation"
        }
    try:
        print("/verify-otp received:", req)
        resp = await verify_passwordless_email(code=req.code, auth_request_id=req.auth_request_id)
        print("[SDK RAW RESPONSE]", resp, type(resp))
        return {
            "sdk_response": str(resp),
            "sdk_response_type": str(type(resp)),
            "sdk_response_repr": repr(resp)
        }
    except Exception as e:
        import traceback
        print("[ERROR] Exception in verify_otp:", e)
        traceback.print_exc()
        return {
            "error": str(e),
            "error_type": str(type(e)),
            "traceback": traceback.format_exc()
        }

# Verify magic link
@router.post("/verify-magic-link")
async def verify_magic_link(req: MagicLinkVerifyRequest):
    try:
        resp = await verify_passwordless_email(link_token=req.link_token, auth_request_id=req.auth_request_id)
        print("[SDK RAW RESPONSE]", resp, type(resp))
        return {
            "sdk_response": str(resp),
            "sdk_response_type": str(type(resp)),
            "sdk_response_repr": repr(resp)
        }
    except Exception as e:
        import traceback
        print("[ERROR] Exception in verify_magic_link:", e)
        traceback.print_exc()
        return {
            "error": str(e),
            "error_type": str(type(e)),
            "traceback": traceback.format_exc()
        }



# Session and logout endpoints (dummy)
@router.get("/session")
async def get_session():
    return {"email": None}

@router.post("/logout")
async def logout():
    return {"message": "Logged out"}
