import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oneheart.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import EmailOTP

User = get_user_model()
user = User.objects.first()

if user:
    print(f"Testing with user: {user.email}")
    # Create OTP
    code = EmailOTP.generate_code()
    EmailOTP.objects.create(user=user, code=code)
    print(f"Created OTP: {code}")

    # Verify OTP
    otp_record = EmailOTP.objects.filter(
        user=user, 
        code=code, 
        is_used=False
    ).order_by('-created_at').first()

    if otp_record:
        print(f"Found OTP record: {otp_record}")
        otp_record.is_used = True
        otp_record.save()
        print("OTP verified and marked as used.")
    else:
        print("Failed to find OTP record.")
else:
    print("No users found to test.")
