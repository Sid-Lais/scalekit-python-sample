## Scalekit Python SDK – Passwordless Auth Returns Non-Serializable Tuple

**Problem:**
Passwordless methods (`send_passwordless_email`, `resend_passwordless_email`, `verify_passwordless_email`) return a tuple: `(protobuf_message, grpc._channel._MultiThreadedRendezvous)`. Neither element is directly JSON-serializable or Python-native.

**Why this matters:**
- Python web frameworks (FastAPI, Flask, Django) expect dicts or models for API responses.
- The protobuf message is not a dict; the gRPC object is not useful to the caller and cannot be serialized.
- This forces every integrator to manually unpack and convert results, adding boilerplate and risk.
- Exposing gRPC internals is a security and abstraction leak.

**Expected:**
Each SDK method should return a plain Python dict or Pydantic model with all relevant fields (e.g. `auth_request_id`, `expires_at`, `expires_in`, `passwordless_type`).

**Minimal reproduction:**
```python
from scalekit import ScalekitClient
client = ScalekitClient(...)
resp = client.send_passwordless_email(email="test@example.com", template="default")
print(type(resp), resp)
# <class 'tuple'>, (<protobuf_message>, <_MultiThreadedRendezvous ...>)
```

**Fix:**
Unpack the protobuf message in the SDK and return a dict/model. Do not return or expose gRPC internals in the public API.

**Example output/log:**

```
[SDK RAW RESPONSE] (auth_request_id: "jCIEe_blEGU1wma5KuwZO7Z4Mo1UjBgtsYD7Gu_jEsbP8rIiyA"
expires_at: 1754995719
expires_in: 300
passwordless_type: LINK_OTP
, <_MultiThreadedRendezvous of RPC that terminated with:
        status = StatusCode.OK
        details = ""
>) <class 'tuple'>
```

**Framework error caused by SDK output:**

```
[SDK RAW RESPONSE] (auth_request_id: "xgJgz5rIyabY0Qi9mDf_fcosdAj__iRemub8Ove_TdkvcngX-A"
expires_at: 1754995621
expires_in: 300
passwordless_type: LINK_OTP
, <_MultiThreadedRendezvous ...>) <class 'tuple'>

fastapi.exceptions.ResponseValidationError: 4 validation errors:
  {'type': 'missing', 'loc': ('response', 'auth_request_id'), 'msg': 'Field required', ...}
  {'type': 'missing', 'loc': ('response', 'expires_at'), 'msg': 'Field required', ...}
  {'type': 'missing', 'loc': ('response', 'expires_in'), 'msg': 'Field required', ...}
  {'type': 'missing', 'loc': ('response', 'passwordless_type'), 'msg': 'Field required', ...}
```

- The SDK returns a tuple, not a dict/model, so FastAPI cannot match the expected response fields and raises a validation error.
- This demonstrates that the SDK's return type is not compatible with Python API frameworks and breaks contract-based response validation.

**How to see the full framework error log:**

- Uncomment or restore the `response_model=PasswordlessSendResponse` (or similar) on the relevant FastAPI endpoint in `app/routes/auth.py`.
- Trigger the endpoint via the UI or API.
- The server log will show a `ResponseValidationError` and stack trace, demonstrating that the SDK’s tuple output cannot be validated or serialized by FastAPI.
